export type MarketingEnv = {
  GSC_CLIENT_ID?: string;
  GSC_CLIENT_SECRET?: string;
  GSC_REFRESH_TOKEN?: string;
  GSC_SITE_URL?: string;
  GA4_PROPERTY_ID?: string;
  GA4_SERVICE_ACCOUNT_JSON?: string;
  GA4_CLIENT_EMAIL?: string;
  GA4_PRIVATE_KEY?: string;
  MICROSOFT_CLARITY_API_KEY?: string;
  MICROSODT_CLARITY_API_KEY?: string;
};

type SourceResult<T> = { ok: true; data: T } | { ok: false; error: string };

type Ga4ReportName =
  | 'content-group'
  | 'channels'
  | 'top-pages'
  | 'key-events'
  | 'cta-clicks'
  | 'form-sources'
  | 'search-landing';

type Ga4ReportDefinition = {
  dimensions: string[];
  metrics: string[];
  defaultLimit: number;
  orderMetric: string;
  filter?: Record<string, unknown>;
};

type Ga4Row = Record<string, string | number>;
type GscRow = {
  query?: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  ctrPct: number;
  position: number;
};

const KEY_EVENTS = ['form_submit', 'generate_lead', 'contact_complete', 'cta_click', 'purchase'];

const GA4_REPORTS: Record<Ga4ReportName, Ga4ReportDefinition> = {
  'content-group': {
    dimensions: ['contentGroup'],
    metrics: ['sessions', 'engagedSessions', 'keyEvents'],
    defaultLimit: 50,
    orderMetric: 'sessions',
  },
  channels: {
    dimensions: ['sessionDefaultChannelGroup'],
    metrics: ['sessions', 'engagedSessions', 'keyEvents'],
    defaultLimit: 50,
    orderMetric: 'sessions',
  },
  'top-pages': {
    dimensions: ['pagePath'],
    metrics: ['screenPageViews', 'sessions'],
    defaultLimit: 100,
    orderMetric: 'screenPageViews',
  },
  'key-events': {
    dimensions: ['eventName'],
    metrics: ['eventCount'],
    defaultLimit: 50,
    orderMetric: 'eventCount',
    filter: {
      filter: {
        fieldName: 'eventName',
        inListFilter: { values: KEY_EVENTS },
      },
    },
  },
  'cta-clicks': {
    dimensions: ['eventName', 'customEvent:source', 'customEvent:cta'],
    metrics: ['eventCount'],
    defaultLimit: 100,
    orderMetric: 'eventCount',
    filter: {
      filter: {
        fieldName: 'eventName',
        stringFilter: { matchType: 'EXACT', value: 'cta_click' },
      },
    },
  },
  'form-sources': {
    dimensions: ['eventName', 'customEvent:source', 'customEvent:phase'],
    metrics: ['eventCount'],
    defaultLimit: 100,
    orderMetric: 'eventCount',
    filter: {
      filter: {
        fieldName: 'eventName',
        inListFilter: {
          values: ['form_submit', 'generate_lead', 'contact_complete'],
        },
      },
    },
  },
  'search-landing': {
    dimensions: ['landingPagePlusQueryString'],
    metrics: [
      'organicGoogleSearchClicks',
      'organicGoogleSearchImpressions',
      'organicGoogleSearchAveragePosition',
    ],
    defaultLimit: 100,
    orderMetric: 'organicGoogleSearchImpressions',
  },
};

const CLARITY_DIMENSIONS = [
  'Browser',
  'Device',
  'Country/Region',
  'OS',
  'Source',
  'Medium',
  'Campaign',
  'Channel',
  'URL',
];

