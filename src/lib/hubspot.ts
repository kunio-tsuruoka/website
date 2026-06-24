// HubSpot CRM へのリード同期（ベストエフォート）。
// /api/contact から Slack 通知と並べて呼び出す。HubSpot 側が落ちても
// 問い合わせ自体は失敗させない（呼び出し側で waitUntil / catch する前提）。
//
// 依存ゼロ（raw fetch）。標準プロパティのみ使うので HubSpot 側の事前設定は不要。
// 後々 ERP 連携する時は、ここで作られた Contact / Deal を CRM API か Webhook で読む。

const HUBSPOT_BASE = 'https://api.hubapi.com';
const REQUEST_TIMEOUT_MS = 6000;

export type HubSpotEnv = {
  HUBSPOT_ACCESS_TOKEN?: string;
  // 営業パイプライン / ステージ ID。未指定なら送らず、HubSpot のデフォルト
  // パイプライン初期ステージに任せる（固定ラベルを送って 400 になるのを防ぐ）。
  // 特定ステージに入れたい時だけ指定する。ID は GET /crm/v3/pipelines/deals で確認。
  HUBSPOT_DEAL_PIPELINE?: string;
  HUBSPOT_DEAL_STAGE?: string;
};

export type HubSpotLead = {
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  message: string;
  typeLabel?: string;
  source?: string;
  intent?: string;
  phase?: string;
  landingPage?: string;
  referrer?: string;
  utm?: string;
  clientId?: string;
};

type HubSpotResult = { ok: boolean; contactId?: string; dealId?: string; detail?: string };

async function hubspotFetch(
  token: string,
  path: string,
  method: string,
  body: unknown
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${HUBSPOT_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body == null ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

// email を idProperty にして upsert する。存在すれば PATCH、無ければ POST で作成。
async function upsertContact(token: string, lead: HubSpotLead): Promise<string> {
  const properties: Record<string, string> = { email: lead.email };
  if (lead.name) properties.firstname = lead.name;
  if (lead.phone) properties.phone = lead.phone;
  if (lead.company) properties.company = lead.company;

  const patch = await hubspotFetch(
    token,
    `/crm/v3/objects/contacts/${encodeURIComponent(lead.email)}?idProperty=email`,
    'PATCH',
    { properties }
  );
  if (patch.ok) {
    const data = (await patch.json()) as { id: string };
    return data.id;
  }
  if (patch.status !== 404) {
    const text = await patch.text().catch(() => '');
    throw new Error(`contact upsert ${patch.status}: ${text || 'no body'}`);
  }

  // 未存在 → 新規作成
  const post = await hubspotFetch(token, '/crm/v3/objects/contacts', 'POST', { properties });
  if (!post.ok) {
    const text = await post.text().catch(() => '');
    throw new Error(`contact create ${post.status}: ${text || 'no body'}`);
  }
  const data = (await post.json()) as { id: string };
  return data.id;
}

function buildDealDescription(lead: HubSpotLead): string {
  const attribution = [
    lead.source ? `経由元: ${lead.source}` : '',
    lead.intent ? `intent: ${lead.intent}` : '',
    lead.phase ? `phase: ${lead.phase}` : '',
    lead.landingPage ? `着地: ${lead.landingPage}` : '',
    lead.referrer ? `参照元: ${lead.referrer}` : '',
    lead.utm ? `UTM: ${lead.utm}` : '',
    lead.clientId ? `GA cid: ${lead.clientId}` : '',
  ].filter(Boolean);

  const sections = [
    lead.typeLabel ? `種別: ${lead.typeLabel}` : '',
    lead.message,
    attribution.length > 0 ? ['--- 流入 ---', ...attribution].join('\n') : '',
  ].filter(Boolean);

  return sections.join('\n\n');
}

// Deal を作成し、同時に Contact へ関連付ける（HUBSPOT_DEFINED deal_to_contact = 3）。
async function createDeal(
  token: string,
  contactId: string,
  lead: HubSpotLead,
  env: HubSpotEnv
): Promise<string> {
  const properties: Record<string, string> = {
    dealname: `Web問い合わせ: ${lead.name || lead.email}`,
    description: buildDealDescription(lead),
  };
  // pipeline / dealstage は env で明示された時だけ送る。
  // 未指定で固定ラベル（旧: 'appointmentscheduled'）を送ると、ポータルが
  // カスタムパイプライン（数値ステージID）の場合に存在しない値となり
  // Deal 作成が 400 INVALID_OPTION になる。送らなければ HubSpot が
  // デフォルトパイプラインの初期ステージへ自動配置する。
  if (env.HUBSPOT_DEAL_PIPELINE) properties.pipeline = env.HUBSPOT_DEAL_PIPELINE;
  if (env.HUBSPOT_DEAL_STAGE) properties.dealstage = env.HUBSPOT_DEAL_STAGE;

  const res = await hubspotFetch(token, '/crm/v3/objects/deals', 'POST', {
    properties,
    associations: [
      {
        to: { id: contactId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
      },
    ],
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`deal create ${res.status}: ${text || 'no body'}`);
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}

// 問い合わせを HubSpot に同期する。失敗しても throw せず結果オブジェクトで返す。
export async function syncLeadToHubSpot(
  token: string,
  lead: HubSpotLead,
  env: HubSpotEnv = {}
): Promise<HubSpotResult> {
  try {
    const contactId = await upsertContact(token, lead);
    let dealId: string | undefined;
    try {
      dealId = await createDeal(token, contactId, lead, env);
    } catch (dealErr) {
      // Contact は作れたが Deal 作成に失敗（パイプライン/ステージ ID 不一致など）。
      // Contact 同期は成功扱いにして、Deal 失敗だけ記録する。
      console.error(
        '[hubspot] deal create failed:',
        dealErr instanceof Error ? dealErr.message : dealErr
      );
    }
    return { ok: true, contactId, dealId };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error('[hubspot] sync failed:', detail);
    return { ok: false, detail };
  }
}
