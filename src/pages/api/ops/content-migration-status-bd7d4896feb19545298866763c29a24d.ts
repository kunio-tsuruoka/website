import type { APIRoute } from 'astro';
import { createClient } from 'microcms-js-sdk';

export const prerender = false;

type RuntimeEnv = {
  MICROCMS_SERVICE_DOMAIN?: string;
  MICROCMS_API_KEY?: string;
};

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as { runtime?: { env?: RuntimeEnv } }).runtime;
  const env = runtime?.env ?? {};
  const serviceDomain = env.MICROCMS_SERVICE_DOMAIN ?? '';
  const apiKey = env.MICROCMS_API_KEY ?? '';

  if (!serviceDomain || !apiKey) {
    return new Response(
      JSON.stringify({ ok: false, hasServiceDomain: Boolean(serviceDomain), hasApiKey: Boolean(apiKey) }),
      { status: 503, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } }
    );
  }

  try {
    const client = createClient({ serviceDomain, apiKey });
    const [gherkin, workflow, qa] = await Promise.all([
      client.get({ endpoint: 'columns', contentId: 'gherkin-bdd-introduction', queries: { fields: 'id,title,content' } }),
      client.get({ endpoint: 'columns', contentId: 'ears-gherkin-workflow', queries: { fields: 'id,title,content' } }),
      client.get({ endpoint: 'qas', contentId: 'requirements-14', queries: { fields: 'id,question,answer' } }),
    ]);

    const gherkinContent = String(gherkin.content ?? '');
    const workflowContent = String(workflow.content ?? '');
    return new Response(
      JSON.stringify({
        ok: true,
        hasServiceDomain: true,
        hasApiKey: true,
        gherkin: {
          modern: gherkinContent.includes('Gherkinは「具体例」から書く'),
          oldRelation: gherkinContent.includes('Gherkin と EARS の関係'),
          oldStep: gherkinContent.includes('ユーザーストーリーと EARS で要件を整える'),
        },
        workflow: {
          modernTitle: String(workflow.title ?? '').includes('EARSは補助記法'),
          modernBody: workflowContent.includes('Beekle標準の必須工程ではありません'),
        },
        qa: {
          modernQuestion: qa.question === 'User StoryからGherkinへはどうつなげますか？',
          question: qa.question,
        },
      }),
      { status: 200, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'unknown error' }),
      { status: 500, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } }
    );
  }
};