export const marketingTools = [
  {
    name: 'marketing_daily_summary',
    description:
      'Read daily marketing numbers for Beekle. Defaults to yesterday in Japan time. Combines GA4, Google Search Console, and optionally Clarity. Lead/deal data is handled by the separate beekle-crm connector.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Target date as YYYY-MM-DD. Default is yesterday in Asia/Tokyo.',
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 100,
          description: 'Rows per source. Default 10.',
        },
        includeClarity: {
          type: 'boolean',
          description:
            'Also call Microsoft Clarity live insights. Default false because Clarity has a small daily API quota.',
        },
      },
    },
  },
  {
    name: 'marketing_monthly_analysis',
    description:
      'Read monthly GA4/GSC data and compare it with the previous month. Use the separate beekle-crm connector for lead/deal data before planning columns or blog drafts from actual demand signals.',
    inputSchema: {
      type: 'object',
      properties: {
        month: {
          type: 'string',
          description:
            'Target month as YYYY-MM. Default is the previous calendar month in Asia/Tokyo.',
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 100,
          description: 'Rows per source. Default 20.',
        },
      },
    },
  },
  {
    name: 'marketing_get_gsc_queries',
    description:
      'Read Google Search Console query rows for a date range. Good for finding topics, CTR opportunities, and buyer-intent searches.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date as YYYY-MM-DD. Default is 28 days before yesterday.',
        },
        endDate: {
          type: 'string',
          description: 'End date as YYYY-MM-DD. Default is yesterday.',
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 5000,
          description: 'Max rows. Default 100.',
        },
        minImpressions: {
          type: 'number',
          minimum: 0,
          description: 'Minimum impressions used for CTR opportunity extraction. Default 30.',
        },
      },
    },
  },
  {
    name: 'marketing_get_gsc_pages',
    description: 'Read Google Search Console page rows for a date range.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date as YYYY-MM-DD. Default is 28 days before yesterday.',
        },
        endDate: {
          type: 'string',
          description: 'End date as YYYY-MM-DD. Default is yesterday.',
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 5000,
          description: 'Max rows. Default 100.',
        },
      },
    },
  },
  {
    name: 'marketing_get_ga4_report',
    description:
      'Read one GA4 Data API report. Reports: content-group, channels, top-pages, key-events, cta-clicks, form-sources, search-landing.',
    inputSchema: {
      type: 'object',
      properties: {
        report: {
          type: 'string',
          enum: Object.keys(GA4_REPORTS),
          description: 'GA4 report name. Default channels.',
        },
        startDate: {
          type: 'string',
          description: 'Start date as YYYY-MM-DD. Default is 28 days before yesterday.',
        },
        endDate: {
          type: 'string',
          description: 'End date as YYYY-MM-DD. Default is yesterday.',
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 250,
          description: 'Max rows. Defaults to each report preset.',
        },
      },
    },
  },
  {
    name: 'marketing_get_clarity_insights',
    description:
      'Read Microsoft Clarity Data Export API live insights. Limited by Clarity to recent 1-3 days, up to 3 dimensions, and a small daily quota.',
    inputSchema: {
      type: 'object',
      properties: {
        numOfDays: {
          type: 'number',
          enum: [1, 2, 3],
          description: 'Lookback window from the API call time. Default 1.',
        },
        dimensions: {
          type: 'array',
          items: { type: 'string', enum: CLARITY_DIMENSIONS },
          maxItems: 3,
          description: 'Breakdown dimensions. Example: ["URL"], ["Source","Medium"].',
        },
      },
    },
  },
] as const;

const MARKETING_TOOL_NAMES = new Set(marketingTools.map((tool) => tool.name));

export function isMarketingToolName(name: string) {
  return MARKETING_TOOL_NAMES.has(name as (typeof marketingTools)[number]['name']);
}

export function marketingReadiness(env: MarketingEnv) {
  return {
    ga4: Boolean(getGa4Credentials(env)),
    gsc: Boolean(env.GSC_CLIENT_ID && env.GSC_CLIENT_SECRET && env.GSC_REFRESH_TOKEN),
    clarity: Boolean(clarityApiKey(env)),
  };
}

export async function callMarketingTool(
  name: string,
  args: Record<string, unknown>,
  env: MarketingEnv
) {
  switch (name) {
    case 'marketing_daily_summary':
      return marketingToolResult(() => dailySummary(args, env));
    case 'marketing_monthly_analysis':
      return marketingToolResult(() => monthlyAnalysis(args, env));
    case 'marketing_get_gsc_queries':
      return marketingToolResult(() => getGscQueries(args, env));
    case 'marketing_get_gsc_pages':
      return marketingToolResult(() => getGscPages(args, env));
    case 'marketing_get_ga4_report':
      return marketingToolResult(() => getGa4Report(args, env));
    case 'marketing_get_clarity_insights':
      return marketingToolResult(() => getClarityInsights(args, env));
    default:
      throw new Error(`Unknown marketing tool: ${name}`);
  }
}

async function marketingToolResult<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

