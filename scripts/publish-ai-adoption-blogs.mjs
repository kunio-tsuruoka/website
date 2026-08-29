import { pathToFileURL } from 'node:url';

export const POSTS = [
  {
    id: 'ai-adoption-management-led',
    title: 'AI導入を担当者に丸投げしても、たぶん進まない',
    description:
      'AI導入はツール選定ではなく、業務・権限・責任を変える経営判断です。担当者任せで止まる理由と、社長や経営陣が持つべき役割を、自社でAIを使う経営者の立場から整理します。',
    content: `<p>組織へのAI導入は、社長がやらないと無理だなと思うようになりました。</p>

<p>少なくとも、担当者に「AI導入を進めておいて」と渡して、あとは結果だけ待つやり方では、かなり進みにくい。</p>

<p>自分はAIを作る側でもあり、自社の開発、営業、マーケティング、経営管理、情報整理でも毎日使っています。使う範囲を広げるほど分かるのは、AI導入で大変なのはツールの操作ではなく、会社として決めることの多さです。</p>

<h2>AI導入では、毎日のように経営判断が発生する</h2>

<p>どの業務から始めるのか。今の手順を残すのか、AIを前提に作り直すのか。どこまでAIへ任せ、どこに人の確認を残すのか。顧客情報や社内情報をどこまで渡すのか。多少の誤りを許容するのか。削減できた時間を何に使うのか。</p>

<p>一つずつ見ると細かい話に見えます。でも、実際には予算、権限、責任、評価、部署間の利害に関わっています。</p>

<p>たとえば営業の商談準備をAIで自動化したいとしても、営業情報が入力されていなければ動きません。では入力方法を変えるのか。入力を義務にするのか。別のシステムから自動取得するのか。誰がデータの正しさを担保するのか。</p>

<p>これはAI担当者が一人で決められる話ではありません。</p>

<h2>担当者に能力がないのではなく、決める権限がない</h2>

<p>AI導入が止まると、担当者の知識不足に見えることがあります。</p>

<p>でも、実際には逆です。担当者は調べている。ツールも比較している。小さな検証もしている。それでも本番に入れない。</p>

<p>別部署の業務を変える権限がない。一定のリスクを許容する権限がない。予算を増やす権限がない。既存の作業をやめる判断もできない。それなのに「AI導入の成果を出して」と言われる。</p>

<p>かなり無理のある仕事です。</p>

<p>担当者が出した提案に対して、経営側が判断しない。現場は経営判断を待つ。経営側は成果が出るのを待つ。そのまま時間だけが過ぎていきます。</p>

<h2>担当者任せにすると、小さな実験だけが増える</h2>

<p>経営の意思決定がないまま進めると、AI導入はよく似た状態になりやすいと思います。</p>

<ul>
<li>ChatGPTを使いたい人だけが個人的に使う</li>
<li>実証実験は行うが、本番業務へ組み込まれない</li>
<li>部署ごとに似たAIツールを契約する</li>
<li>AIの出力を人がすべて確認し、むしろ仕事が増える</li>
<li>数か月後に「結局いくら得したのか」と聞かれて止まる</li>
</ul>

<p>ツールを入れるところまでは担当者でもできます。</p>

<p>ただ、AIを入れた結果、不要になった会議や資料や確認作業を本当にやめるには、経営の判断が要ります。そこを変えないままAIだけ足すと、既存業務の上に新しい作業が積み上がります。</p>

<h2>AI導入は、現在の業務にAIを足すことではない</h2>

<p>議事録を作る。メールの下書きを作る。資料を要約する。文章を整える。</p>

<p>このくらいなら、個人の工夫でも進みます。</p>

<p>でも、組織として大きな成果を出そうとすると、その先へ行かなければいけません。</p>

<p>人が毎回行っていた判断を、どこまで仕組みにするのか。AIが参照できるように、社内の情報をどう残すのか。複数のシステムに分かれたデータをどうつなぐのか。例外が起きたとき、誰へ戻すのか。過去の失敗を、次の判断へどう使うのか。</p>

<p>つまり、AI導入は現在の業務へAIを追加するだけではありません。</p>

<p><strong>AIが存在する前提で、会社の仕事の流れを設計し直すこと</strong>です。</p>

<p>当然、情報システム部門やAI担当者だけの仕事では収まりません。</p>

<h2>社長がやるべきなのは、プロンプトを書くことではない</h2>

<p>社長がすべてのAIツールを操作する必要はありません。細かな設定や実装、日々の運用は担当者や外部の専門家へ任せられます。</p>

<p>ただし、次の判断は経営が持った方がいい。</p>

<ul>
<li>何を成果とするのか</li>
<li>どの業務を優先するのか</li>
<li>どの作業をやめるのか</li>
<li>どこまでリスクを許容するのか</li>
<li>誰にどの権限を渡すのか</li>
<li>部署間で意見が割れたとき、何を優先するのか</li>
</ul>

<p>社長がやるべきなのは、上手なプロンプトを書くことではありません。</p>

<p><strong>会社として何を変えるかを決め、判断待ちで止まっている場所をなくすこと</strong>です。</p>

<h2>経営者自身がAIを使うと、判断の解像度が上がる</h2>

<p>自分が見ている限り、社長や経営陣が日常的にAIを使っている会社は、導入の判断も速い。</p>

<p>AIに一度触れただけだと、「何でもできる魔法の道具」か、「間違えるので仕事では使えない道具」のどちらかに見えやすい。</p>

<p>実際には、その中間に大量の使い方があります。</p>

<p>この作業なら任せられる。この判断には根拠を表示させる必要がある。ここは人間が承認する。これはAIではなく通常のシステムにした方がいい。ここはそもそも作業自体をやめた方がいい。</p>

<p>使い続けると、この切り分けができるようになります。</p>

<p>経営者がAIの限界も含めて理解していれば、現場から提案が上がったときに判断できます。担当者へ「もっと調べて」と返し続ける状態も減ります。</p>

<h2>これから広がるのは、AI人材の有無だけの差ではない</h2>

<p>これから会社間で広がるのは、AIに詳しい社員がいるかどうかだけの差ではないと思います。</p>

<p><strong>経営者がAI導入を自分の仕事として扱っている会社と、担当者へ任せきっている会社の差</strong>です。</p>

<p>経営が動く会社では、一つの業務で得た知識が次の業務へ使われます。AIへ渡せるように情報が整理され、判断の経緯が残り、システム同士がつながり、さらに次のAI活用がやりやすくなる。</p>

<p>小さな改善が、次の改善の土台になります。</p>

<p>一方で、意思決定が止まっている会社では、毎回ゼロから比較表を作り、実証実験をして、承認を待つ。その差は時間が経つほど大きくなるはずです。</p>

<h2>実行は任せても、意思決定までは手放さない</h2>

<p>AI導入責任者を置くこと自体は悪くありません。</p>

<p>ただ、責任者という名前だけを付け、予算も権限も渡さず、結果だけを求めても進みません。</p>

<p>担当者が持つのは、調査、実装、検証、運用。経営が持つのは、目的、優先順位、権限、リスク、最終判断。</p>

<p><strong>実行は担当者へ任せられても、AI導入の意思決定までは手放せない。</strong></p>

<p>組織へのAI導入は、IT部門だけの仕事ではなく、経営そのものだと思います。</p>

<hr />

<p>とはいえ、すでに経営から「AI導入を進めて」と任されてしまった担当者もいると思います。そういう方に、責任だけを返すつもりはありません。</p>

<p><a href="/blog/ai-adoption-person-in-charge">AI導入を丸投げされた担当者へ。整理されていなくても、全部持ってきてください</a></p>`,
  },
  {
    id: 'ai-adoption-person-in-charge',
    title: 'AI導入を丸投げされた担当者へ。整理されていなくても、全部持ってきてください',
    description:
      'AI導入を丸投げされた担当者へ。資料も要件も整理されていない状態から、経営判断の整理、業務設計、実装、動作証拠の確認まで引き受けるBeekleの仕事と考え方を紹介します。',
    content: `<p><a href="/blog/ai-adoption-management-led">前の記事</a>で、AI導入は担当者へ任せるだけでは進まず、社長や経営陣が意思決定を持つ必要があると書きました。</p>

<p>ただ、現実にはもう任されてしまった担当者がいます。</p>

<p>「うちもAIを導入したいから、進めておいて」</p>

<p>目的は決まっていない。対象業務も予算も決まっていない。社内データがどこにあるのかも分からない。それでも次の会議までに何かを出さなければいけない。</p>

<p>かなり大変な役割です。</p>

<p>そういう状態なら、整理してから相談しようとしなくて大丈夫です。社長から届いた雑なチャットでも、現場のExcelでも、途中まで作った資料でも、止まった実証実験でもいい。</p>

<p><strong>何でも放り投げてください。</strong></p>

<p>整理されていないものを受け取り、何が問題なのかを見つけ、経営が判断できる形にし、実際に動くところまで持っていく。それが自分の仕事です。</p>

<h2>顧客に課題整理の宿題を返したくない</h2>

<p>AI導入の相談では、相談する前に顧客側へ多くの宿題が返されがちです。</p>

<ul>
<li>対象業務を決めてください</li>
<li>課題を整理してください</li>
<li>要件をまとめてください</li>
<li>必要なデータを用意してください</li>
<li>社内で合意してから来てください</li>
</ul>

<p>でも、そこが一番難しい。</p>

<p>何をAIへ任せるべきか、そもそもAIを使うべきか、どこから着手すれば効果が出るか。それを判断できずに困っているのに、先に全部整理してくださいと言われても進みません。</p>

<p>そこまで社内でできるなら、AI導入の大部分はもう終わっています。</p>

<p>自分は、曖昧さを顧客へ返したくありません。</p>

<p>会議のメモ、Slackのやり取り、操作中の画面、古い業務マニュアル、担当者しか知らない例外、誰が作ったか分からないExcel。まずはそのまま受け取ります。</p>

<p>情報が散らかっていること自体が、今の会社の仕事を知るための情報です。</p>

<h2>自分は経営者であり、エンジニアでもあります</h2>

<p>何でも持ってきてほしいと言えるのは、自分が経営と実装の間を行き来できるからです。</p>

<p><strong>自分は経営者であり、エンジニアでもあります。</strong></p>

<p>経営者が何を判断しなければいけないのかが分かる。現場で起きていることを、どのような業務やシステムへ変えればいいかも考えられる。必要であれば、そのまま自分たちで実装まで入れます。</p>

<p>経営者は経営課題の言葉で話します。現場は日々の不便や例外の話をします。エンジニアはデータ、権限、画面、処理の話をします。</p>

<p>この三つが分断されると、経営者が欲しかった成果と、現場が使えるものと、実際に作られたシステムが少しずつずれます。</p>

<p>自分の強みは、三者の間で伝言することではありません。</p>

<p><strong>経営上の目的から、現場の業務、具体的な実装、結果の確認までを一続きで考えられること</strong>です。</p>

<h2>「AIで何か」を、実行できる課題へ変える</h2>

<p>相談の入口は曖昧で構いません。</p>

<p>「営業をAIで効率化したい」という話でも、実際にはいくつもの問題が混ざっています。</p>

<p>見込み顧客を探す時間を減らしたいのか。商談前の企業調査を早くしたいのか。提案書の作成を短くしたいのか。過去の商談履歴から次の行動を出したいのか。担当者ごとの知識差を小さくしたいのか。失注理由を把握したいのか。</p>

<p>同じ「営業AI」でも、必要なデータも仕組みも効果の測り方も違います。</p>

<p>自分は、言われたものをそのまま作ることを仕事だとは考えていません。</p>

<p>会話、資料、既存システム、実際の行動を見ながら、本当に詰まっている場所を探す。AIを使うべき部分、通常のシステムにした方がいい部分、人が判断すべき部分、先に業務を整理すべき部分、そもそもやめた方がいい作業を分ける。</p>

<p>その上で、最初に結果が出る可能性が高いところから動かします。</p>

<h2>経営者にしか決められないことは、決められる形にして返す</h2>

<p>担当者へ丸投げされた仕事を、こちらがさらに担当者へ返しても意味がありません。</p>

<p>一方で、経営者にしか決められないことまで、自分や担当者が勝手に決めるわけにもいきません。</p>

<p>そこで、判断が必要なものは選べる形にします。</p>

<p>A案はすぐ始められるが、月額費用が高い。B案は初期開発が必要だが、既存システムと連携できる。C案は対象業務を限定する代わりに、最も早く効果を測れる。</p>

<p>それぞれの費用、期間、期待できる効果、リスク、社内で必要な対応を整理し、自分たちの推奨も出します。</p>

<p>経営者へ白紙を渡して「どうしますか」と聞くのではなく、何を選べば何が変わるかを見えるようにする。</p>

<p>担当者が経営判断まで背負う必要はありません。</p>

<h2>AIについて話しているだけではなく、自分の会社で毎日使っている</h2>

<p>自分は、AIについて記事を書いたり、顧客へ提案したりしているだけではありません。</p>

<p>自社の開発、営業、マーケティング、経営管理、情報整理へAIを組み込み、自分でもAIやAIを使うための仕組みを作っています。</p>

<p>会議、案件、営業、アクセス解析、実装履歴、失敗したこと。会社の中に散らばる一次情報をAIの外部記憶として蓄積し、実際の行動や結果と照合しながら更新する。</p>

<p>自分が目指しているのは、文章を一度うまく作るAIではありません。会社の事実を覚え、次の判断に使え、使うほど会社への理解が増えていく仕組みです。</p>

<p>実際に自社へ入れているから、きれいな成功例だけではなく、どこで止まるかも分かります。</p>

<p>AIが古い情報を参照する。現在の仕様と過去の履歴が混ざる。一度失敗した処理が再試行されない。担当者が完了と言ったものが、本番では動いていない。データはあるのに、経営判断へ使える形になっていない。</p>

<p>こうした問題に、自分の会社で毎日向き合っています。</p>

<p>だから「このAIツールを契約すれば終わり」とは言いません。導入後にどこで詰まり、何を設計し直す必要があるのかまで含めて考えます。</p>

<h2>提案書や実証実験で終わらず、動くところまで持っていく</h2>

<p>AI導入支援では、構想と実装が分断されやすい。</p>

<p>コンサルタントが構想を作り、別の会社が開発し、さらに別の担当者が運用する。その間に、もともとの目的が少しずつ失われます。</p>

<p>自分たちは、必要なら業務整理の後、そのまま実装まで入ります。既存システムとの連携、社内データの検索、AIエージェント、業務画面、確認や承認の仕組み、利用状況の計測までつなげる。</p>

<p>これまでにも、先行ベンダーで約3か月止まっていた案件を、要件、実装、インフラ、優先順位から読み直し、3週間で動作する状態まで戻したことがあります。その後、外部のセキュリティ確認も通過しました。</p>

<p>ヒアリングした内容をその日のうちにデモへ落とし、議論できる形にすることもあります。構想しかない段階でも、一週間ほどで触れるものを作り、抽象的な会話を具体的な判断へ変えていく。</p>

<p>これは、速さだけを自慢したいわけではありません。</p>

<p>資料だけで何週間も議論するより、早く触れるものを出した方が、現場も経営者も正しく判断できるからです。動かして初めて分かる問題を早く見つけ、直す。その方が、最終的な結果へ近づきます。</p>

<h2>「動きました」ではなく、動いた証拠まで見る</h2>

<p>AIが「実装しました」と言っても、それだけでは信用しません。開発者が「動きました」と言っても、利用者が使えるとは限りません。実証実験で一度成功しても、実際の業務で再現できるとは限らない。</p>

<p>だから、何をもって完了とするのかを先に決めます。</p>

<p>どの利用場面で動くのか。正常なときだけでなく、失敗したときにどうなるのか。誰がどこで確認できるのか。どの環境へ反映されたのか。実際に動いた証拠が残っているのか。</p>

<p>自分たちが作っているPM on Railsも、この考えから生まれています。要求、利用場面、実装、テスト、動作証拠をつなげ、AIが「できました」と言うだけでは完了にしない。</p>

<p><a href="/blog/ai-agent-gherkin-evidence">AIエージェントに「動いた証拠は？」と詰めよう</a>で書いた考え方は、開発だけでなく、AI導入全体にも当てはまります。</p>

<p>導入前後の時間、修正率、利用率、例外の発生、継続して使えるか。きれいなデモではなく、実際の業務で出た結果と証拠で判断します。</p>

<h2>AIを使える人だけではなく、会社そのものを強くしたい</h2>

<p>自分が作りたいのは、AIを使える一部の人だけが速くなる会社ではありません。</p>

<p><strong>会社そのものが学習し、判断し、改善できる状態</strong>です。</p>

<p>会社の中に散らばった知識を蓄積できる。過去の判断を次の判断へ使える。特定の人しか知らなかった業務を共有できる。問題が起きた理由を残せる。経営者が必要な事実へすぐ到達できる。人とAIが同じ情報を見ながら改善を続けられる。</p>

<p>それが、自分が考えているAI導入です。</p>

<p>特に中小企業は、専任のAI部門を何十人も抱えられるわけではありません。社長は忙しく、現場にも余裕がなく、資料やデータもきれいには揃っていない。</p>

<p>でも、その状態だからAIを導入できないという話にはしたくない。</p>

<p>大企業のような体制がなくても、会社にすでにある情報と業務を少しずつつなぎ、判断と実行を速くできる。その仕組みを作るのがBeekleの役割だと思っています。</p>

<h2>何でも放り投げてくれれば、こちらで前へ進める</h2>

<p>AI導入を任された担当者が、AIの専門家になる必要はありません。</p>

<p>現場で何が起きているのかを教えてください。マニュアルと現実がどこで違うのか。何に時間がかかるのか。どんな失敗が起きるのか。過去に何を試し、なぜ続かなかったのか。</p>

<p>対象業務が決まっていなくてもいい。要件がまとまっていなくてもいい。データが散らばっていてもいい。社内の意見が一致していなくてもいい。</p>

<p>そこから、こちらで構造を見つけます。</p>

<p>経営判断が必要なものは、社長や経営陣が選べる形にして返す。技術で解けるものは実装する。AIに向かないものは無理にAI化しない。動かした後は、結果と証拠を確認する。</p>

<p>整理されていないものを整理し、曖昧な依頼を実行できる形へ変え、実際に結果が確認できるところまで持っていく。</p>

<p>そのためにいるので、何でも放り投げてください。</p>

<hr />

<p>最初の相談は、「AI導入を任されたけれど、何も決まっていない」の一文だけでも十分です。</p>

<p><a href="/contact">手元にある資料を、そのまま持って相談する</a></p>

<p>まず自分たちで整理を始めたい方は、<a href="/column/it-admin-ai-first-week">経営から「AI入れて」と言われた情シス・IT担当者へ｜最初の1週間でやること</a>も参考にしてください。</p>`,
  },
];

