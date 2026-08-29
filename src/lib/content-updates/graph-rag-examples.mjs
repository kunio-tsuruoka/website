export const GRAPH_RAG_EXAMPLES_HEADING =
  '「似ている」ではなく「どうつながっている」を聞く仕事がある';

const PM_ON_RAILS_HEADING = 'PM on Railsでは、検索より関係の方が難しい';

export const GRAPH_RAG_EXAMPLES_SECTION = `
<h2>${GRAPH_RAG_EXAMPLES_HEADING}</h2>

<p>ここまで読むと、通常のデータベース検索と全文検索で、かなりの質問へ答えられそうに見えます。では、情報同士の関係をつないだ仕組みは、いつ本気で必要になるのか。</p>

<p>答えは、<strong>一件の文書を見つければ終わるのではなく、複数種類の情報を何段もたどり、その経路自体を根拠として答える必要があるとき</strong>です。こうした関係を生成AIがたどり、必要な根拠を集めて回答する仕組みを、<a href="https://microsoft.github.io/graphrag/query/overview/" target="_blank" rel="noopener noreferrer">GraphRAG</a>と呼びます。</p>

<blockquote><p><strong>「似たものはどれ？」なら意味検索。<br>「何と何が、どの経路でつながっている？」なら関係をたどる検索。</strong></p></blockquote>

<p>特に、次の条件が重なるほど、通常の検索だけでは厳しくなります。</p>

<ul>
  <li>答えが、顧客・製品・契約・作業など複数種類の情報にまたがる</li>
  <li>何段たどれば答えが出るかが、質問ごとに変わる</li>
  <li>似ている上位数件ではなく、影響対象を漏れなく出す必要がある</li>
  <li>「なぜその結論になったか」を、つながりの経路で説明する必要がある</li>
</ul>

<p>データが多いから必要になるわけではありません。件数が少なくても、関係が深く、抜け漏れが事故につながるなら、グラフが効きます。</p>

<h3>不良部品から、回収すべき製品と顧客までたどる</h3>

<p>製造業で、ある部品の製造番号に不良が見つかったとします。知りたいのは、その番号が書かれた報告書ではありません。その部品がどの部品群へ組み込まれ、どの完成品に使われ、どこへ出荷され、誰へ届いたかです。</p>

<pre><code>不良部品の製造番号
  ↓ 組み込まれた
部品群
  ↓ 搭載された
完成品の製造番号
  ↓ 出荷された
倉庫・店舗
  ↓ 購入した
顧客</code></pre>

<p>全文検索なら、不良部品の番号が書かれた資料を見つけられます。意味検索なら、似た故障報告も探せます。でも、回収対象を出すときに必要なのは「似ている順の上位50件」ではありません。<strong>影響を受ける全件</strong>です。</p>

<p>この場合は、部品から製品、出荷、顧客までの関係を正確にたどる必要があります。<a href="https://neo4j.com/use-cases/supply-chain-management/" target="_blank" rel="noopener noreferrer">Neo4jの公式資料</a>でも、供給網における原材料・製品・出荷先の依存関係や、障害が広がる範囲の把握が、グラフ型データベースの代表的な用途として紹介されています。</p>

<h3>法改正から、直すべき規程・画面・研修資料までたどる</h3>

<p>法令や社内規程が変わったときも、変更した文書だけを見つければ終わりではありません。その規程を前提にしている業務手順、申請書、システムの入力条件、確認項目、研修資料まで直す必要があります。</p>

<pre><code>法改正
  ↓ 根拠にしている
社内規程
  ↓ 具体化している
業務手順・申請書
  ↓ 実装している
システムの画面・入力条件
  ↓ 確認している
テスト・研修資料</code></pre>

<p>関連文書に同じ言葉が書かれているとは限りません。規程には「保存期間を7年とする」とあり、システム側には単に削除可能日を計算する処理だけがあるかもしれない。文字列が一致しなくても、前提として依存しています。</p>

<p>ここで必要なのは、変更された言葉を探すことではなく、<strong>その変更を前提にしているものをたどること</strong>です。法改正、規程、業務、システム、確認項目の関係を持っていれば、影響範囲を一つの経路として出せます。</p>

<h3>システム障害から、原因となった変更までたどる</h3>

<p>たとえば、利用者が突然ログインできなくなったとします。エラーメッセージを検索すれば、似た障害記録は出てきます。でも、本当に知りたいのは、現在の障害がどのサービスに始まり、何へ依存し、直前のどの変更と関係しているかです。</p>

<pre><code>ログイン障害
  ↓ 利用している
認証サービス
  ↓ 依存している
証明書・設定
  ↓ 変更した
公開作業
  ↓ 含まれていた
コード変更・作業・担当者</code></pre>

<p>このつながりがあれば、「似た障害が以前にもあった」だけでなく、「今回影響している機能はどれか」「何を戻せばよいか」「誰が状況を確認できるか」まで答えられます。</p>

<p>実際には、監視記録、構成情報、公開履歴、作業記録をそれぞれ正式な情報として管理し、生成AIはその関係を読んで説明する形が安全です。全部を文章から推測し直す必要はありません。</p>

<h3>一件ずつ見ると普通な不正利用を、つながりで見つける</h3>

<p>不正利用は、一件だけ見ると普通に見えることがあります。別名義の複数アカウントが、同じ端末、電話番号、住所、振込先を少しずつ共有していた場合、個別の記録だけでは気づきにくいです。</p>

<pre><code>アカウントA ─ 同じ端末 ─ アカウントB
      │                         │
   同じ住所                 同じ振込先
      │                         │
アカウントC ─ 同じ電話番号 ─ アカウントD</code></pre>

<p>関係をつなぐと、別々に見えた利用者が一つの集団として見えてきます。<a href="https://neo4j.com/use-cases/fraud-detection/" target="_blank" rel="noopener noreferrer">Neo4jも</a>、不正集団、資金の循環、共有された端末や口座など、個別記録だけでは見えにくい関係をたどる用途を紹介しています。</p>

<p>ただし、不正かどうかの最終判断を生成AIだけへ任せる話ではありません。怪しいつながりの候補と、その根拠となる経路を出し、人が確認できるようにする。ここで重要なのは回答の派手さではなく、調査経路が残ることです。</p>

<h3>大型の法人営業で、意思決定のつながりをたどる</h3>

<p>法人営業も、案件が大きくなるほど関係の問題になります。窓口担当者だけで決まるとは限らず、利用部門、部門長、経営企画、経理、法務、情報システムなどが、それぞれ別の条件を持っています。</p>

<pre><code>窓口担当者
  ↓ 説明する
部門長
  ↓ 承認を求める
経営企画・経理
  ↓ 確認を求める
法務・情報システム
  ↓ 判断へ影響する
最終的な発注</code></pre>

<p>通常の顧客管理表で担当者や商談段階を管理するだけなら、グラフは要りません。でも、複数回の打ち合わせ記録、組織図、過去案件、各関係者の懸念、社内承認の順番まで横断して、「誰のどの懸念が止めているのか」「次に誰へ何を説明すべきか」を出すなら、関係をたどる価値が出ます。</p>

<p>つまり、GraphRAGがガッツリ必要になるのは、情報を見つけるだけでは仕事が終わらず、<strong>つながりをたどって影響・原因・経路を説明すること自体が業務</strong>になっている場合です。</p>
`.trim();

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findH2(content, heading) {
  const pattern = new RegExp(`<h2(?:\\s[^>]*)?>${escapeRegExp(heading)}<\\/h2>`, 'i');
  const match = pattern.exec(content);
  if (!match) return null;
  return { start: match.index, end: match.index + match[0].length };
}

export function upsertGraphRagExamplesSection(currentContent) {
  let content = currentContent;
  const existing = findH2(content, GRAPH_RAG_EXAMPLES_HEADING);

  if (existing) {
    const nextH2 = content.indexOf('<h2', existing.end);
    if (nextH2 < 0) throw new Error('Existing GraphRAG examples section end was not found');
    content = `${content.slice(0, existing.start)}${content.slice(nextH2)}`;
  }

  const anchor = findH2(content, PM_ON_RAILS_HEADING);
  if (!anchor) throw new Error('PM on Rails section heading was not found');

  return `${content.slice(0, anchor.start).trimEnd()}\n\n${GRAPH_RAG_EXAMPLES_SECTION}\n\n${content
    .slice(anchor.start)
    .trimStart()}`;
}