async function dailySummary(args: Record<string, unknown>, env: MarketingEnv) {
  const date = optionalDate(args.date) ?? jstDate(-1);
  const limit = clampNumber(args.limit, 10, 1, 100);
  const includeClarity = args.includeClarity === true;

  const [ga4, gsc, clarity] = await Promise.all([
    sourceResult(() => ga4Daily(date, limit, env)),
    sourceResult(() => gscDaily(date, limit, env)),
    includeClarity
      ? sourceResult(() => clarityInsights(1, ['URL'], env))
      : Promise.resolve({ ok: false, error: 'clarity_not_requested' } as SourceResult<unknown>),
  ]);

  return {
    ok: true,
    meta: {
      date,
      timezone: 'Asia/Tokyo',
      generatedAt: new Date().toISOString(),
      note: 'Clarity is not called unless includeClarity=true because the API has a small daily quota. Use the separate beekle-crm connector for lead/deal records.',
    },
    readiness: marketingReadiness(env),
    highlights: buildDailyHighlights({ ga4, gsc }),
    sources: { ga4, gsc, clarity },
  };
}

async function monthlyAnalysis(args: Record<string, unknown>, env: MarketingEnv) {
  const range = monthRange(optionalMonth(args.month));
  const previous = previousMonthRange(range.month);
  const limit = clampNumber(args.limit, 20, 1, 100);

  const [ga4Current, ga4Previous, gscCurrent, gscPrevious] = await Promise.all([
    sourceResult(() => ga4Monthly(range, limit, env)),
    sourceResult(() => ga4Monthly(previous, limit, env)),
    sourceResult(() => gscMonthly(range, limit, env)),
    sourceResult(() => gscMonthly(previous, limit, env)),
  ]);

  return {
    ok: true,
    meta: {
      month: range.month,
      startDate: range.startDate,
      endDate: range.endDate,
      previousMonth: previous.month,
      previousStartDate: previous.startDate,
      previousEndDate: previous.endDate,
      timezone: 'Asia/Tokyo',
      generatedAt: new Date().toISOString(),
    },
    readiness: marketingReadiness(env),
    deltas: monthlyDeltas({
      ga4Current,
      ga4Previous,
      gscCurrent,
      gscPrevious,
    }),
    recommendations: monthlyRecommendations({ ga4Current, gscCurrent }),
    sources: {
      ga4Current,
      ga4Previous,
      gscCurrent,
      gscPrevious,
    },
  };
}

async function getGscQueries(args: Record<string, unknown>, env: MarketingEnv) {
  const range = dateRange(args, 28);
  const limit = clampNumber(args.limit, 100, 1, 5000);
  const minImpressions = clampNumber(args.minImpressions, 30, 0, 100000);
  const rows = await queryGsc(env, ['query'], range.startDate, range.endDate, limit);
  return {
    ok: true,
    source: 'gsc',
    report: 'queries',
    meta: gscMeta(env, range),
    totals: gscTotals(rows),
    opportunities: ctrOpportunities(rows, minImpressions).slice(0, 50),
    count: rows.length,
    rows,
  };
}

async function getGscPages(args: Record<string, unknown>, env: MarketingEnv) {
  const range = dateRange(args, 28);
  const limit = clampNumber(args.limit, 100, 1, 5000);
  const rows = await queryGsc(env, ['page'], range.startDate, range.endDate, limit);
  return {
    ok: true,
    source: 'gsc',
    report: 'pages',
    meta: gscMeta(env, range),
    totals: gscTotals(rows),
    count: rows.length,
    rows,
  };
}

async function getGa4Report(args: Record<string, unknown>, env: MarketingEnv) {
  const requested = optionalString(args.report) ?? 'channels';
  if (!isGa4ReportName(requested)) {
    throw new Error(`Unknown GA4 report: ${requested}`);
  }

  const range = dateRange(args, 28);
  const definition = GA4_REPORTS[requested];
  const limit = clampNumber(args.limit, definition.defaultLimit, 1, 250);
  const rows = await runGa4Report(env, requested, range.startDate, range.endDate, limit);

  return {
    ok: true,
    source: 'ga4',
    report: requested,
    meta: ga4Meta(env, range),
    totals: ga4Totals(requested, rows),
    count: rows.length,
    rows,
  };
}