const REQUIRED_IDS = ['ai-adoption-management-led', 'ai-adoption-person-in-charge'];

export function validatePosts(posts) {
  if (!Array.isArray(posts) || posts.length !== REQUIRED_IDS.length) {
    throw new Error('Exactly two blog posts are required.');
  }

  const ids = posts.map((post) => post.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error('Blog content IDs must be unique.');
  }
  if (ids.some((id, index) => id !== REQUIRED_IDS[index])) {
    throw new Error(`Unexpected blog content IDs: ${ids.join(', ')}`);
  }

  for (const post of posts) {
    for (const field of ['id', 'title', 'description', 'content']) {
      if (typeof post[field] !== 'string' || post[field].trim() === '') {
        throw new Error(`${post.id || 'unknown'} is missing ${field}.`);
      }
    }
    if (post.description.length < 70 || post.description.length > 130) {
      throw new Error(`${post.id} description must be 70-130 characters.`);
    }
    if (post.content.length <= 3_000) {
      throw new Error(`${post.id} content must be longer than 3,000 characters.`);
    }
    if (/<h1\b/i.test(post.content)) {
      throw new Error(`${post.id} content must not contain an h1.`);
    }
  }

  const [managementPost, operatorPost] = posts;
  if (!managementPost.content.includes('/blog/ai-adoption-person-in-charge')) {
    throw new Error('Management post must link to the person-in-charge post.');
  }
  if (!operatorPost.content.includes('/blog/ai-adoption-management-led')) {
    throw new Error('Person-in-charge post must link to the management post.');
  }
}

