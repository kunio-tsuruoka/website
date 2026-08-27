import {
  type MarketingEnv,
  callMarketingTool,
  isMarketingToolName,
  marketingReadiness,
  marketingTools,
} from './marketing';

export type MicrocmsMcpEnv = {
  MICROCMS_SERVICE_DOMAIN: string;
  MICROCMS_API_KEY: string;
  OAUTH_PASSWORD?: string;
  OAUTH_SIGNING_SECRET?: string;
  MCP_BEARER_TOKEN?: string;
  ALLOWED_ENDPOINTS?: string;
} & MarketingEnv;

type Env = MicrocmsMcpEnv;

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

const SERVER_INFO = {
  name: 'beekle-cms-marketing-mcp',
  version: '0.3.2',
};

const DEFAULT_SCOPE = 'microcms:read microcms:write marketing:read';
const AUTH_CODE_TTL_SECONDS = 10 * 60;
/** ChatGPTが再認可なしで使い続けられるよう、アクセストークンは90日 */
export const ACCESS_TOKEN_TTL_SECONDS = 90 * 24 * 60 * 60;
/** リフレッシュでさらに延長する。1年以内に1回でも使えば継続できる */
export const REFRESH_TOKEN_TTL_SECONDS = 365 * 24 * 60 * 60;
const CLIENT_TTL_SECONDS = 365 * 24 * 60 * 60;
const SUPPORTED_GRANT_TYPES = ['authorization_code', 'refresh_token'] as const;
const DEFAULT_ALLOWED_ENDPOINTS = ['blogs', 'columns', 'categories', 'qas', 'qa-categories'];

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  vary: 'authorization',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type,authorization,mcp-session-id',
};

type RegisteredClientPayload = {
  type: 'client';
  redirect_uris: string[];
  client_name?: string;
  iat: number;
  exp: number;
};

type AuthorizationCodePayload = {
  type: 'authorization_code';
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  scope: string;
  resource: string;
  iat: number;
  exp: number;
};

type AccessTokenPayload = {
  type: 'access_token';
  sub: string;
  aud: string;
  scope: string;
  jti: string;
  iat: number;
  exp: number;
};

type RefreshTokenPayload = {
  type: 'refresh_token';
  sub: string;
  aud: string;
  scope: string;
  client_id: string;
  jti: string;
  iat: number;
  exp: number;
};