async function getClarityInsights(args: Record<string, unknown>, env: MarketingEnv) {
  const numOfDays = clampNumber(args.numOfDays, 1, 1, 3);
  const dimensions = optionalStringArray(args.dimensions)
    .slice(0, 3)
    .filter((dimension) => CLARITY_DIMENSIONS.includes(dimension));
  return {
    ok: true,
    source: 'clarity',
    report: 'project-live-insights',
    meta: {
      numOfDays,
      dimensions,
      timezone: 'UTC',
      limits:
        'Clarity returns recent 1-3 days only, up to 3 dimensions, up to 1000 rows, and has a small daily quota.',
    },
    data: await clarityInsights(numOfDays, dimensions, env),
  };
}

async function ga4Daily(date: string, limit: number, env: MarketingEnv) {
  const [channels, keyEvents, topPages] = await Promise.all([
    runGa4Report(env, 'channels', date, date, limit),
    runGa4Report(env, 'key-events', date, date, limit),
    runGa4Report(env, 'top-pages', date, date, limit),
  ]);

  return {
    meta: ga4Meta(env, { startDate: date, endDate: date }),
    totals: {
      sessions: sumMetric(channels, 'sessions'),
      engagedSessions: sumMetric(channels, 'engagedSessions'),
      keyEvents: sumMetric(channels, 'keyEvents'),
      eventCount: sumMetric(keyEvents, 'eventCount'),
    },
    channels,
    keyEvents,
    topPages,
  };
}

async function ga4Monthly(
  range: { month: string; startDate: string; endDate: string },
  limit: number,
  env: MarketingEnv
) {
  const [channels, contentGroups, keyEvents, topPages, formSources] = await Promise.all([
    runGa4Report(env, 'channels', range.startDate, range.endDate, limit),
    runGa4Report(env, 'content-group', range.startDate, range.endDate, limit),
    runGa4Report(env, 'key-events', range.startDate, range.endDate, limit),
    runGa4Report(env, 'top-pages', range.startDate, range.endDate, limit),
    sourceResult(() => runGa4Report(env, 'form-sources', range.startDate, range.endDate, limit)),
  ]);

  return {
    meta: ga4Meta(env, range),
    totals: {
      sessions: sumMetric(channels, 'sessions'),
      engagedSessions: sumMetric(channels, 'engagedSessions'),
      keyEvents: sumMetric(channels, 'keyEvents'),
      eventCount: sumMetric(keyEvents, 'eventCount'),
    },
    channels,
    contentGroups,
    keyEvents,
    topPages,
    formSources,
  };
}

async function gscDaily(date: string, limit: number, env: MarketingEnv) {
  const [queries, pages] = await Promise.all([
    queryGsc(env, ['query'], date, date, limit),
    queryGsc(env, ['page'], date, date, limit),
  ]);

  return {
    meta: gscMeta(env, { startDate: date, endDate: date }),
    totals: gscTotals(pages),
    opportunities: ctrOpportunities(queries, 10).slice(0, limit),
    queries,
    pages,
  };
}

async function gscMonthly(
  range: { month: string; startDate: string; endDate: string },
  limit: number,
  env: MarketingEnv
) {
  const [queries, pages] = await Promise.all([
    queryGsc(env, ['query'], range.startDate, range.endDate, Math.max(limit, 100)),
    queryGsc(env, ['page'], range.startDate, range.endDate, Math.max(limit, 100)),
  ]);

  return {
    meta: gscMeta(env, range),
    totals: gscTotals(pages),
    opportunities: ctrOpportunities(queries, 30).slice(0, limit),
    buyerQueries: queries
      .filter((row) => row.query && classifyIntent(row.query).intent === 'buyer')
      .slice(0, limit),
    topQueries: queries.slice(0, limit),
    topPages: pages.slice(0, limit),
  };
}

