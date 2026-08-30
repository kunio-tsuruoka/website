import { publishDataCompanyLearningSensor } from '@/lib/publish-data-company-learning-sensor';
import type { APIRoute } from 'astro';

export const prerender = false;

type RuntimeLocals = {
  runtime?: {
    env?: {
      MICROCMS_SERVICE_DOMAIN?: string;
      MICROCMS_API_KEY?: string;
    };
  };
};

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as unknown as RuntimeLocals).runtime?.env ?? {};

  try {
    const result = await publishDataCompanyLearningSensor(env);
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        },
      }
    );
  }
};
