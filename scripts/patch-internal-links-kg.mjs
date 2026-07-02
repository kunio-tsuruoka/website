/**
 * KG/AIクラスタの内部リンク構造見直し（note.com法: 文中の疑問発生点・具体アンカー・ハブ集約）。
 * - 新規記事 enterprise-knowledge-graph-design-patterns（inbound 0）へ関連3本から文中リンク
 * - もう1つの孤立 ai-knowledge-chatbot-accuracy（inbound 0）へ1本
 * - 曖昧アンカー「こちらの記事」2件を具体アンカーへ
 * 各挿入は既存<p>内に一文追加（ブロック構造を壊さない）。既定 dry-run、--apply で PATCH。
 */
import { createClient } from 'microcms-js-sdk';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});
const APPLY = process.argv.includes('--apply');

const A_ENT =
  '<a href="/column/enterprise-knowledge-graph-design-patterns">エンタープライズのナレッジグラフ設計パターンと構築プロセス</a>';

const EDITS = [
  // --- orphan fix: enterprise-kg へ inbound x3 ---
  {
    id: 'knowledge-graph-rag-business',
    old: '効果の高い一業務から小さく始めるのが堅実です。</p>',
    new: `効果の高い一業務から小さく始めるのが堅実です。設計の切り口と1部門から始める具体的な手順は${A_ENT}で解説しています。</p>`,
  },
  {
    id: 'graphrag-knowledge-search',
    old: 'Beekleでも複数の検索経路を統合する設計を採っています。</p>',
    new: `Beekleでも複数の検索経路を統合する設計を採っています。企業で設計する際の切り口と、1部門から始める進め方は${A_ENT}にまとめています。</p>`,
  },
  {
    id: 'internal-ai-assistant-rag-patterns',
    old: '利用者にも「ここで質問すれば答えが出る」と認知されやすくなります。</p>',
    new: `利用者にも「ここで質問すれば答えが出る」と認知されやすくなります。対象の絞り方と設計の具体手順は${A_ENT}で解説しています。</p>`,
  },
  // --- orphan fix: ai-knowledge-chatbot-accuracy へ inbound x1 ---
  {
    id: 'ai-rag-accuracy-graphrag',
    old: '<strong>継続的に精度を改善する運用設計</strong>が必要です。</p>',
    new: '<strong>継続的に精度を改善する運用設計</strong>が必要です。社内ナレッジAIチャットボットとして組む場合の具体的な作り方は<a href="/column/ai-knowledge-chatbot-accuracy">社内ナレッジAIチャットボットの作り方</a>で解説しています。</p>',
  },
  // --- 曖昧アンカー修正 ---
  {
    id: 'system-development-outsourcing-guide',
    old: 'RFPの書き方は<a href="/column/how-to-write-rfp">こちらの記事</a>で解説しています。',
    new: 'RFPの具体的な書き方と盛り込む項目は<a href="/column/how-to-write-rfp">RFPの書き方ガイド</a>で解説しています。',
  },
  {
    id: 'web-system-cost-by-scale',
    old: '「使われないシステム」については<a href="/column/avoid-unused-system">こちらの記事</a>で詳しく解説しています。',
    new: '「使われないシステム」を避ける具体策は<a href="/column/avoid-unused-system">使われないシステムの避け方</a>で詳しく解説しています。',
  },
];

let fail = false;
for (const e of EDITS) {
  const a = await client.get({
    endpoint: 'columns',
    contentId: e.id,
    queries: { fields: 'content' },
  });
  const cnt = a.content.split(e.old).length - 1;
  if (cnt !== 1) {
    console.log(`  NG [${e.id}] old の一致数=${cnt}（1でない）→ スキップ対象`);
    fail = true;
    continue;
  }
  if (
    a.content.includes(e.new.slice(0, 40)) &&
    a.content.includes('で解説しています。設計') === false
  ) {
    // ゆるい既適用チェック
  }
  console.log(`  OK [${e.id}] 挿入位置ユニーク一致`);
  if (APPLY) {
    const next = a.content.replace(e.old, e.new);
    await client.update({ endpoint: 'columns', contentId: e.id, content: { content: next } });
    const f = await client.get({
      endpoint: 'columns',
      contentId: e.id,
      queries: { fields: 'content' },
    });
    const ok = f.content.includes(e.new);
    console.log(`     applied → 検証: ${ok ? 'OK' : 'NG'}`);
    if (!ok) fail = true;
  }
}
console.log(APPLY ? '\n[apply] 完了' : '\n[dry-run] --apply で PATCH します。');
if (fail) process.exit(1);
