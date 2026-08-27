import { describe, expect, it } from 'vitest';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  handleMicrocmsMcpRequest,
} from '../workers/microcms-mcp/src/index';

const ORIGIN = 'https://beekle.jp';
const REDIRECT_URI = 'http://127.0.0.1:3210/callback';
const PASSWORD = 'oauth-test-password';
const TEST_ENV = {
  MICROCMS_SERVICE_DOMAIN: 'beekle-test',
  MICROCMS_API_KEY: 'microcms-test-key',
  OAUTH_PASSWORD: PASSWORD,
  OAUTH_SIGNING_SECRET: 'oauth-signing-secret-for-tests',
};

describe('MicroCMS MCP OAuth', () => {
  it('認可サーバーが refresh_token grant を公開する', async () => {
    const response = await handleMicrocmsMcpRequest(
      new Request(`${ORIGIN}/.well-known/oauth-authorization-server`),
      TEST_ENV
    );
    const body = (await response.json()) as {
      grant_types_supported: string[];
    };

    expect(response.status).toBe(200);
    expect(body.grant_types_supported).toEqual(['authorization_code', 'refresh_token']);
  });

  it('認可コード交換で90日の access token と refresh token を返す', async () => {
    const tokens = await completeAuthorization();

    expect(tokens.token_type).toBe('Bearer');
    expect(tokens.expires_in).toBe(ACCESS_TOKEN_TTL_SECONDS);
    expect(tokens.expires_in).toBe(90 * 24 * 60 * 60);
    expect(tokens.refresh_token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    expect(tokens.refresh_token_expires_in).toBe(REFRESH_TOKEN_TTL_SECONDS);
    expect(tokens.refresh_token_expires_in).toBe(365 * 24 * 60 * 60);

    const mcp = await callMcp(tokens.access_token);
    expect(mcp.status).toBe(200);
    expect(mcp.body.result.serverInfo.name).toBe('beekle-cms-marketing-mcp');
  });

  it('refresh_token で新しい access token を発行し、MCPを呼べる', async () => {
    const initial = await completeAuthorization();
    const refreshed = await requestToken({
      grant_type: 'refresh_token',
      refresh_token: initial.refresh_token,
      client_id: initial.clientId,
    });

    expect(refreshed.status).toBe(200);
    expect(refreshed.body.access_token).toBeTruthy();
    expect(refreshed.body.access_token).not.toBe(initial.access_token);
    expect(refreshed.body.refresh_token).toBeTruthy();
    expect(refreshed.body.expires_in).toBe(ACCESS_TOKEN_TTL_SECONDS);

    const mcp = await callMcp(refreshed.body.access_token);
    expect(mcp.status).toBe(200);
  });

  it('access token を refresh_token として渡すと拒否する', async () => {
    const tokens = await completeAuthorization();
    const refreshed = await requestToken({
      grant_type: 'refresh_token',
      refresh_token: tokens.access_token,
      client_id: tokens.clientId,
    });

    expect(refreshed.status).toBe(400);
    expect(refreshed.body.error).toBe('invalid_grant');
  });

  it('別クライアントの refresh_token は拒否する', async () => {
    const tokens = await completeAuthorization();
    const refreshed = await requestToken({
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
      client_id: 'someone-else',
    });

    expect(refreshed.status).toBe(400);
    expect(refreshed.body.error).toBe('invalid_client');
  });
});

async function completeAuthorization() {
  const { verifier, challenge } = await createPkce();
  const clientId = await registerClient();

  const authorize = await handleMicrocmsMcpRequest(
    new Request(`${ORIGIN}/authorize`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: REDIRECT_URI,
        scope: 'microcms:read marketing:read',
        state: 'state-1',
        code_challenge: challenge,
        code_challenge_method: 'S256',
        resource: `${ORIGIN}/mcp`,
        password: PASSWORD,
      }),
      redirect: 'manual',
    }),
    TEST_ENV
  );

  expect(authorize.status).toBe(302);
  const location = authorize.headers.get('location');
  expect(location).toBeTruthy();
  const code = new URL(location ?? '').searchParams.get('code');
  expect(code).toBeTruthy();

  const token = await requestToken({
    grant_type: 'authorization_code',
    code: code ?? '',
    code_verifier: verifier,
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    resource: `${ORIGIN}/mcp`,
  });

  expect(token.status).toBe(200);
  return { ...token.body, clientId };
}

async function registerClient() {
  const response = await handleMicrocmsMcpRequest(
    new Request(`${ORIGIN}/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        client_name: 'vitest',
        redirect_uris: [REDIRECT_URI],
      }),
    }),
    TEST_ENV
  );
  const body = (await response.json()) as { client_id: string; grant_types: string[] };
  expect(response.status).toBe(201);
  expect(body.grant_types).toEqual(['authorization_code', 'refresh_token']);
  return body.client_id;
}

async function requestToken(params: Record<string, string>) {
  const response = await handleMicrocmsMcpRequest(
    new Request(`${ORIGIN}/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    }),
    TEST_ENV
  );
  const body = (await response.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    refresh_token_expires_in: number;
    scope: string;
    error?: string;
  };
  return { status: response.status, body };
}

async function callMcp(accessToken: string) {
  const response = await handleMicrocmsMcpRequest(
    new Request(`${ORIGIN}/mcp`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2025-06-18' },
      }),
    }),
    TEST_ENV
  );
  const body = (await response.json()) as {
    result: { serverInfo: { name: string } };
  };
  return { status: response.status, body };
}

async function createPkce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const verifier = bytesToBase64Url(bytes);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, challenge: bytesToBase64Url(new Uint8Array(digest)) };
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
