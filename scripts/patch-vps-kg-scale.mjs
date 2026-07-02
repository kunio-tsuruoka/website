/**
 * genai-system-infrastructure の大規模時ブロックを是正する (2026-07-01, rev3 / ファクトチェック反映)
 * rev2の誤り: 「マネージドが要るのは超大規模から」= 言い過ぎ。
 * Neo4j公式(neo4j.com/product/auradb)確認: AuraDBは規模に関係なく運用を肩代わりする
 *  （自動バックアップ+PITR / 無停止アップグレード+セキュリティ更新 / 99.95%稼働率SLA / 自動スケール /
 *   インフラ管理不要 / 無料枠あり・有料はGB単位の従量課金）。
 * → 正: マネージドは規模を問わず運用が楽になる。ただし従量課金で自前VPS(固定費)より割高になりやすい＝
 *   手間 vs コストのトレードオフ。VPS自前は安さで依然デフォルト足り得る。
 *
 *   node --env-file=.env scripts/patch-vps-kg-scale.mjs          # dry-run
 *   node --env-file=.env scripts/patch-vps-kg-scale.mjs --apply  # PATCH
 */
import { createClient } from 'microcms-js-sdk';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const DRY_RUN = !process.argv.includes('--apply');
const SLUG = 'genai-system-infrastructure';

// rev2 の現ブロック（h3〜末尾</p>）をまるごと差し替える
const OLD_RE =
  /<h3[^>]*>鮮度管理・品質監視・アクセス制御はVPSでもできる[\s\S]*?運用まで含めてVPSで十分に回せます。<\/p>/;

const NEW_BLOCK = `<h3>鮮度管理・品質監視・アクセス制御はVPSでもできる。マネージドは運用の手間を減らす選択肢</h3>
<p>ナレッジグラフ（GraphRAG）は作って終わりではなく、次のような継続運用が必要です。ただし、これらはVPS構成のままでも実装・運用できます。私たち自身が使っている業務システムでも、VPS上でこれらを回しています。</p>
<ul>
<li><strong>鮮度管理</strong>：データソースとの同期パイプラインを組み、元データの更新をグラフに反映し続ける</li>
<li><strong>品質監視</strong>：孤立ノードや重複エンティティを定期的に検出して整える</li>
<li><strong>スキーマ進化</strong>：ユースケースの追加に合わせてオントロジー（概念の設計）を広げる</li>
<li><strong>アクセス制御</strong>：チーム・ロール別に閲覧範囲を設定する</li>
</ul>
<p>一方で、マネージドサービス（Neo4j AuraDBなど）を使うと、バックアップやポイントインタイムのリカバリ、無停止でのアップグレードとセキュリティ更新、稼働率のSLA、スケール調整を自動で肩代わりしてくれます。規模の大小にかかわらず、運用の手間は確実に軽くなります。ただし月額の従量課金がかかるため、固定費で回せる自前のVPSより割高になりやすいのも事実です（小規模向けの無料枠もあります）。つまり「運用の手間を減らしたい・可用性を強く求める・急なスケールに備えたい」ならマネージド、「コストを最優先で、運用も自前で回せる」ならVPS、という手間とコストのトレードオフです。データ量やアクセスが大きく、可用性の要求が上がるほど、マネージドの方が結果的に割に合います。</p>`;

const cur = await client.get({
  endpoint: 'columns',
  contentId: SLUG,
  queries: { fields: 'content' },
});
const content = cur.content || '';

if (content.includes('マネージドは運用の手間を減らす選択肢')) {
  console.log('[skip] 既に是正済み(rev3)');
  process.exit(0);
}
if (!OLD_RE.test(content)) {
  console.error('[NG] 現ブロックが見つからない（手動確認）');
  process.exit(1);
}

const next = content.replace(OLD_RE, NEW_BLOCK);
console.log(`モード: ${DRY_RUN ? 'DRY-RUN' : 'APPLY'}`);
const at = next.indexOf('マネージドは運用の手間を減らす選択肢');
console.log(`差し替え後 該当付近:\n...${next.slice(at - 6, at + 360)}...`);

if (!DRY_RUN) {
  await client.update({ endpoint: 'columns', contentId: SLUG, content: { content: next } });
  const ver = await client.get({
    endpoint: 'columns',
    contentId: SLUG,
    queries: { fields: 'content' },
  });
  const ok =
    ver.content.includes('稼働率のSLA') &&
    ver.content.includes('手間とコストのトレードオフ') &&
    !ver.content.includes('マネージドが要るのは超大規模から');
  console.log(
    `\n[OK] PATCH完了 / 検証: rev3反映 ${ok ? 'OK' : '★要確認'} / ${ver.content.length}字`
  );
}