function requireEnvironment() {
  const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN?.trim();
  const apiKey = process.env.MICROCMS_API_KEY?.trim();

  if (!serviceDomain || !apiKey) {
    throw new Error('MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY are required.');
  }

  return { serviceDomain, apiKey };
}

function contentUrl(serviceDomain, contentId) {
  return `https://${serviceDomain}.microcms.io/api/v1/blogs/${encodeURIComponent(contentId)}`;
}

async function readResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function requestMicrocms(url, apiKey, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'X-MICROCMS-API-KEY': apiKey,
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const data = await readResponse(response);
  return { response, data };
}

async function upsertPost(post, env) {
  const url = contentUrl(env.serviceDomain, post.id);
  const current = await requestMicrocms(url, env.apiKey);

  let method = 'PATCH';
  if (current.response.status === 404) {
    method = 'PUT';
  } else if (!current.response.ok) {
    throw new Error(
      `Failed to inspect ${post.id}: ${current.response.status} ${JSON.stringify(current.data)}`
    );
  }

  const body = JSON.stringify({
    title: post.title,
    description: post.description,
    content: post.content,
  });
  let written = await requestMicrocms(url, env.apiKey, { method, body });

  if (!written.response.ok && method === 'PUT' && written.response.status === 409) {
    method = 'PATCH';
    written = await requestMicrocms(url, env.apiKey, { method, body });
  }

  if (!written.response.ok) {
    throw new Error(
      `Failed to publish ${post.id}: ${written.response.status} ${JSON.stringify(written.data)}`
    );
  }

  const verified = await requestMicrocms(url, env.apiKey);
  if (!verified.response.ok) {
    throw new Error(
      `Failed to verify ${post.id}: ${verified.response.status} ${JSON.stringify(verified.data)}`
    );
  }
  if (
    verified.data?.id !== post.id ||
    verified.data?.title !== post.title ||
    verified.data?.content !== post.content
  ) {
    throw new Error(`Published content verification failed for ${post.id}.`);
  }

  return {
    id: post.id,
    method,
    publishedAt: verified.data.publishedAt,
    updatedAt: verified.data.updatedAt,
  };
}

export async function publishPosts(posts = POSTS) {
  validatePosts(posts);
  const env = requireEnvironment();
  const results = [];

  for (const post of posts) {
    results.push(await upsertPost(post, env));
  }

  return results;
}

async function main() {
  validatePosts(POSTS);

  if (!process.argv.includes('--apply')) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          posts: POSTS.map((post) => ({
            id: post.id,
            title: post.title,
            descriptionLength: post.description.length,
            contentLength: post.content.length,
          })),
        },
        null,
        2
      )
    );
    return;
  }

  const results = await publishPosts();
  console.log(JSON.stringify({ mode: 'published', results }, null, 2));
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
