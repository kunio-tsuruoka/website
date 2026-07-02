/**
 * knowledge-graph-rag-business に「Beekleでのナレッジシステムの進め方」節を追加する。
 * Beekle 実際のフロー: NDA → フィージビリティ検証 → PoCを準委任で開始 → PoC/検証 → オントロジー改善・全社展開。
 *
 * 既定 dry-run。--apply で MicroCMS へ PATCH。
 * FAQ 見出しの直前に挿入する（教育 → 進め方 → FAQ → Beekleの取り組み → CTA の流れ）。
 */
import { createClient } from 'microcms-js-sdk';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const ID = 'knowledge-graph-rag-business';
const APPLY = process.argv.includes('--apply');

// FAQ 見出しをアンカーに、その直前へ挿入する。
const FAQ_ANCHOR = '<h2 id="h4b68d6d3c5">よくある質問（FAQ）</h2>';

const SECTION = `
<h2>Beekleでのナレッジシステムの進め方</h2>
<p>ナレッジグラフを組み込んだ社内AI（ナレッジシステム）は、最初から完成形を設計しきれるものではありません。どの情報を、どの関係でつなぐと現場の問いに答えられるか（オントロジーの設計）は、実際のデータを触りながら見極める部分が大きいからです。Beekleは、機密を守りながら小さく試し、効くと分かった業務にだけ投資を寄せる流れで進めます。私たちがナレッジシステムを手がけるときの実際の順序は次のとおりです。</p>
<h3>1. NDAを結び、本物のデータに触れる</h3>
<p>社内文書には人事・契約・取引先などの機密が含まれます。まずNDA（秘密保持契約）を結び、実データを扱える状態を作ります。ここをサンプルだけで済ませると、精度の当たりがつかず、あとの判断を誤ります。</p>
<h3>2. 小さく検証し、いけそうかを見極める</h3>
<p>対象にしたい業務の一部データで、ナレッジグラフを足す価値が出るかを確かめます。判断軸はこの記事で挙げた4つ、関係をたどる・数える・抜けを探す・根拠を示す、のどれに効くかです。筋が悪ければ、RAG単体で十分という結論も含めて率直にお伝えし、無理に大きな構築へは進めません。</p>
<h3>3. PoCを準委任契約でスタートする</h3>
<p>いけそうと判断できたら、本番を想定した小さな実証（PoC）を準委任契約で始めます。準委任は、完成物を先に約束する請負と違い、作業と時間に対して対価を払う契約です。ナレッジグラフの構築は、どのエンティティをどの関係で結ぶか（オントロジー）をデータを見ながら調整する探索的な工程を含みます。仕様を先に固めきる請負より、動きながら方向を決められる準委任のほうが、無駄な作り込みを避けられます。</p>
<h3>4. PoCと検証を回して、使える水準まで上げる</h3>
<p>実際の問いをパイロットユーザーに投げてもらい、回答品質・抜け漏れの拾い方・根拠の示され方を評価します。ここでエンティティの抽出精度やオントロジーを繰り返し調整し、業務で使える水準へ引き上げます。</p>
<h3>5. オントロジーを改善しながら全社へ広げる</h3>
<p>一業務で効果を確認できたら、対象を広げます。範囲が増えるほど、つなぎ方の設計（オントロジー）の手入れが効いてきます。改善を続けながら段階的に展開し、規程やデータが変わっても関係の側を更新すれば回答が最新に追従する状態を保ちます。</p>
<p>この順序の狙いは、機密を守ったうえで「効くかどうか」を早い段階で見極め、効く業務にだけ投資を寄せることです。全社を一度につなぐ構築は、コストが膨らむわりに使われずに終わりやすいためです。小さく始めて広げるので、最初の一歩の負担も軽く済みます。</p>
`.trim();

const current = await client.get({
  endpoint: 'columns',
  contentId: ID,
  queries: { fields: 'id,title,content' },
});

if (current.content.includes('Beekleでのナレッジシステムの進め方')) {
  console.log('既に「進め方」節が存在します。中止。');
  process.exit(0);
}
if (!current.content.includes(FAQ_ANCHOR)) {
  console.error('FAQ アンカーが見つかりません。中止。');
  process.exit(1);
}

const next = current.content.replace(FAQ_ANCHOR, `${SECTION}\n${FAQ_ANCHOR}`);

console.log(`title: ${current.title}`);
console.log(`before bytes: ${current.content.length}`);
console.log(`after  bytes: ${next.length}`);
console.log('--- inserted section ---');
console.log(SECTION);

if (!APPLY) {
  console.log('\n[dry-run] --apply で PATCH します。');
  process.exit(0);
}

await client.update({ endpoint: 'columns', contentId: ID, content: { content: next } });
const fetched = await client.get({
  endpoint: 'columns',
  contentId: ID,
  queries: { fields: 'content' },
});
const ok =
  fetched.content.includes('Beekleでのナレッジシステムの進め方') &&
  fetched.content.includes('PoCを準委任契約でスタートする') &&
  fetched.content.includes('よくある質問（FAQ）') &&
  fetched.content.includes('{{CONTACT_CTA}}');
console.log(`\n[apply] PATCH 完了。検証: ${ok ? 'OK' : 'NG (要確認)'}`);
if (!ok) process.exit(1);