async function runGa4Report(
  env: MarketingEnv,
  reportName: Ga4ReportName,
  startDate: string,
  endDate: string,
  limit: number
) {
  const property = optionalString(env.GA4_PROPERTY_ID);
  if (!property) {
    throw new Error('GA4_PROPERTY_ID is required.');
  }

  const definition = GA4_REPORTS[reportName];
  const body = {
    dateRanges: [{ startDate, endDate }],
    dimensions: definition.dimensions.map((name) => ({ name })),
    metrics: definition.metrics.map((name) => ({ name })),
    orderBys: [{ metric: { metricName: definition.orderMetric }, desc: true }],
    limit,
    ...(definition.filter ? { dimensionFilter: definition.filter } : {}),
  };

  const token = await getGa4AccessToken(env);
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(property)}:runReport`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  const text = await response.text();
  const data = parseJson(text);
  if (!response.ok) {
    throw new Error(
      `GA4 API ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`
    );
  }

  return normalizeGa4Rows(data);
}

async function getGa4AccessToken(env: MarketingEnv) {
  const credentials = getGa4Credentials(env);
  if (!credentials) {
    throw new Error(
      'GA4 service account is not configured. Set GA4_SERVICE_ACCOUNT_JSON or GA4_CLIENT_EMAIL and GA4_PRIVATE_KEY.'
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const assertion = await signJwt(
    { alg: 'RS256', typ: 'JWT' },
    {
      iss: credentials.clientEmail,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    },
    credentials.privateKey
  );

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const text = await response.text();
  const data = parseJson(text);
  if (!response.ok || !isRecord(data) || typeof data.access_token !== 'string') {
    throw new Error(
      `GA4 token error ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`
    );
  }
  return data.access_token;
}

function getGa4Credentials(env: MarketingEnv) {
  if (env.GA4_SERVICE_ACCOUNT_JSON) {
    const raw = env.GA4_SERVICE_ACCOUNT_JSON.trim();
    const json = raw.startsWith('{') ? raw : (tryBase64Decode(raw) ?? raw);
    const parsed = parseJson(json);
    if (
      isRecord(parsed) &&
      typeof parsed.client_email === 'string' &&
      typeof parsed.private_key === 'string'
    ) {
      return {
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key.replaceAll('\\n', '\n'),
      };
    }
  }

  if (env.GA4_CLIENT_EMAIL && env.GA4_PRIVATE_KEY) {
    return {
      clientEmail: env.GA4_CLIENT_EMAIL,
      privateKey: env.GA4_PRIVATE_KEY.replaceAll('\\n', '\n'),
    };
  }

  return null;
}

async function queryGsc(
  env: MarketingEnv,
  dimensions: Array<'query' | 'page'>,
  startDate: string,
  endDate: string,
  rowLimit: number
) {
  const token = await getGscAccessToken(env);
  const siteUrl = env.GSC_SITE_URL || 'sc-domain:beekle.jp';
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit,
        type: 'web',
      }),
    }
  );
  const text = await response.text();
  const data = parseJson(text);
  if (!response.ok) {
    throw new Error(
      `GSC API ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`
    );
  }
  if (!isRecord(data) || !Array.isArray(data.rows)) return [];

  return data.rows.map((row) => normalizeGscRow(row, dimensions)).filter(Boolean) as GscRow[];
}

async function getGscAccessToken(env: MarketingEnv) {
  const clientId = secretHeaderValue(env.GSC_CLIENT_ID);
  const clientSecret = secretHeaderValue(env.GSC_CLIENT_SECRET);
  const refreshToken = secretHeaderValue(env.GSC_REFRESH_TOKEN);
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'GSC OAuth is not configured. Set GSC_CLIENT_ID, GSC_CLIENT_SECRET, and GSC_REFRESH_TOKEN.'
    );
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const text = await response.text();
  const data = parseJson(text);
  if (!response.ok || !isRecord(data) || typeof data.access_token !== 'string') {
    throw new Error(
      `GSC token error ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`
    );
  }

  return data.access_token;
}

async function clarityInsights(numOfDays: number, dimensions: string[], env: MarketingEnv) {
  const token = clarityApiKey(env);
  if (!token) {
    throw new Error('Microsoft Clarity is not configured. Set MICROSOFT_CLARITY_API_KEY.');
  }

  const params = new URLSearchParams({ numOfDays: String(numOfDays) });
  dimensions.slice(0, 3).forEach((dimension, index) => {
    params.set(`dimension${index + 1}`, dimension);
  });

  const response = await fetch(
    `https://www.clarity.ms/export-data/api/v1/project-live-insights?${params}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
    }
  );
  const text = await response.text();
  const data = parseJson(text);
  if (!response.ok) {
    throw new Error(
      `Clarity API ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`
    );
  }

  return data;
}

function clarityApiKey(env: MarketingEnv) {
  return (
    secretHeaderValue(env.MICROSOFT_CLARITY_API_KEY) ||
    secretHeaderValue(env.MICROSODT_CLARITY_API_KEY)
  );
}

