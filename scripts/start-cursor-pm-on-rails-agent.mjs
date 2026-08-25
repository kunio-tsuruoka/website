#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const CURSOR_API_URL = 'https://api.cursor.com/v1/agents';
const DEFAULT_PM_ON_RAILS_MCP_URL = 'https://pmonrails.com/api/mcp';
const DEFAULT_PM_ON_RAILS_PROJECT = 'pm-on-rails';

const args = process.argv.slice(2);

function readArgValue(name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }

  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${name} requires a value.`);
  }

  return value;
}

function hasFlag(name) {
  return args.includes(name);
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function optionalEnv(name, fallback) {
  return process.env[name] || fallback;
}

function gitValue(...gitArgs) {
  try {
    return execFileSync('git', gitArgs, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function toHttpsGitHubUrl(remoteUrl) {
  if (!remoteUrl) {
    return '';
  }

  if (remoteUrl.startsWith('git@github.com:')) {
    return `https://github.com/${remoteUrl.replace('git@github.com:', '').replace(/\.git$/, '')}`;
  }

  if (remoteUrl.startsWith('https://github.com/')) {
    return remoteUrl.replace(/\.git$/, '');
  }

  return remoteUrl;
}

function envBool(name, fallback) {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  return !['0', 'false', 'no'].includes(value.toLowerCase());
}

function redactPayload(payload) {
  return {
    ...payload,
    mcpServers: payload.mcpServers.map((server) => ({
      ...server,
      headers: {
        ...server.headers,
        Authorization: 'Bearer <redacted>',
      },
    })),
  };
}

function defaultPrompt(projectName) {
  return `PM on Rails MCPで connect_project(name_or_id: "${projectName}") を呼んで Project に接続し、現在の実装対象タスクを取得してください。仕様・Gherkin・受入条件を確認し、必要な実装とテストを行い、PRを作成してください。`;
}

async function main() {
  const dryRun = hasFlag('--dry-run');

  if (hasFlag('--help')) {
    console.log(`Usage:
  bun run agent:pm-on-rails [--prompt "..."] [--ref main] [--repo https://github.com/org/repo] [--dry-run]

Environment:
  CURSOR_API_KEY       Cursor API key
  PM_ON_RAILS_PAT     PM on Rails personal access token

Optional:
  CURSOR_REPO_URL             Overrides git remote origin
  CURSOR_STARTING_REF         Defaults to main
  CURSOR_AUTO_CREATE_PR       Defaults to true
  CURSOR_SKIP_REVIEWER        Defaults to false
  PM_ON_RAILS_MCP_URL         Defaults to ${DEFAULT_PM_ON_RAILS_MCP_URL}
  PM_ON_RAILS_PROJECT         Defaults to ${DEFAULT_PM_ON_RAILS_PROJECT}
  CURSOR_PM_ON_RAILS_PROMPT   Overrides the default prompt
`);
    return;
  }

  const cursorApiKey = dryRun
    ? process.env.CURSOR_API_KEY || '<dry-run>'
    : requiredEnv('CURSOR_API_KEY');
  const pmOnRailsPat = dryRun
    ? process.env.PM_ON_RAILS_PAT || '<dry-run>'
    : requiredEnv('PM_ON_RAILS_PAT');
  const repoUrl =
    readArgValue('--repo') ||
    optionalEnv(
      'CURSOR_REPO_URL',
      toHttpsGitHubUrl(gitValue('config', '--get', 'remote.origin.url'))
    );
  const startingRef = readArgValue('--ref') || optionalEnv('CURSOR_STARTING_REF', 'main');
  const projectName =
    readArgValue('--project') || optionalEnv('PM_ON_RAILS_PROJECT', DEFAULT_PM_ON_RAILS_PROJECT);
  const prompt =
    readArgValue('--prompt') ||
    optionalEnv('CURSOR_PM_ON_RAILS_PROMPT', defaultPrompt(projectName));
  const autoCreatePR = hasFlag('--no-pr') ? false : envBool('CURSOR_AUTO_CREATE_PR', true);
  const skipReviewerRequest = envBool('CURSOR_SKIP_REVIEWER', false);
  const pmOnRailsMcpUrl = optionalEnv('PM_ON_RAILS_MCP_URL', DEFAULT_PM_ON_RAILS_MCP_URL);

  if (!repoUrl) {
    throw new Error('Repository URL is required. Set CURSOR_REPO_URL or pass --repo.');
  }

  const payload = {
    prompt: {
      text: prompt,
    },
    repos: [
      {
        url: repoUrl,
        startingRef,
      },
    ],
    mcpServers: [
      {
        name: 'pm-on-rails',
        type: 'http',
        url: pmOnRailsMcpUrl,
        headers: {
          Authorization: `Bearer ${pmOnRailsPat}`,
        },
      },
    ],
    autoCreatePR,
    skipReviewerRequest,
  };

  if (dryRun) {
    console.log(JSON.stringify(redactPayload(payload), null, 2));
    return;
  }

  const response = await fetch(CURSOR_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cursorApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : {};

  if (!response.ok) {
    console.error(JSON.stringify(body, null, 2));
    throw new Error(`Cursor Cloud Agent create failed: ${response.status} ${response.statusText}`);
  }

  console.log(
    JSON.stringify(
      {
        agentId: body.agent?.id,
        agentUrl: body.agent?.url,
        runId: body.run?.id,
        runStatus: body.run?.status,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
