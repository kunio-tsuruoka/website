// scripts/patch-ears-japanese.mjs
// requirements-definition-template のEARS例を、英語キーワード混在から日本語EARSへ変換する。
//   node --env-file=.env scripts/patch-ears-japanese.mjs          # dry-run
//   node --env-file=.env scripts/patch-ears-japanese.mjs --apply  # PATCH送信
//
// 方針: 行単位の完全一致置換（各行は記事内で一意）。置換後に英語キーワード
//   (shall/WHEN/WHILE/WHERE/THEN/THE システム) が残っていないことをassertする。
//   ears-requirements-syntax-guide はバイリンガル教材のため対象外（英語を残す）。
import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');
const SLUG = 'requirements-definition-template';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

// [old, new] の行単位置換。順序は問わない（各oldは記事内で一意）。
const REPLACEMENTS = [
  [
    'The システム shall すべての通信をTLS 1.2以上で暗号化する。',
    'システムは、すべての通信をTLS 1.2以上で暗号化すること。',
  ],
  ['WHEN ユーザーがログインボタンを押した時、', 'ユーザーがログインボタンを押したとき、'],
  [
    'THE システム shall 認証サーバーに認証リクエストを送る。',
    'システムは、認証サーバーに認証リクエストを送ること。',
  ],
  ['WHILE ユーザーがログイン済みの間、', 'ユーザーがログイン済みである間、'],
  [
    'THE システム shall マイページへのリンクを表示する。',
    'システムは、マイページへのリンクを表示すること。',
  ],
  ['WHERE 二要素認証が有効な場合、', '二要素認証が有効な場合、'],
  [
    'THE システム shall ログイン後にOTP入力を要求する。',
    'システムは、ログイン後にOTP入力を要求すること。',
  ],
  ['IF 認証に5回連続で失敗した場合、', '認証に5回連続で失敗した場合、'],
  [
    'THEN THE システム shall 当該アカウントを15分間ロックする。',
    'システムは、当該アカウントを15分間ロックすること。',
  ],
  [
    'WHEN ユーザーが「パスワードを忘れた」リンクを押した時、',
    'ユーザーが「パスワードを忘れた」リンクを押したとき、',
  ],
  [
    'THE システム shall メールアドレス入力フォームを表示する。',
    'システムは、メールアドレス入力フォームを表示すること。',
  ],
  [
    'WHEN ユーザーが登録済みのメールアドレスを送信した時、',
    'ユーザーが登録済みのメールアドレスを送信したとき、',
  ],
  [
    'THE システム shall 1時間有効な再設定リンクを当該メールアドレスに送付する。',
    'システムは、1時間有効な再設定リンクを当該メールアドレスに送付すること。',
  ],
  ['IF 入力されたメールアドレスが未登録の場合、', '入力されたメールアドレスが未登録の場合でも、'],
  [
    'THEN THE システム shall 「該当メールアドレスは登録されていません」とは表示せず、登録の有無に関わらず同じ完了メッセージを表示する。',
    'システムは、登録の有無にかかわらず同じ完了メッセージを表示すること（「該当メールアドレスは登録されていません」とは表示しない）。',
  ],
  // 効果セクションの英語キーワード列挙を日本語の前置句に
  [
    '「〜できるようにする」「〜を考慮する」のような <strong>解釈余地のある日本語</strong> が、IF/WHEN/WHILE/WHEREの前置句で <strong>発火条件</strong> が明確になります。',
    '「〜できるようにする」「〜を考慮する」のような <strong>解釈余地のある書き方</strong> を避け、「〜したとき」「〜の間」「〜の場合」「もし〜したら」という前置句で <strong>発火条件</strong> を明確にします。',
  ],
];

const LEFTOVER_MARKERS = [
  /\bshall\b/i,
  /\bWHEN\b/,
  /\bWHILE\b/,
  /\bWHERE\b/,
  /\bTHEN\b/,
  /THE システム/,
  /The システム/,
];

async function main() {
  const col = await client.get({
    endpoint: 'columns',
    contentId: SLUG,
    queries: { fields: 'id,title,content' },
  });
  if (col.id !== SLUG) throw new Error(`ID mismatch: ${col.id}`);
  console.log(`TITLE: ${col.title}`);

  let content = col.content;
  let missing = 0;
  for (const [oldStr, newStr] of REPLACEMENTS) {
    if (!content.includes(oldStr)) {
      console.log(`  MISS  not found: ${oldStr.slice(0, 40)}...`);
      missing++;
      continue;
    }
    content = content.split(oldStr).join(newStr);
    console.log(`  OK    ${oldStr.slice(0, 36)}... -> ${newStr.slice(0, 36)}...`);
  }

  const leftovers = LEFTOVER_MARKERS.map((m) => [
    m.source,
    (content.match(new RegExp(m, `g${m.flags.includes('i') ? 'i' : ''}`)) || []).length,
  ]).filter(([, n]) => n > 0);
  console.log(`\n  missing replacements: ${missing}`);
  console.log(`  remaining EN markers: ${leftovers.length ? JSON.stringify(leftovers) : 'none'}`);
  console.log(`  content ${col.content.length} -> ${content.length}`);

  if (missing > 0 || leftovers.length > 0) {
    console.log(
      '\n  STOP: 未置換 or 英語キーワード残存。置換文字列を見直してください（PATCHしない）。'
    );
    return;
  }
  if (!APPLY) {
    console.log('\n  DRY-RUN: --apply で実際にPATCH送信');
    return;
  }
  await client.update({ endpoint: 'columns', contentId: SLUG, content: { content } });
  const verify = await client.get({
    endpoint: 'columns',
    contentId: SLUG,
    queries: { fields: 'content' },
  });
  const stillThere = LEFTOVER_MARKERS.some((m) => m.test(verify.content));
  console.log(`  PATCH OK / verify EN markers gone = ${!stillThere}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