const tools = [
  {
    name: 'microcms_list_contents',
    description:
      'List MicroCMS contents from allowed endpoints. Use endpoint="blogs" for blog posts, endpoint="columns" for columns, endpoint="categories" for column categories, endpoint="qas" for FAQs, and endpoint="qa-categories" for FAQ categories.',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint: {
          type: 'string',
          enum: DEFAULT_ALLOWED_ENDPOINTS,
          description: 'MicroCMS endpoint ID.',
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 100,
          description: 'Number of contents to retrieve. Default 10.',
        },
        offset: {
          type: 'number',
          minimum: 0,
          description: 'Offset for pagination. Default 0.',
        },
        orders: {
          type: 'string',
          description: 'MicroCMS orders query, e.g. "-publishedAt" or "order".',
        },
        filters: {
          type: 'string',
          description: 'MicroCMS filters query.',
        },
        q: {
          type: 'string',
          description: 'MicroCMS full-text search query.',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated fields to retrieve.',
        },
      },
      required: ['endpoint'],
    },
  },
  {
    name: 'microcms_get_content',
    description: 'Get one MicroCMS content item by endpoint and contentId.',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint: {
          type: 'string',
          enum: DEFAULT_ALLOWED_ENDPOINTS,
        },
        contentId: {
          type: 'string',
          description: 'MicroCMS content ID.',
        },
        draftKey: {
          type: 'string',
          description: 'Optional draftKey for reading a specific draft.',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated fields to retrieve.',
        },
      },
      required: ['endpoint', 'contentId'],
    },
  },
  {
    name: 'microcms_create_content',
    description:
      'Create content in MicroCMS. Default status is draft. For columns, pass fields like title, content, description, category. For blogs, pass title, content/body, description, tags, eyecatch, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint: {
          type: 'string',
          enum: DEFAULT_ALLOWED_ENDPOINTS,
        },
        contentId: {
          type: 'string',
          description: 'Optional custom content ID. If omitted, MicroCMS generates one.',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published', 'closed'],
          description: 'Creation status. Default draft.',
        },
        fields: {
          type: 'object',
          description: 'Content fields matching the MicroCMS API schema.',
        },
      },
      required: ['endpoint', 'fields'],
    },
  },
  {
    name: 'microcms_update_content',
    description:
      'Update content in MicroCMS. Default status is draft, so published content becomes published-with-draft without changing the public version.',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint: {
          type: 'string',
          enum: DEFAULT_ALLOWED_ENDPOINTS,
        },
        contentId: {
          type: 'string',
          description: 'MicroCMS content ID.',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published'],
          description:
            'draft adds/updates draft content. published updates the currently published content. Default draft.',
        },
        fields: {
          type: 'object',
          description: 'Partial content fields to update.',
        },
      },
      required: ['endpoint', 'contentId', 'fields'],
    },
  },
  {
    name: 'microcms_delete_content',
    description: 'Delete content from MicroCMS by endpoint and contentId.',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint: {
          type: 'string',
          enum: DEFAULT_ALLOWED_ENDPOINTS,
        },
        contentId: {
          type: 'string',
          description: 'MicroCMS content ID.',
        },
      },
      required: ['endpoint', 'contentId'],
    },
  },
  ...marketingTools,
] as const;

export async function handleMicrocmsMcpRequest(request: Request, env: Env): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }

  const url = new URL(request.url);
  if (url.pathname === '/' || url.pathname === '/health') {
    return jsonResponse({
      ok: true,
      server: SERVER_INFO,
      endpoints: allowedEndpoints(env),
      marketing: marketingReadiness(env),
      mcp: '/mcp',
      auth: {
        type: 'oauth',
        ready: Boolean(oauthPassword(env)),
        authorizationEndpoint: '/authorize',
        tokenEndpoint: '/token',
        registrationEndpoint: '/register',
      },
    });
  }

  if (isProtectedResourceMetadataPath(url.pathname)) {
    return jsonResponse(protectedResourceMetadata(request));
  }

  if (isAuthorizationServerMetadataPath(url.pathname)) {
    return jsonResponse(authorizationServerMetadata(request));
  }

  if (url.pathname === '/register') {
    return handleClientRegistration(request, env);
  }

  if (url.pathname === '/authorize') {
    return handleAuthorize(request, env);
  }

  if (url.pathname === '/token') {
    return handleToken(request, env);
  }

  if (url.pathname !== '/mcp') {
    return jsonResponse({ error: 'not_found' }, 404);
  }

  const auth = await authorizeMcpRequest(request, env);
  if (auth) return auth;

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  let body: JsonRpcRequest | JsonRpcRequest[];
  try {
    body = (await request.json()) as JsonRpcRequest | JsonRpcRequest[];
  } catch {
    return jsonRpcError(null, -32700, 'Parse error');
  }

  if (Array.isArray(body)) {
    const results = await Promise.all(body.map((message) => handleMessage(message, env)));
    const responses = results.filter(Boolean);
    return responses.length > 0
      ? jsonResponse(responses)
      : new Response(null, { status: 202, headers: JSON_HEADERS });
  }

  const response = await handleMessage(body, env);
  return response
    ? jsonResponse(response)
    : new Response(null, { status: 202, headers: JSON_HEADERS });
}

export default {
  fetch: handleMicrocmsMcpRequest,
};

