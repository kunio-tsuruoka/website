export const ENDPOINT = 'columns';
export const CONTENT_ID = 'data-company-learning-sensor';
export const EXPECTED_TITLE = 'データは、会社が現実から学ぶためのセンサーだ';
export const EXPECTED_PHRASE = 'BigQueryやDatabricksへ接続するのは、アプリの本番データベース';
export const ARTICLE_FIELDS = {
  title: 'データは、会社が現実から学ぶためのセンサーだ',
  content:
    '<p><a href="/column/loop-engineering-company-strength">前の記事</a>では、今の良い開発会社は、AIでコードを速く書ける会社ではなく、要求、実装、検証、顧客の反応を一つのループとして設計できる会社ではないかと書きました。</p>\n\n<p>ただ、ループを作るだけでは足りません。</p>\n\n<p>何かを実行し、その結果を見て、次の判断を変える。その流れを毎回起きる仕組みにするには、現実に何が起きたのかを観測できる必要があります。</p>\n\n<p>そこで重要になるのがデータです。</p>\n\n<p><strong>データは、報告書やダッシュボードを作るためだけのものではありません。会社が現実を観測し、次の判断を変えるためのセンサーです。</strong></p>\n\n<h2>データがなければ、会社は印象から学ぶ</h2>\n\n<p>会社は、データがなくても振り返れます。</p>\n\n<p>記事を出した。アクセスが増えた。だから、この記事はうまくいった。</p>\n\n<p>問い合わせが増えた。だから、マーケティングは良くなっている。</p>\n\n<p>商談が増えた。だから、営業活動はうまくいっている。</p>\n\n<p>売上が増えた。だから、会社は成長している。</p>\n\n<p>でも、それぞれ途中の結果しか見ていません。</p>\n\n<p>アクセスが増えても、問い合わせにつながっていないかもしれない。問い合わせが増えても、狙っている顧客ではないかもしれない。商談が増えても、ほとんど受注できていないかもしれない。受注が増えても、開発負荷が高く、利益や現金が残っていない可能性もあります。</p>\n\n<p>一部の数字だけを見ていると、その数字を増やす能力だけが強くなります。</p>\n\n<ul>\n  <li>アクセスだけを見れば、アクセスを集める会社になる</li>\n  <li>問い合わせ数だけを見れば、質の低い問い合わせを増やす可能性がある</li>\n  <li>商談数だけを見れば、受注につながらない商談を増やす可能性がある</li>\n  <li>売上だけを見れば、利益の残らない仕事を増やす可能性がある</li>\n</ul>\n\n<p>データを使う目的は、数字を増やすことではありません。</p>\n\n<p><strong>会社で実際に何が起きたのかを、途中で切らずに見ることです。</strong></p>\n\n<h2>検索需要から入金までを一つの流れで見る</h2>\n\n<p>自分たちでも、複数のデータをつないで、マーケティングから経営までを観測できるようにしています。</p>\n\n<p>DataForSEOやラッコキーワードのMCPでは、検索需要、関連キーワード、競合の状況を調べます。ここで見ているのは、市場にどんな悩みがあり、顧客がどんな言葉を使っているかです。</p>\n\n<p>記事やLPを出した後は、Search Consoleで検索結果への表示とクリックを見る。GA4やClarityでは、サイトに来た人がどのページを読み、どこを押し、どこで離脱したかを見る。</p>\n\n<p>問い合わせ後はCRMです。</p>\n\n<p>どんな会社から問い合わせが来たのか。狙っている顧客だったのか。商談へ進んだのか。何を提案したのか。受注したのか、失注したのか。次に何をするのか。</p>\n\n<p>さらに、CRM上の案件や金額を、請求、入金、原価などの経理データと合わせて見ます。</p>\n\n<p>受注しただけではなく、請求されたのか。入金されたのか。工数や外注費を考えても利益が残ったのか。次の投資へ回せる現金が増えたのか。</p>\n\n<p>つなげたいのは、こういう流れです。</p>\n\n<blockquote>\n  <p>検索需要<br>\n  → 検索結果への表示<br>\n  → サイト訪問<br>\n  → CTAクリック<br>\n  → 問い合わせ<br>\n  → 商談<br>\n  → 受注<br>\n  → 請求<br>\n  → 入金<br>\n  → 利益<br>\n  → 次の投資判断</p>\n</blockquote>\n\n<p>SEOの順位だけを見るのではない。</p>\n\n<p>その検索が、どんな顧客との接点を生み、どんな案件になり、最終的に会社へ何を残したのかまで見る。</p>\n\n<p>ここまでつながって、初めてマーケティング、営業、経理、経営が一つのループになります。</p>\n\n<h2>契約後の価値は、アプリのデータベースに残っている</h2>\n\n<p>WebサイトとCRMのデータだけでは、契約までしか分かりません。</p>\n\n<p>アプリやシステムを提供している会社なら、契約後に顧客が実際に何をしたのかも見る必要があります。</p>\n\n<ul>\n  <li>誰が登録したのか</li>\n  <li>初期設定を完了したのか</li>\n  <li>どの機能を使ったのか</li>\n  <li>最初の価値を得るまでに、どれくらいかかったのか</li>\n  <li>どの画面や処理で止まったのか</li>\n  <li>どの機能を使った顧客が継続したのか</li>\n  <li>どんな利用状況の顧客が、問い合わせや解約に至ったのか</li>\n</ul>\n\n<p>こうした事実の多くは、アプリのデータベースにあります。</p>\n\n<p>ユーザー、企業アカウント、契約状態、作成されたデータ、機能の実行結果、処理の成否。さらに画面表示、クリック、機能実行などのイベントログを残せば、顧客がアプリ内でどんな順番で行動したかも分かります。</p>\n\n<p>Webサイトのデータが「誰が興味を持ったか」を表し、CRMが「誰が商談や契約へ進んだか」を表すなら、アプリのデータは「契約後に顧客が本当に価値を得たか」を表します。</p>\n\n<p>ここが抜けていると、集客と受注は改善できても、プロダクトそのものは改善できません。</p>\n\n<p>問い合わせは増えた。受注も増えた。でも、実際には使われていなかった。</p>\n\n<p>この状態を見つけるには、営業データだけでなく、アプリ内の利用データまでつなぐ必要があります。</p>\n\n<h2>BigQueryやDatabricksへ接続するのは、アプリの本番データベース</h2>\n\n<p>ここで、アプリのデータベースをBigQueryやDatabricksのような分析基盤へ接続するという話になります。</p>\n\n<p>会社の資料を何でも一か所へ集める、という話ではありません。</p>\n\n<p><strong>アプリの本番データベースにあるユーザー、契約、利用状況、業務データを、分析用の環境から安全に参照できるようにする話です。</strong></p>\n\n<p>方法は大きく二つあります。</p>\n\n<p>一つは、必要なときに分析基盤からデータベースを参照する方法。もう一つは、データベースの追加、更新、削除を検知し、分析用のテーブルへ継続的に複製する方法です。</p>\n\n<p>BigQueryでは、Cloud SQLなど外部データソースへのフェデレーションクエリを使い、データを移動せずに参照できます。また、Datastreamを使えば、MySQL、PostgreSQL、SQL Server、Oracleなどの変更をBigQueryへ低遅延で複製できます。詳しい対応範囲は、Google Cloudの<a href="https://docs.cloud.google.com/bigquery/docs/external-data-sources?hl=ja" target="_blank" rel="noopener noreferrer">外部データソースの説明</a>と<a href="https://cloud.google.com/datastream-for-bigquery?hl=ja" target="_blank" rel="noopener noreferrer">Datastream for BigQuery</a>で確認できます。</p>\n\n<p>DatabricksのLakeflow Connectにも、MySQL、PostgreSQL、SQL Serverなどの変更をCDCで取得し、分析用のDeltaテーブルへ段階的に反映するマネージドコネクターがあります。対応内容はDatabricksの<a href="https://docs.databricks.com/gcp/ja/ingestion/lakeflow-connect/cdc-overview" target="_blank" rel="noopener noreferrer">マネージドデータベースコネクタ</a>にまとまっています。</p>\n\n<p>ただし、本番データベースをAIや重い分析処理から自由に叩かせるのは避けた方がいい。</p>\n\n<p>本番環境はアプリを動かすための正本として守る。その変更を分析用の環境へ流し、原則として読み取り専用で扱う。個人情報や機密情報は、用途に応じてマスキングやアクセス制御を行う。</p>\n\n<p>この構成なら、アプリの動作へ影響を与えずに、顧客の利用状況をWeb、CRM、経理のデータと合わせて分析できます。</p>\n\n<h2>CDPは、別々のシステムにいる同じ顧客をつなぐ</h2>\n\n<p>データを集めるだけでは、まだ足りません。</p>\n\n<p>同じ顧客が、システムごとに別の存在として記録されているからです。</p>\n\n<ul>\n  <li>Webサイトでは、匿名の訪問者</li>\n  <li>問い合わせフォームでは、メールアドレス</li>\n  <li>CRMでは、担当者と企業</li>\n  <li>契約後のアプリでは、ユーザーIDと企業アカウント</li>\n  <li>会計上では、請求先と取引先</li>\n</ul>\n\n<p>これらが同じ顧客だと分からなければ、検索から契約、利用、継続、入金までを一つの流れとして追えません。</p>\n\n<p>ここでCDPの考え方が重要になります。</p>\n\n<p>匿名ID、メールアドレス、CRM上の企業・担当者、アプリのユーザー・企業アカウントなどを対応付け、同じ顧客の行動として扱えるようにする。</p>\n\n<p>すると、単に「アクセスが多かった記事」ではなく、次のような分析ができます。</p>\n\n<ul>\n  <li>どの記事が、継続利用する顧客を生んだのか</li>\n  <li>どの流入経路から来た顧客が、最初の価値へ早く到達したのか</li>\n  <li>どの企業属性と利用行動が、追加契約や解約につながったのか</li>\n  <li>どの顧客が、どの機能によって成果を得たのか</li>\n</ul>\n\n<p>CDP、アプリのデータベース、分析基盤は、それぞれ役割が違います。</p>\n\n<p>CDPは顧客をつなぐ。アプリのデータベースは、サービス内で起きた事実を持つ。BigQueryやDatabricksのような基盤は、それらを他のデータと合わせて分析する。</p>\n\n<p>製品名より、この役割分担を設計することの方が大事です。</p>\n\n<h2>市場や顧客だけでなく、自分たちの行動もデータにする</h2>\n\n<p>観測するべきなのは、市場や顧客だけではありません。</p>\n\n<p>会社自身が何をしているのかも、データにする必要があります。</p>\n\n<p>自分は業務ログも取っています。</p>\n\n<ul>\n  <li>何に時間を使ったのか</li>\n  <li>会社の重点方針と関係の薄い仕事へ逸れていないか</li>\n  <li>同じ問題を何度も自分で解いていないか</li>\n  <li>本来仕組みにするべき仕事を、また手作業で処理していないか</li>\n  <li>任せると決めた仕事を、問題が起きるたびに回収していないか</li>\n  <li>作ったものが、売上、顧客価値、会社の仕組みのどれにつながったか</li>\n</ul>\n\n<p>方針として何を言っていたかと、実際に何をしていたかは、普通にずれます。</p>\n\n<p>営業を重視すると決めたのに、一日中プロダクトの細部を直していた。仕組み化すると決めたのに、また個別の問題を自分で回収していた。</p>\n\n<p>本人には、たくさん仕事をした感覚が残ります。でも、忙しかったことと、重要な仕事をしたことは同じではありません。</p>\n\n<p>業務ログがあれば、経営方針と実際の行動の差を観測できます。</p>\n\n<p>会社が何を生み出したかだけではなく、その結果を作るために、自分たちが何をしていたかまで見る。これも会社のループを改善するためのデータです。</p>\n\n<h2>データをつなぐと、AIに聞ける質問が変わる</h2>\n\n<p>市場、Webサイト、CRM、経理、アプリ、業務ログのデータがつながると、AIに聞ける質問が変わります。</p>\n\n<p>「今月のアクセス数は？」ではなく、</p>\n\n<blockquote>\n  <p>どの検索キーワードから来た顧客が、商談、契約、継続利用まで進んだのか。</p>\n</blockquote>\n\n<p>「どの機能がよく使われていますか？」ではなく、</p>\n\n<blockquote>\n  <p>継続率の高い顧客は、契約後30日間にどの機能を、どんな順番で使っているのか。</p>\n</blockquote>\n\n<p>「売上は増えていますか？」ではなく、</p>\n\n<blockquote>\n  <p>どの流入経路と提案パターンから、粗利と現金が残る案件が生まれているのか。</p>\n</blockquote>\n\n<p>「今月は忙しかったですか？」ではなく、</p>\n\n<blockquote>\n  <p>今月の経営方針に対して、実際の業務時間はどこへ配分されていたのか。</p>\n</blockquote>\n\n<p>個別の数字を聞くのではなく、原因と結果をまたいで質問できるようになります。</p>\n\n<p>ただし、AIに生のテーブルをそのまま渡せばよいわけではありません。</p>\n\n<p>同じ「顧客」でも、Web、CRM、アプリ、会計で識別方法が違う。同じ「売上」でも、受注額、請求額、入金額では意味が違う。同じ「利用」でも、ログインしただけなのか、主要な機能で成果を得たのかでは価値が違います。</p>\n\n<p>企業ID、担当者ID、アプリのユーザーID、案件ID、記事IDなどを接続する。問い合わせ、商談化、受注、入金、初回価値到達、継続といった言葉の定義を決める。AIに見せるデータと、見せてはいけないデータを分ける。</p>\n\n<p>この設計がなければ、AIは数字を答えられても、経営判断に使える答えは出せません。</p>\n\n<h2>データを集めても、次の行動が変わらなければ意味がない</h2>\n\n<p>データ基盤を作り、ダッシュボードを増やしても、それだけでは会社は学習しません。</p>\n\n<p>数字を見て終わる。AIに分析させて終わる。会議で話して終わる。</p>\n\n<p>これでは、情報が増えただけです。</p>\n\n<p>データごとに、少なくとも次を決める必要があります。</p>\n\n<ul>\n  <li>何が起きたら異常と判断するのか</li>\n  <li>誰が確認するのか</li>\n  <li>どの判断へ戻すのか</li>\n  <li>誰が実際に変更するのか</li>\n  <li>変更後に、何を見て効果を確認するのか</li>\n  <li>得た学びを、仕様、手順、商品、判断基準のどこへ残すのか</li>\n</ul>\n\n<p>たとえば、アプリの特定画面で多くの利用者が離脱していると分かったとします。</p>\n\n<p>その情報を開発チームへ共有するだけでは足りません。</p>\n\n<p>要求が間違っていたのか。画面が分かりにくいのか。必要な機能が不足しているのか。そもそも狙っている顧客が違うのか。</p>\n\n<p>原因を考え、変更案を作り、実際に直し、その後の利用データでもう一度確認する。</p>\n\n<p>そこで初めて、データが改善のループになります。</p>\n\n<p>AIが出した分析結果も、自動的に正式な要求や経営方針を書き換えればよいわけではありません。証拠付きの変更案として戻し、人間がどこを変えるか判断する。</p>\n\n<p>戻り道は作る。でも、勝手に逆流はさせない。</p>\n\n<p>データ基盤は、会社の代わりに意思決定するものではありません。会社が現実を見て、次の意思決定を変えるための仕組みです。</p>\n\n<h2>会社を学習させるには、まず会社を観測可能にする</h2>\n\n<p>データが大事なのは、数字をたくさん持っている会社が強いからではありません。</p>\n\n<p>会社が現実から学ぶためです。</p>\n\n<p>市場で何が求められているのか。顧客がどこで興味を持ち、どこで離脱したのか。営業が何を提案し、なぜ受注・失注したのか。契約後、顧客がアプリをどう使い、価値を得たのか。その仕事によって利益と現金が残ったのか。そして、自分たちは実際に何へ時間を使っていたのか。</p>\n\n<p>これらを一つの流れとして観測できれば、どこでループが止まっているのかが分かります。</p>\n\n<p>データを持っているだけでは、会社はデータドリブンになりません。</p>\n\n<p>データによって現実を観測し、仮説との差を見つけ、次の判断を変える。そして、その変更が効いたかを再びデータで確認する。</p>\n\n<p>そこまで仕組みになって、初めてデータは会社の能力になります。</p>\n\n<p><strong>データは、報告書を作るためにあるのではない。会社が現実から学び続けるためにある。</strong></p>\n\n<p>会社の強さをループの設計が決めるなら、そのループを現実につなぐのがデータです。</p>\n\n{{CONTACT_CTA}}\n',
  description:
    'SEO、アクセス解析、CRM、経理、業務ログ、アプリのデータベースをつなぐと、会社は市場から利用・入金までを一つの流れとして観測できます。データを会社の学習装置に変えるための考え方を整理します。',
  category: 'cdp-development',
} as const;

