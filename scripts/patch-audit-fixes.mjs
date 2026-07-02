// Live MicroCMS PATCH for audit findings (drafts-audit-2026-05-10.md)
// Each fix is a string replacement that is verified to be unique in source content.
// Run dry-run first: `node scripts/patch-audit-fixes.mjs`
// Apply: `node scripts/patch-audit-fixes.mjs --apply`

import 'dotenv/config';
import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const FIXES = [
  {
    id: 'sme-data-driven-management',
    label: '失敗する3パターン → 5パターン',
    replacements: [['失敗する3パターン', '失敗する5パターン']],
  },
  {
    id: 'churn-prediction-guide',
    label: '脳の処理負荷 + 失敗する3パターン',
    replacements: [
      ['脳の処理負荷の自然な結果として', 'サービス利用の自然な結果として'],
      ['失敗する3パターン', '失敗する5パターン'],
    ],
  },
  {
    id: 'cdp-explained',
    label: 'リンクテキスト本番タイトル整合',
    replacements: [
      [
        'CDP製品の選び方｜Treasure Data・Salesforce CDP・自社開発の比較',
        'CDP比較・選び方ガイド｜Treasure Data・Salesforce CDP・自社開発の3パターンを徹底比較',
      ],
      [
        'CDP構築の費用と期間の目安</a>',
        'CDP（顧客データ基盤）構築の費用と期間の目安｜中小企業から中堅企業までの現実解</a>',
      ],
    ],
  },
  {
    id: 'data-quality-trap',
    label: '名寄れ漏れ → 名寄せ漏れ',
    replacements: [['名寄れ漏れ', '名寄せ漏れ']],
  },
  {
    id: 'demand-forecast-inventory-cost',
    label: '全社で月5,000個 → 2,300個',
    replacements: [['全社で月5,000個売れる', '全社で月2,300個売れる']],
  },
  {
    id: 'new-business-system-cost-minimize',
    label: '登場し → 定着し',
    replacements: [['AI駆動開発）が登場し', 'AI駆動開発）が定着し']],
  },
  {
    // Special block replacement: replace last CONTACT_CTA_MID + 公開予定 list
    // with proper related-articles list + final CONTACT_CTA.
    id: 'how-to-write-rfp',
    label: '末尾 関連記事「公開予定」整理 + final CONTACT_CTA 追加',
    replacements: [
      [
        // unique full block (verified by inspection above)
        '{{CONTACT_CTA_MID}}</p><h2 id="hdc29ba7915">関連記事</h2><ul><li>ベンダー比較表の作り方｜評価軸の重み付け実例（公開予定）</li><li>IPA非機能要求グレードを中堅企業の発注で実際に使う方法（公開予定）</li><li>準委任と請負の違い｜発注者が選ぶ判断軸（公開予定）</li><li>提案書を読む観点｜引っかかる人と引っかからない人の差（公開予定）</li><li>評価会議の進め方｜恣意性を排除する仕組み（公開予定）</li><li>RFP配布後の質疑応答（Q&amp;A）運用ガイド（公開予定）</li></ul>',
        [
          '</p>',
          '<h2>関連記事</h2>',
          '<ul>',
          '<li><a href="/column/dx-failure-patterns">DX・システム開発で失敗する典型5パターン｜発注前に潰すチェックリスト</a></li>',
          '<li><a href="/column/avoid-unused-system">「作ったのに使われないシステム」を防ぐ要件絞り込み術｜FM法とユーザー視点</a></li>',
          '<li><a href="/column/ai-development-vendor-selection">生成AI開発会社の選び方｜失敗しない発注先比較7つのポイント</a></li>',
          '</ul>',
          '<p>{{CONTACT_CTA}}</p>',
        ].join('\n'),
      ],
    ],
  },
];

async function processOne(fix) {
  const orig = await client.get({
    endpoint: 'columns',
    contentId: fix.id,
    queries: { fields: 'id,content' },
  });
  let content = orig.content || '';
  const log = [];
  for (const [from, to] of fix.replacements) {
    const count = content.split(from).length - 1;
    if (count === 0) {
      log.push(`  SKIP (0 hit): ${JSON.stringify(from).slice(0, 80)}`);
      continue;
    }
    if (count > 1) {
      log.push(`  ABORT (${count} hits, not unique): ${JSON.stringify(from).slice(0, 80)}`);
      return { id: fix.id, ok: false, log };
    }
    content = content.replace(from, to);
    log.push(`  OK 1×: ${JSON.stringify(from).slice(0, 60)} → ${JSON.stringify(to).slice(0, 60)}`);
  }
  if (content === orig.content) {
    return { id: fix.id, ok: true, log: [...log, '  (no change)'], skipped: true };
  }
  if (APPLY) {
    await client.update({ endpoint: 'columns', contentId: fix.id, content: { content } });
    log.push('  PATCHED');
  } else {
    log.push('  (dry-run, would PATCH)');
  }
  return { id: fix.id, ok: true, log };
}

(async () => {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log('---');
  let okCount = 0;
  let failCount = 0;
  for (const fix of FIXES) {
    console.log(`[${fix.id}] ${fix.label}`);
    const r = await processOne(fix);
    for (const line of r.log) console.log(line);
    if (r.ok) okCount++;
    else failCount++;
  }
  console.log('---');
  console.log(`Done: ${okCount} ok, ${failCount} failed`);
  if (!APPLY) console.log('Re-run with --apply to perform PATCHes.');
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