async function handleMessage(message: JsonRpcRequest, env: Env) {
  const id = message.id ?? null;
  const method = message.method;

  try {
    if (method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: String(message.params?.protocolVersion || '2025-06-18'),
          capabilities: {
            tools: {},
          },
          serverInfo: SERVER_INFO,
        },
      };
    }

    if (method === 'notifications/initialized') {
      return null;
    }

    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id,
        result: { tools },
      };
    }

    if (method === 'tools/call') {
      const name = asString(message.params?.name, 'name');
      const args = asRecord(message.params?.arguments ?? {});
      const result = await callTool(name, args, env);
      return {
        jsonrpc: '2.0',
        id,
        result,
      };
    }

    return rpcError(id, -32601, `Method not found: ${method}`);
  } catch (error) {
    return rpcError(id, -32000, error instanceof Error ? error.message : String(error));
  }
}

async function callTool(
  name: string,
  args: Record<string, unknown>,
  env: Env
): Promise<ToolResult> {
  switch (name) {
    case 'microcms_list_contents':
      return toolJson(await listContents(args, env));
    case 'microcms_get_content':
      return toolJson(await getContent(args, env));
    case 'microcms_create_content':
      return toolJson(await createContent(args, env));
    case 'microcms_update_content':
      return toolJson(await updateContent(args, env));
    case 'microcms_delete_content':
      return toolJson(await deleteContent(args, env));
    default:
      if (isMarketingToolName(name)) {
        return toolJson(await callMarketingTool(name, args, env));
      }
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function listContents(args: Record<string, unknown>, env: Env) {
  const endpoint = assertEndpoint(args.endpoint, env);
  const params = new URLSearchParams();
  params.set('limit', String(clampNumber(args.limit, 10, 1, 100)));
  params.set('offset', String(clampNumber(args.offset, 0, 0, 100000)));
  setOptionalParam(params, 'orders', args.orders);
  setOptionalParam(params, 'filters', args.filters);
  setOptionalParam(params, 'q', args.q);
  setOptionalParam(params, 'fields', args.fields);

  return microcmsFetch(env, endpoint, { params });
}

async function getContent(args: Record<string, unknown>, env: Env) {
  const endpoint = assertEndpoint(args.endpoint, env);
  const contentId = asString(args.contentId, 'contentId');
  const params = new URLSearchParams();
  setOptionalParam(params, 'draftKey', args.draftKey);
  setOptionalParam(params, 'fields', args.fields);

  return microcmsFetch(env, `${endpoint}/${encodeURIComponent(contentId)}`, { params });
}

async function createContent(args: Record<string, unknown>, env: Env) {
  const endpoint = assertEndpoint(args.endpoint, env);
  const fields = asRecord(args.fields);
  const status = asOptionalStatus(args.status, ['draft', 'published', 'closed'], 'draft');
  const contentId = optionalString(args.contentId);
  const params = new URLSearchParams();
  if (status !== 'published') params.set('status', status);

  const path = contentId ? `${endpoint}/${encodeURIComponent(contentId)}` : endpoint;
  return microcmsFetch(env, path, {
    method: contentId ? 'PUT' : 'POST',
    params,
    body: fields,
  });
}

async function updateContent(args: Record<string, unknown>, env: Env) {
  const endpoint = assertEndpoint(args.endpoint, env);
  const contentId = asString(args.contentId, 'contentId');
  const fields = asRecord(args.fields);
  const status = asOptionalStatus(args.status, ['draft', 'published'], 'draft');
  const params = new URLSearchParams();
  if (status === 'draft') params.set('status', 'draft');

  return microcmsFetch(env, `${endpoint}/${encodeURIComponent(contentId)}`, {
    method: 'PATCH',
    params,
    body: fields,
  });
}

async function deleteContent(args: Record<string, unknown>, env: Env) {
  const endpoint = assertEndpoint(args.endpoint, env);
  const contentId = asString(args.contentId, 'contentId');
  return microcmsFetch(env, `${endpoint}/${encodeURIComponent(contentId)}`, {
    method: 'DELETE',
  });
}

async function microcmsFetch(
  env: Env,
  path: string,
  options: {
    method?: string;
    params?: URLSearchParams;
    body?: Record<string, unknown>;
  } = {}
) {
  if (!env.MICROCMS_SERVICE_DOMAIN || !env.MICROCMS_API_KEY) {
    throw new Error('MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY are required.');
  }

  const params = options.params?.toString();
  const url = `https://${env.MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/${path}${params ? `?${params}` : ''}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'X-MICROCMS-API-KEY': env.MICROCMS_API_KEY,
      ...(options.body ? { 'content-type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const data = parseJson(text);
  if (!response.ok) {
    throw new Error(
      `microCMS ${response.status} ${response.statusText}: ${typeof data === 'string' ? data : JSON.stringify(data)}`
    );
  }

  return data ?? { ok: true };
}

async function authorizeMcpRequest(request: Request, env: Env) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : '';

  if (env.MCP_BEARER_TOKEN && token === env.MCP_BEARER_TOKEN) return null;

  if (token) {
    const payload = await verifySignedPayload<AccessTokenPayload>(token, env).catch(() => null);
    if (
      payload?.type === 'access_token' &&
      !isExpired(payload.exp) &&
      isAllowedResource(payload.aud, request)
    ) {
      return null;
    }
  }

  return unauthorizedResponse(request);
}

function unauthorizedResponse(request: Request) {
  const metadataUrl = `${new URL(request.url).origin}/.well-known/oauth-protected-resource`;
  return jsonResponse({ error: 'unauthorized' }, 401, {
    'www-authenticate': `Bearer resource_metadata="${metadataUrl}", scope="${DEFAULT_SCOPE}"`,
  });
}

function isProtectedResourceMetadataPath(pathname: string) {
  return (
    pathname === '/.well-known/oauth-protected-resource' ||
    pathname === '/.well-known/oauth-protected-resource/mcp'
  );
}

function isAuthorizationServerMetadataPath(pathname: string) {
  return (
    pathname === '/.well-known/oauth-authorization-server' ||
    pathname === '/.well-known/oauth-authorization-server/mcp' ||
    pathname === '/.well-known/openid-configuration'
  );
}

function protectedResourceMetadata(request: Request) {
  const origin = new URL(request.url).origin;
  return {
    resource: resourceIdentifier(request),
    authorization_servers: [origin],
    bearer_methods_supported: ['header'],
    scopes_supported: DEFAULT_SCOPE.split(' '),
    resource_documentation: 'https://beekle.jp',
  };
}

function authorizationServerMetadata(request: Request) {
  const origin = new URL(request.url).origin;
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/authorize`,
    token_endpoint: `${origin}/token`,
    registration_endpoint: `${origin}/register`,
    response_types_supported: ['code'],
    grant_types_supported: [...SUPPORTED_GRANT_TYPES],
    token_endpoint_auth_methods_supported: ['none'],
    code_challenge_methods_supported: ['S256'],
    scopes_supported: DEFAULT_SCOPE.split(' '),
  };
}

async function handleClientRegistration(request: Request, env: Env) {
  if (request.method !== 'POST') {
    return oauthError('invalid_request', 'POST is required.', 405);
  }

  let body: Record<string, unknown>;
  try {
    body = await readJsonObject(request);
  } catch (error) {
    return oauthError(error instanceof Error ? error.message : 'invalid_request');
  }

  const redirectUris = asStringArray(body.redirect_uris, 'redirect_uris');
  if (redirectUris.length === 0) {
    return oauthError('invalid_client_metadata', 'redirect_uris is required.');
  }

  const now = unixSeconds();
  const payload: RegisteredClientPayload = {
    type: 'client',
    redirect_uris: redirectUris,
    client_name: optionalString(body.client_name),
    iat: now,
    exp: now + CLIENT_TTL_SECONDS,
  };
  const clientId = `dcr_${await signPayload(payload, env)}`;

  return jsonResponse(
    {
      client_id: clientId,
      client_id_issued_at: now,
      client_secret_expires_at: 0,
      redirect_uris: redirectUris,
      grant_types: [...SUPPORTED_GRANT_TYPES],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
      scope: DEFAULT_SCOPE,
    },
    201
  );
}

async function handleAuthorize(request: Request, env: Env) {
  if (request.method === 'GET') {
    return authorizationForm(new URL(request.url));
  }

  if (request.method !== 'POST') {
    return htmlResponse('<h1>Method not allowed</h1>', 405);
  }

  const params = await readFormParams(request);
  const password = params.get('password') || '';
  const expectedPassword = oauthPassword(env);
  if (!expectedPassword || password !== expectedPassword) {
    return authorizationForm(new URL(request.url), params, 'Invalid password.');
  }

  const validation = await validateAuthorizationRequest(params, request, env);
  if (validation instanceof Response) return validation;

  const now = unixSeconds();
  const code = await signPayload(
    {
      type: 'authorization_code',
      client_id: validation.clientId,
      redirect_uri: validation.redirectUri,
      code_challenge: validation.codeChallenge,
      scope: validation.scope,
      resource: validation.resource,
      iat: now,
      exp: now + AUTH_CODE_TTL_SECONDS,
    } satisfies AuthorizationCodePayload,
    env
  );

  const redirect = new URL(validation.redirectUri);
  redirect.searchParams.set('code', code);
  redirect.searchParams.set('iss', new URL(request.url).origin);
  if (validation.state) redirect.searchParams.set('state', validation.state);
  return Response.redirect(redirect.toString(), 302);
}

async function validateAuthorizationRequest(
  params: URLSearchParams,
  request: Request,
  env: Env
): Promise<
  | Response
  | {
      clientId: string;
      redirectUri: string;
      codeChallenge: string;
      scope: string;
      resource: string;
      state?: string;
    }
> {
  if ((params.get('response_type') || '') !== 'code') {
    return authorizationErrorRedirect(params, request, 'unsupported_response_type');
  }

  const clientId = params.get('client_id') || '';
  const redirectUri = params.get('redirect_uri') || '';
  const codeChallenge = params.get('code_challenge') || '';
  const codeChallengeMethod = params.get('code_challenge_method') || '';
  const resource = params.get('resource') || resourceIdentifier(request);
  const scope = normalizeScope(params.get('scope'));

  if (!clientId || !redirectUri || !codeChallenge) {
    return authorizationErrorRedirect(params, request, 'invalid_request');
  }

  if (codeChallengeMethod !== 'S256') {
    return authorizationErrorRedirect(params, request, 'invalid_request', 'S256 PKCE is required.');
  }

  if (!isAllowedResource(resource, request)) {
    return authorizationErrorRedirect(params, request, 'invalid_target');
  }

  const client = await validateOAuthClient(clientId, redirectUri, env).catch(() => null);
  if (!client) {
    return authorizationErrorRedirect(params, request, 'invalid_client');
  }

  return {
    clientId,
    redirectUri,
    codeChallenge,
    scope,
    resource,
    state: params.get('state') || undefined,
  };
}

function authorizationErrorRedirect(
  params: URLSearchParams,
  request: Request,
  error: string,
  description?: string
) {
  const redirectUri = params.get('redirect_uri');
  if (!redirectUri) {
    return htmlResponse(`<h1>OAuth error</h1><p>${escapeHtml(error)}</p>`, 400);
  }

  try {
    const redirect = new URL(redirectUri);
    redirect.searchParams.set('error', error);
    redirect.searchParams.set('iss', new URL(request.url).origin);
    if (description) redirect.searchParams.set('error_description', description);
    const state = params.get('state');
    if (state) redirect.searchParams.set('state', state);
    return Response.redirect(redirect.toString(), 302);
  } catch {
    return htmlResponse(`<h1>OAuth error</h1><p>${escapeHtml(error)}</p>`, 400);
  }
}

async function handleToken(request: Request, env: Env) {
  if (request.method !== 'POST') {
    return oauthError('invalid_request', 'POST is required.', 405);
  }

  const params = await readFormParams(request);
  const grantType = params.get('grant_type') || '';

  if (grantType === 'authorization_code') {
    return handleAuthorizationCodeGrant(params, request, env);
  }

  if (grantType === 'refresh_token') {
    return handleRefreshTokenGrant(params, request, env);
  }

  return oauthError('unsupported_grant_type');
}

async function handleAuthorizationCodeGrant(params: URLSearchParams, request: Request, env: Env) {
  const code = params.get('code') || '';
  const codeVerifier = params.get('code_verifier') || '';
  const clientId = params.get('client_id') || '';
  const redirectUri = params.get('redirect_uri') || '';

  if (!code || !codeVerifier || !clientId || !redirectUri) {
    return oauthError('invalid_request');
  }

  const payload = await verifySignedPayload<AuthorizationCodePayload>(code, env).catch(() => null);
  if (
    !payload ||
    payload.type !== 'authorization_code' ||
    isExpired(payload.exp) ||
    payload.client_id !== clientId ||
    payload.redirect_uri !== redirectUri
  ) {
    return oauthError('invalid_grant');
  }

  const requestedResource = params.get('resource') || payload.resource;
  if (requestedResource !== payload.resource || !isAllowedResource(payload.resource, request)) {
    return oauthError('invalid_target');
  }

  const client = await validateOAuthClient(clientId, redirectUri, env).catch(() => null);
  if (!client) {
    return oauthError('invalid_client');
  }

  const expectedChallenge = await sha256Base64Url(codeVerifier);
  if (expectedChallenge !== payload.code_challenge) {
    return oauthError('invalid_grant');
  }

  return issueTokenSet({
    clientId,
    resource: payload.resource,
    scope: payload.scope,
    env,
  });
}

async function handleRefreshTokenGrant(params: URLSearchParams, request: Request, env: Env) {
  const refreshToken = params.get('refresh_token') || '';
  const clientId = params.get('client_id') || '';

  if (!refreshToken) {
    return oauthError('invalid_request');
  }

  const payload = await verifySignedPayload<RefreshTokenPayload>(refreshToken, env).catch(
    () => null
  );
  if (!payload || payload.type !== 'refresh_token' || isExpired(payload.exp)) {
    return oauthError('invalid_grant');
  }

  if (clientId && clientId !== payload.client_id) {
    return oauthError('invalid_client');
  }

  const requestedResource = params.get('resource') || payload.aud;
  if (requestedResource !== payload.aud || !isAllowedResource(payload.aud, request)) {
    return oauthError('invalid_target');
  }

  return issueTokenSet({
    clientId: payload.client_id,
    resource: payload.aud,
    scope: payload.scope,
    env,
  });
}

async function issueTokenSet(input: {
  clientId: string;
  resource: string;
  scope: string;
  env: Env;
}) {
  const now = unixSeconds();
  const accessToken = await signPayload(
    {
      type: 'access_token',
      sub: 'microcms-admin',
      aud: input.resource,
      scope: input.scope,
      jti: crypto.randomUUID(),
      iat: now,
      exp: now + ACCESS_TOKEN_TTL_SECONDS,
    } satisfies AccessTokenPayload,
    input.env
  );
  const refreshToken = await signPayload(
    {
      type: 'refresh_token',
      sub: 'microcms-admin',
      aud: input.resource,
      scope: input.scope,
      client_id: input.clientId,
      jti: crypto.randomUUID(),
      iat: now,
      exp: now + REFRESH_TOKEN_TTL_SECONDS,
    } satisfies RefreshTokenPayload,
    input.env
  );

  return jsonResponse({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
    refresh_token: refreshToken,
    refresh_token_expires_in: REFRESH_TOKEN_TTL_SECONDS,
    scope: input.scope,
  });
}

async function validateOAuthClient(clientId: string, redirectUri: string, env: Env) {
  if (!isAllowedRedirectUri(redirectUri)) return null;

  if (clientId.startsWith('dcr_')) {
    const payload = await verifySignedPayload<RegisteredClientPayload>(
      clientId.slice('dcr_'.length),
      env
    );
    if (payload.type !== 'client' || isExpired(payload.exp)) return null;
    if (!payload.redirect_uris.includes(redirectUri)) return null;
    return payload;
  }

  if (isTrustedOpenAiClient(clientId, redirectUri)) {
    return { type: 'client', redirect_uris: [redirectUri], iat: 0, exp: Number.MAX_SAFE_INTEGER };
  }

  return null;
}

function isTrustedOpenAiClient(clientId: string, redirectUri: string) {
  try {
    const client = new URL(clientId);
    const redirect = new URL(redirectUri);
    if (client.protocol !== 'https:' || redirect.protocol !== 'https:') return false;
    if (client.hostname !== 'chatgpt.com' || redirect.hostname !== 'chatgpt.com') return false;
    return (
      client.pathname.startsWith('/oauth/') &&
      (redirect.pathname === '/connector_platform_oauth_redirect' ||
        redirect.pathname.startsWith('/connector/oauth/'))
    );
  } catch {
    return false;
  }
}

function authorizationForm(url: URL, params = url.searchParams, error?: string) {
  const fields = [
    'response_type',
    'client_id',
    'redirect_uri',
    'scope',
    'state',
    'code_challenge',
    'code_challenge_method',
    'resource',
  ]
    .map((name) => {
      const value = params.get(name);
      return value === null
        ? ''
        : `<input type="hidden" name="${name}" value="${escapeHtml(value)}">`;
    })
    .join('');

  return htmlResponse(`<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Authorize Beekle MicroCMS MCP</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 0; background: #f7f8fb; color: #111827; }
      main { max-width: 420px; margin: 12vh auto; padding: 32px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 8px 32px rgba(17, 24, 39, 0.08); }
      h1 { font-size: 22px; margin: 0 0 12px; }
      p { line-height: 1.7; color: #4b5563; }
      label { display: block; font-weight: 700; margin: 24px 0 8px; }
      input[type="password"] { box-sizing: border-box; width: 100%; min-height: 44px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 12px; font-size: 16px; }
      button { width: 100%; min-height: 44px; margin-top: 16px; border: 0; border-radius: 6px; background: #3d4db7; color: white; font-weight: 700; font-size: 16px; cursor: pointer; }
      .error { color: #b91c1c; font-weight: 700; }
    </style>
  </head>
  <body>
    <main>
      <h1>Beekle MicroCMS MCP</h1>
      <p>ChatGPT に microCMS の記事管理ツールへのアクセスを許可します。</p>
      ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
      <form method="post" action="/authorize">
        ${fields}
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" autofocus required>
        <button type="submit">Authorize</button>
      </form>
    </main>
  </body>
</html>`);
}

async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  const value = (await request.json()) as unknown;
  return asRecord(value);
}

