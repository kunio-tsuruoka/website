// フォーム送信時に「どこから来たか」を捕捉するための first-touch アトリビューション。
// contact API はペイロードに無い情報を保存できないため、入口ページ・参照元・UTM・GA client_id を
// クライアントで集めて /api/contact に同送し、Slack 通知に載せる。
// user_id を持たない設計（.claude/rules/analytics-ga4.md）のため、GA client_id が
// GA4 探索との後追い照合の唯一の手がかりになる。

const FIRST_TOUCH_KEY = 'beekle-first-touch-v1';

type FirstTouch = {
  landingPage: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  ts: number;
};

export type Attribution = {
  clientId: string;
  landingPage: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

// セッション最初のページで入口情報を記録する（冪等。layout から全ページで呼ぶ）。
// 既に記録済みなら何もしないので、回遊後にフォーム到達しても「最初に踏んだ外部参照元」が残る。
export function captureFirstTouch(): void {
  if (typeof window === 'undefined') return;
  try {
    if (window.sessionStorage.getItem(FIRST_TOUCH_KEY)) return;
    const sp = new URLSearchParams(window.location.search);
    const data: FirstTouch = {
      landingPage: window.location.pathname + window.location.search,
      // 同一オリジンからの遷移後に記録しても、初回呼び出し時点の referrer は外部参照元になる
      referrer: document.referrer || '',
      utmSource: sp.get('utm_source') || '',
      utmMedium: sp.get('utm_medium') || '',
      utmCampaign: sp.get('utm_campaign') || '',
      ts: Date.now(),
    };
    window.sessionStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(data));
  } catch {
    // プライベートモード等で sessionStorage が使えない場合は黙って諦める（計測は best-effort）
  }
}

function readFirstTouch(): Partial<FirstTouch> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(FIRST_TOUCH_KEY);
    return raw ? (JSON.parse(raw) as Partial<FirstTouch>) : {};
  } catch {
    return {};
  }
}

// `_ga` クッキー（GA1.1.<part1>.<part2>）から GA4 client_id（<part1>.<part2>）を取り出す。
export function getGaClientId(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)_ga=([^;]+)/);
  if (!match) return '';
  const parts = match[1].split('.');
  if (parts.length >= 4) return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  return '';
}

const cap = (value: string, max: number): string =>
  value.length > max ? value.slice(0, max) : value;

// フォーム送信ペイロードに添えるアトリビューション一式を返す。
export function getAttribution(): Attribution {
  const ft = readFirstTouch();
  return {
    clientId: getGaClientId(),
    landingPage: cap(ft.landingPage || '', 300),
    referrer: cap(ft.referrer || '', 300),
    utmSource: cap(ft.utmSource || '', 80),
    utmMedium: cap(ft.utmMedium || '', 80),
    utmCampaign: cap(ft.utmCampaign || '', 120),
  };
}