function buildDailyHighlights({
  ga4,
  gsc,
}: {
  ga4: SourceResult<Awaited<ReturnType<typeof ga4Daily>>>;
  gsc: SourceResult<Awaited<ReturnType<typeof gscDaily>>>;
}) {
  return {
    sessions: ga4.ok ? ga4.data.totals.sessions : null,
    engagedSessions: ga4.ok ? ga4.data.totals.engagedSessions : null,
    keyEvents: ga4.ok ? ga4.data.totals.keyEvents : null,
    gscClicks: gsc.ok ? gsc.data.totals.clicks : null,
    gscImpressions: gsc.ok ? gsc.data.totals.impressions : null,
  };
}

function monthlyDeltas({
  ga4Current,
  ga4Previous,
  gscCurrent,
  gscPrevious,
}: {
  ga4Current: SourceResult<Awaited<ReturnType<typeof ga4Monthly>>>;
  ga4Previous: SourceResult<Awaited<ReturnType<typeof ga4Monthly>>>;
  gscCurrent: SourceResult<Awaited<ReturnType<typeof gscMonthly>>>;
  gscPrevious: SourceResult<Awaited<ReturnType<typeof gscMonthly>>>;
}) {
  return {
    sessions: delta(
      ga4Current.ok ? ga4Current.data.totals.sessions : null,
      ga4Previous.ok ? ga4Previous.data.totals.sessions : null
    ),
    keyEvents: delta(
      ga4Current.ok ? ga4Current.data.totals.keyEvents : null,
      ga4Previous.ok ? ga4Previous.data.totals.keyEvents : null
    ),
    gscClicks: delta(
      gscCurrent.ok ? gscCurrent.data.totals.clicks : null,
      gscPrevious.ok ? gscPrevious.data.totals.clicks : null
    ),
    gscImpressions: delta(
      gscCurrent.ok ? gscCurrent.data.totals.impressions : null,
      gscPrevious.ok ? gscPrevious.data.totals.impressions : null
    ),
  };
}

function monthlyRecommendations({
  ga4Current,
  gscCurrent,
}: {
  ga4Current: SourceResult<Awaited<ReturnType<typeof ga4Monthly>>>;
  gscCurrent: SourceResult<Awaited<ReturnType<typeof gscMonthly>>>;
}) {
  const recommendations: string[] = [];

  if (gscCurrent.ok && gscCurrent.data.opportunities.length > 0) {
    const top = gscCurrent.data.opportunities[0];
    recommendations.push(
      `CTR改善候補: 「${top.query}」は表示回数があり順位も近いので、該当ページのtitle/descriptionと導入文を見直す。`
    );
  }

  if (gscCurrent.ok && gscCurrent.data.buyerQueries.length > 0) {
    const queries = gscCurrent.data.buyerQueries
      .slice(0, 3)
      .map((row) => `「${row.query}」`)
      .join('、');
    recommendations.push(
      `記事企画候補: 買い手寄りの検索語 ${queries} を、コラムまたはブログの下書き候補にする。`
    );
  }

  if (ga4Current.ok && ga4Current.data.topPages.length > 0) {
    const topPage = String(ga4Current.data.topPages[0].pagePath || '');
    recommendations.push(
      `導線改善候補: GA4上位ページ ${topPage || '(pagePathなし)'} から問い合わせ/資料請求へのCTA到達を確認する。`
    );
  }

  const formEvents =
    ga4Current.ok && ga4Current.data.formSources.ok
      ? sumMetric(ga4Current.data.formSources.data, 'eventCount')
      : 0;
  if (formEvents > 0) {
    recommendations.push(
      '問い合わせ確認: GA4のform-sourcesとbeekle-crmのリードを照合し、実CVに近い流入元を優先する。'
    );
  }

  return recommendations;
}

function delta(current: number | null, previous: number | null) {
  if (current === null || previous === null) {
    return { current, previous, change: null, changePct: null };
  }
  const change = current - previous;
  return {
    current,
    previous,
    change,
    changePct: previous === 0 ? null : round((change / previous) * 100, 1),
  };
}

async function sourceResult<T>(fn: () => Promise<T>): Promise<SourceResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

