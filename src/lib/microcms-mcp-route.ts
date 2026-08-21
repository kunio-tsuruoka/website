import {
  type MicrocmsMcpEnv,
  handleMicrocmsMcpRequest,
} from '../../workers/microcms-mcp/src/index';

type RuntimeLocals = {
  runtime?: {
    env?: Partial<MicrocmsMcpEnv>;
  };
};

export function handleMicrocmsMcpRoute(request: Request, locals: unknown) {
  return handleMicrocmsMcpRequest(request, resolveMicrocmsMcpEnv(locals));
}

function resolveMicrocmsMcpEnv(locals: unknown): MicrocmsMcpEnv {
  const runtime = (locals as RuntimeLocals).runtime;
  const env = runtime?.env ?? {};

  return {
    MICROCMS_SERVICE_DOMAIN: env.MICROCMS_SERVICE_DOMAIN ?? import.meta.env.MICROCMS_SERVICE_DOMAIN,
    MICROCMS_API_KEY: env.MICROCMS_API_KEY ?? import.meta.env.MICROCMS_API_KEY,
    OAUTH_PASSWORD: env.OAUTH_PASSWORD ?? import.meta.env.OAUTH_PASSWORD,
    OAUTH_SIGNING_SECRET: env.OAUTH_SIGNING_SECRET ?? import.meta.env.OAUTH_SIGNING_SECRET,
    MCP_BEARER_TOKEN: env.MCP_BEARER_TOKEN ?? import.meta.env.MCP_BEARER_TOKEN,
    ALLOWED_ENDPOINTS:
      env.ALLOWED_ENDPOINTS ??
      import.meta.env.ALLOWED_ENDPOINTS ??
      'blogs,columns,categories,qas,qa-categories',
    GSC_CLIENT_ID: env.GSC_CLIENT_ID ?? import.meta.env.GSC_CLIENT_ID,
    GSC_CLIENT_SECRET: env.GSC_CLIENT_SECRET ?? import.meta.env.GSC_CLIENT_SECRET,
    GSC_REFRESH_TOKEN: env.GSC_REFRESH_TOKEN ?? import.meta.env.GSC_REFRESH_TOKEN,
    GSC_SITE_URL: env.GSC_SITE_URL ?? import.meta.env.GSC_SITE_URL,
    GA4_PROPERTY_ID: env.GA4_PROPERTY_ID ?? import.meta.env.GA4_PROPERTY_ID,
    GA4_SERVICE_ACCOUNT_JSON:
      env.GA4_SERVICE_ACCOUNT_JSON ?? import.meta.env.GA4_SERVICE_ACCOUNT_JSON,
    GA4_CLIENT_EMAIL: env.GA4_CLIENT_EMAIL ?? import.meta.env.GA4_CLIENT_EMAIL,
    GA4_PRIVATE_KEY: env.GA4_PRIVATE_KEY ?? import.meta.env.GA4_PRIVATE_KEY,
    MICROSOFT_CLARITY_API_KEY:
      env.MICROSOFT_CLARITY_API_KEY ?? import.meta.env.MICROSOFT_CLARITY_API_KEY,
    MICROSODT_CLARITY_API_KEY:
      env.MICROSODT_CLARITY_API_KEY ?? import.meta.env.MICROSODT_CLARITY_API_KEY,
  };
}