async function readFormParams(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await readJsonObject(request);
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') params.set(key, value);
      if (typeof value === 'number' || typeof value === 'boolean') params.set(key, String(value));
    }
    return params;
  }

  return new URLSearchParams(await request.text());
}

async function signPayload(payload: Record<string, unknown>, env: Env) {
  const body = textToBase64Url(JSON.stringify(payload));
  const signature = await hmacBase64Url(body, env);
  return `${body}.${signature}`;
}

async function verifySignedPayload<T extends Record<string, unknown>>(
  token: string,
  env: Env
): Promise<T> {
  const [body, signature, extra] = token.split('.');
  if (!body || !signature || extra !== undefined) {
    throw new Error('Invalid signed payload.');
  }

  const key = await signingKey(env);
  const ok = await crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlToBytes(signature),
    new TextEncoder().encode(body)
  );
  if (!ok) throw new Error('Invalid signature.');
  return JSON.parse(base64UrlToText(body)) as T;
}

async function hmacBase64Url(body: string, env: Env) {
  const signature = await crypto.subtle.sign(
    'HMAC',
    await signingKey(env),
    new TextEncoder().encode(body)
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

function signingKey(env: Env) {
  const secret = env.OAUTH_SIGNING_SECRET || oauthPassword(env);
  if (!secret) {
    throw new Error('OAUTH_SIGNING_SECRET is required.');
  }

  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function oauthPassword(env: Env) {
  return env.OAUTH_PASSWORD || env.MCP_BEARER_TOKEN || env.MICROCMS_API_KEY;
}

async function sha256Base64Url(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

function textToBase64Url(value: string) {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function base64UrlToText(value: string) {
  return new TextDecoder().decode(base64UrlToBytes(value));
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function base64UrlToBytes(value: string) {
  const padded = value
    .replaceAll('-', '+')
    .replaceAll('_', '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function resourceIdentifier(request: Request) {
  return `${new URL(request.url).origin}/mcp`;
}

function isAllowedResource(value: string, request: Request) {
  const origin = new URL(request.url).origin;
  return value === resourceIdentifier(request) || value === origin || value === `${origin}/`;
}

function normalizeScope(value: string | null) {
  const supported = new Set(DEFAULT_SCOPE.split(' '));
  const requested = (value || DEFAULT_SCOPE)
    .split(/\s+/)
    .map((scope) => scope.trim())
    .filter(Boolean)
    .filter((scope) => supported.has(scope));
  return requested.length > 0 ? requested.join(' ') : DEFAULT_SCOPE;
}

function oauthError(error: string, description?: string, status = 400) {
  return jsonResponse(
    {
      error,
      ...(description ? { error_description: description } : {}),
    },
    status
  );
}

function htmlResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function unixSeconds() {
  return Math.floor(Date.now() / 1000);
}

function isExpired(exp: number) {
  return typeof exp !== 'number' || exp <= unixSeconds();
}

function isAllowedRedirectUri(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return true;
    if (url.protocol !== 'http:') return false;
    return url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '::1';
  } catch {
    return false;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function assertEndpoint(value: unknown, env: Env) {
  const endpoint = asString(value, 'endpoint');
  const allowed = allowedEndpoints(env);
  if (!allowed.includes(endpoint)) {
    throw new Error(`Endpoint not allowed: ${endpoint}. Allowed: ${allowed.join(', ')}`);
  }
  return endpoint;
}

function allowedEndpoints(env: Env) {
  return (env.ALLOWED_ENDPOINTS || DEFAULT_ALLOWED_ENDPOINTS.join(','))
    .split(',')
    .map((endpoint) => endpoint.trim())
    .filter(Boolean);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Expected object.');
  }
  return value as Record<string, unknown>;
}

function asStringArray(value: unknown, field: string) {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array.`);
  }

  return value.map((item) => asString(item, field));
}

function asString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${field} must be a non-empty string.`);
  }
  return value.trim();
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

function asOptionalStatus(value: unknown, allowed: string[], fallback: string) {
  if (value === undefined || value === null || value === '') return fallback;
  const status = asString(value, 'status');
  if (!allowed.includes(status)) {
    throw new Error(`status must be one of: ${allowed.join(', ')}`);
  }
  return status;
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function setOptionalParam(params: URLSearchParams, key: string, value: unknown) {
  if (typeof value === 'string' && value.trim() !== '') {
    params.set(key, value.trim());
  }
}

function toolJson(value: unknown): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

function jsonResponse(body: unknown, status = 200, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...headers },
  });
}

function jsonRpcError(id: string | number | null, code: number, message: string) {
  return jsonResponse(rpcError(id, code, message));
}

function rpcError(id: string | number | null, code: number, message: string) {
  return {
    jsonrpc: '2.0',
    id,
    error: { code, message },
  };
}

function parseJson(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