function ga4Totals(reportName: Ga4ReportName, rows: Ga4Row[]) {
  if (reportName === 'top-pages') {
    return {
      screenPageViews: sumMetric(rows, 'screenPageViews'),
      sessions: sumMetric(rows, 'sessions'),
    };
  }
  if (reportName === 'key-events' || reportName === 'cta-clicks' || reportName === 'form-sources') {
    return { eventCount: sumMetric(rows, 'eventCount') };
  }
  return {
    sessions: sumMetric(rows, 'sessions'),
    engagedSessions: sumMetric(rows, 'engagedSessions'),
    keyEvents: sumMetric(rows, 'keyEvents'),
  };
}

function gscTotals(rows: GscRow[]) {
  const clicks = sumMetric(rows, 'clicks');
  const impressions = sumMetric(rows, 'impressions');
  return {
    clicks,
    impressions,
    ctrPct: impressions === 0 ? 0 : round((clicks / impressions) * 100, 2),
  };
}

function normalizeGa4Rows(value: unknown): Ga4Row[] {
  if (!isRecord(value)) return [];
  const dimensionHeaders = Array.isArray(value.dimensionHeaders) ? value.dimensionHeaders : [];
  const metricHeaders = Array.isArray(value.metricHeaders) ? value.metricHeaders : [];
  const rows = Array.isArray(value.rows) ? value.rows : [];
  const dimensions = dimensionHeaders
    .map((header) => (isRecord(header) && typeof header.name === 'string' ? header.name : null))
    .filter(Boolean) as string[];
  const metrics = metricHeaders
    .map((header) => (isRecord(header) && typeof header.name === 'string' ? header.name : null))
    .filter(Boolean) as string[];

  return rows.map((row) => {
    const item: Ga4Row = {};
    if (!isRecord(row)) return item;
    const dimensionValues = Array.isArray(row.dimensionValues) ? row.dimensionValues : [];
    const metricValues = Array.isArray(row.metricValues) ? row.metricValues : [];
    dimensions.forEach((dimension, index) => {
      const dimensionValue = dimensionValues[index];
      item[dimension] =
        isRecord(dimensionValue) && typeof dimensionValue.value === 'string'
          ? dimensionValue.value
          : '';
    });
    metrics.forEach((metric, index) => {
      const metricValue = metricValues[index];
      const raw =
        isRecord(metricValue) && typeof metricValue.value === 'string' ? metricValue.value : '0';
      const numeric = Number(raw);
      item[metric] = Number.isFinite(numeric) ? numeric : raw;
    });
    return item;
  });
}

function normalizeGscRow(row: unknown, dimensions: Array<'query' | 'page'>) {
  if (!isRecord(row) || !Array.isArray(row.keys)) return null;
  const keys = row.keys as unknown[];
  const item: GscRow = {
    clicks: asNumber(row.clicks),
    impressions: asNumber(row.impressions),
    ctr: asNumber(row.ctr),
    ctrPct: round(asNumber(row.ctr) * 100, 2),
    position: round(asNumber(row.position), 1),
  };
  dimensions.forEach((dimension, index) => {
    const key = keys[index];
    if (typeof key === 'string') item[dimension] = key;
  });
  return item;
}

const BUYER_PATTERNS = [
  /費用|料金|価格|相場|見積/,
  /受託|外注|委託|依頼|発注/,
  /会社|ベンダー|パートナー|業者/,
  /比較|選び方|選定/,
  /導入|支援|代行|相談/,
  /rfp|poc|mvp|cdp/i,
];
const DEFINITIONAL_PATTERNS = [
  /とは|意味|読み方|一覧|サンプル|テンプレート|書き方|例$/,
  /違い/,
  /gherkin|ears|ガーキン|記法|構文|when then/i,
];

function classifyIntent(query: string) {
  if (BUYER_PATTERNS.some((pattern) => pattern.test(query))) return { intent: 'buyer', weight: 3 };
  if (DEFINITIONAL_PATTERNS.some((pattern) => pattern.test(query))) {
    return { intent: 'definitional', weight: 0.3 };
  }
  return { intent: 'neutral', weight: 1 };
}