type MicroCmsEnv = {
  MICROCMS_SERVICE_DOMAIN?: string;
  MICROCMS_API_KEY?: string;
};

type FetchLike = typeof fetch;

type JsonResult = {
  response: Response;
  body: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function requestJson(
  fetchImpl: FetchLike,
  url: string,
  apiKey: string,
  init: RequestInit = {}
): Promise<JsonResult> {
  const response = await fetchImpl(url, {
    ...init,
    headers: {
      'X-MICROCMS-API-KEY': apiKey,
      'Cache-Control': 'no-cache',
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Keep a non-JSON response as text for diagnostics.
  }
  return { response, body };
}

function formatError(label: string, result: JsonResult): string {
  return `${label}: ${result.response.status} ${result.response.statusText} ${JSON.stringify(result.body)}`;
}

function publishedRecord(body: unknown): Record<string, unknown> | null {
  return isRecord(body) ? body : null;
}

async function verifyPublished(
  fetchImpl: FetchLike,
  contentUrl: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  let last: JsonResult | null = null;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    last = await requestJson(
      fetchImpl,
      `${contentUrl}?fields=id,title,content,description,category,publishedAt,revisedAt`,
      apiKey
    );
    const body = publishedRecord(last.body);
    if (
      last.response.ok &&
      body?.id === CONTENT_ID &&
      body?.title === EXPECTED_TITLE &&
      typeof body?.content === 'string' &&
      body.content.includes(EXPECTED_PHRASE) &&
      body?.category === ARTICLE_FIELDS.category &&
      typeof body?.publishedAt === 'string' &&
      body.publishedAt.length > 0
    ) {
      return body;
    }
    if (attempt < 11) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error(
    last
      ? formatError('Published-content verification failed', last)
      : 'Published-content verification failed'
  );
}

export async function publishDataCompanyLearningSensor(
  env: MicroCmsEnv,
  fetchImpl: FetchLike = fetch
) {
  const serviceDomain = env.MICROCMS_SERVICE_DOMAIN?.trim();
  const apiKey = env.MICROCMS_API_KEY?.trim();
  if (!serviceDomain || !apiKey) {
    throw new Error('MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY are required');
  }
  if (
    ARTICLE_FIELDS.title !== EXPECTED_TITLE ||
    !ARTICLE_FIELDS.content.includes(EXPECTED_PHRASE)
  ) {
    throw new Error('Publication payload failed its identity checks');
  }

  const contentUrl = `https://${serviceDomain}.microcms.io/api/v1/${ENDPOINT}/${CONTENT_ID}`;
  const current = await requestJson(fetchImpl, contentUrl, apiKey);
  let operation: 'created' | 'updated';

  if (current.response.ok) {
    const currentBody = publishedRecord(current.body);
    if (currentBody?.title && currentBody.title !== EXPECTED_TITLE) {
      throw new Error(
        `Refusing to overwrite content with another title: ${String(currentBody.title)}`
      );
    }
    const updated = await requestJson(fetchImpl, contentUrl, apiKey, {
      method: 'PATCH',
      body: JSON.stringify(ARTICLE_FIELDS),
    });
    if (!updated.response.ok) {
      throw new Error(formatError('Published-content PATCH failed', updated));
    }
    operation = 'updated';
  } else if (current.response.status === 404) {
    const created = await requestJson(fetchImpl, contentUrl, apiKey, {
      method: 'PUT',
      body: JSON.stringify(ARTICLE_FIELDS),
    });
    if (!created.response.ok) {
      throw new Error(formatError('Published-content PUT failed', created));
    }
    operation = 'created';
  } else {
    throw new Error(formatError('Initial content lookup failed', current));
  }

  const published = await verifyPublished(fetchImpl, contentUrl, apiKey);
  return {
    operation,
    id: published.id,
    title: published.title,
    category: published.category,
    publishedAt: published.publishedAt,
    revisedAt: published.revisedAt,
  };
}
