/**
 * GSC OAuth セットアップ
 * ブラウザで Google 認証 → リフレッシュトークンを保存
 *
 * 使い方: node scripts/gsc-oauth-setup.mjs
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { URL } from 'node:url';

const CLIENT_FILE = '/Users/kunio/.gcp-keys/oauth-client.json';
const TOKEN_FILE = '/Users/kunio/.gcp-keys/gsc-token.json';
const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];
const REDIRECT_PORT = 8085;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;

const raw = JSON.parse(readFileSync(CLIENT_FILE, 'utf-8'));
const creds = raw.installed || raw.web;
const clientId = creds.client_id;
const clientSecret = creds.client_secret;

const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', clientId);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', SCOPES.join(' '));
authUrl.searchParams.set('access_type', 'offline');
authUrl.searchParams.set('prompt', 'consent');

console.log('Opening browser for Google authentication...');
console.log('If browser does not open, visit:', authUrl.toString());

import('node:child_process').then((cp) => cp.exec(`open "${authUrl.toString()}"`));

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);
  if (url.pathname !== '/callback') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400);
    res.end('No code received');
    return;
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();

    if (tokens.error) {
      res.writeHead(500);
      res.end(`Error: ${tokens.error_description || tokens.error}`);
      console.error('Token error:', tokens);
      server.close();
      return;
    }

    writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), { mode: 0o600 });
    console.log('Token saved to', TOKEN_FILE);

    // Test access
    const testRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const sites = await testRes.json();
    console.log(
      'Accessible sites:',
      JSON.stringify(sites.siteEntry?.map((s) => s.siteUrl) || [], null, 2)
    );

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>GSC OAuth setup complete</h1><p>You can close this tab.</p>');
  } catch (e) {
    res.writeHead(500);
    res.end(`Error: ${e.message}`);
    console.error(e);
  }

  server.close();
});

server.listen(REDIRECT_PORT, () => {
  console.log(`Waiting for callback on port ${REDIRECT_PORT}...`);
});