function ctrOpportunities(rows: GscRow[], minImpressions: number) {
  return rows
    .filter(
      (row) =>
        row.query && row.position >= 5 && row.position <= 20 && row.impressions >= minImpressions
    )
    .map((row) => {
      const query = row.query || '';
      const { intent, weight } = classifyIntent(query);
      return {
        query,
        intent,
        impressions: row.impressions,
        clicks: row.clicks,
        ctrPct: row.ctrPct,
        position: row.position,
        opportunityScore: round(row.impressions * Math.max(0, 0.03 - row.ctr) * weight, 1),
      };
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}

function ga4Meta(env: MarketingEnv, range: { startDate: string; endDate: string }) {
  return {
    property: env.GA4_PROPERTY_ID,
    startDate: range.startDate,
    endDate: range.endDate,
    timezone: 'Asia/Tokyo',
  };
}

function gscMeta(env: MarketingEnv, range: { startDate: string; endDate: string }) {
  return {
    site: env.GSC_SITE_URL || 'sc-domain:beekle.jp',
    startDate: range.startDate,
    endDate: range.endDate,
    searchType: 'web',
    timezone: 'Pacific Time as reported by Search Console',
  };
}

function dateRange(args: Record<string, unknown>, defaultDays: number) {
  const endDate = optionalDate(args.endDate) ?? jstDate(-1);
  const startDate = optionalDate(args.startDate) ?? jstDate(-defaultDays);
  if (startDate > endDate) {
    throw new Error('startDate must be earlier than or equal to endDate.');
  }
  return { startDate, endDate };
}

function monthRange(month?: string) {
  if (month) {
    const [year, monthNumber] = parseMonth(month);
    return {
      month,
      startDate: formatUtcDate(new Date(Date.UTC(year, monthNumber - 1, 1))),
      endDate: formatUtcDate(new Date(Date.UTC(year, monthNumber, 0))),
    };
  }

  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const year = nowJst.getUTCFullYear();
  const currentMonth = nowJst.getUTCMonth();
  const start = new Date(Date.UTC(year, currentMonth - 1, 1));
  const end = new Date(Date.UTC(year, currentMonth, 0));
  return {
    month: `${start.getUTCFullYear()}-${pad2(start.getUTCMonth() + 1)}`,
    startDate: formatUtcDate(start),
    endDate: formatUtcDate(end),
  };
}

function previousMonthRange(month: string) {
  const [year, monthNumber] = parseMonth(month);
  const start = new Date(Date.UTC(year, monthNumber - 2, 1));
  const end = new Date(Date.UTC(year, monthNumber - 1, 0));
  return {
    month: `${start.getUTCFullYear()}-${pad2(start.getUTCMonth() + 1)}`,
    startDate: formatUtcDate(start),
    endDate: formatUtcDate(end),
  };
}

function optionalDate(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined;
  const text = optionalString(value);
  if (!text) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error('Date must be YYYY-MM-DD.');
  }
  return text;
}

function optionalMonth(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined;
  const text = optionalString(value);
  if (!text) return undefined;
  parseMonth(text);
  return text;
}

function parseMonth(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) throw new Error('month must be YYYY-MM.');
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || month < 1 || month > 12) {
    throw new Error('month must be YYYY-MM.');
  }
  return [year, month] as const;
}

function jstDate(offsetDays: number) {
  const date = new Date(Date.now() + 9 * 60 * 60 * 1000);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return formatUtcDate(date);
}

function formatUtcDate(date: Date) {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

function isGa4ReportName(value: string): value is Ga4ReportName {
  return Object.prototype.hasOwnProperty.call(GA4_REPORTS, value);
}

function sumMetric(rows: Array<Record<string, unknown>>, metric: string) {
  return rows.reduce((sum, row) => sum + asNumber(row[metric]), 0);
}

function asNumber(value: unknown) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

function secretHeaderValue(value: unknown) {
  return optionalString(value)?.replaceAll(/\r|\n/g, '');
}

function optionalStringArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string' && item.trim() !== '')
        .map((item) => item.trim())
    : [];
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const number = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, Math.trunc(number)));
}

function round(value: number, digits: number) {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

async function signJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  privateKeyPem: string
) {
  const unsigned = `${jsonToBase64Url(header)}.${jsonToBase64Url(payload)}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned)
  );
  return `${unsigned}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

function pemToArrayBuffer(pem: string) {
  const base64 = pem
    .replaceAll('-----BEGIN PRIVATE KEY-----', '')
    .replaceAll('-----END PRIVATE KEY-----', '')
    .replaceAll(/\s/g, '');
  const bytes = base64ToBytes(base64);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function jsonToBase64Url(value: Record<string, unknown>) {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function tryBase64Decode(value: string) {
  try {
    return new TextDecoder().decode(base64ToBytes(value));
  } catch {
    return null;
  }
}

function parseJson(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
