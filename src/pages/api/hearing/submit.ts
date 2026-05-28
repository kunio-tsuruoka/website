import { HearingProfileSchema } from '@/features/ai-hearing/types';
import { getAiEnv } from '@/lib/ai-guards';
import { readSession, writeSession } from '@/lib/hearing/session';
import { notifyHearingLead, notifyOpsAlert } from '@/lib/ops-alert';
import { limitByIp, rateLimitResponse } from '@/lib/rate-limit';
import type { APIRoute } from 'astro';
import { z } from 'zod';

export const prerender = false;

const ContactPatchSchema = z.object({
  contactName: z.string().min(1).max(80).optional(),
  contactEmail: z.string().email().max(160),
  contactCompany: z.string().min(1).max(120).optional(),
});

const SubmitRequestSchema = z.object({
  sessionId: z.string().min(8).max(64),
  contact: ContactPatchSchema,
  editedProfile: HearingProfileSchema.partial().optional(),
});

function jsonError(status: number, code: string, message?: string): Response {
  return new Response(JSON.stringify({ error: code, ...(message ? { message } : {}) }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function profileToMarkdownSummary(p: Record<string, unknown>): string {
  const phaseLabel: Record<string, string> = {
    discovery: '課題はあるが何を作るか未定',
    rfp_prep: 'RFP準備中',
    comparing: 'ベンダー比較中',
    budgeting: '予算化中',
    decided: '発注先内定',
  };
  const budgetLabel: Record<string, string> = {
    unknown: '未定',
    under_100: '100万円未満',
    '100_500': '100〜500万円',
    '500_2000': '500〜2000万円',
    over_2000: '2000万円以上',
  };
  const timelineLabel: Record<string, string> = {
    unknown: '未定',
    '1_3m': '1〜3ヶ月',
    '3_6m': '3〜6ヶ月',
    '6_12m': '6〜12ヶ月',
    over_12m: '1年以上',
  };

  const lines: string[] = [];
  if (p.industry) lines.push(`業種: ${p.industry}`);
  if (p.companySize) lines.push(`規模: ${p.companySize} 人`);
  if (p.phase && typeof p.phase === 'string') {
    lines.push(`検討フェーズ: ${phaseLabel[p.phase] ?? p.phase}`);
  }
  if (Array.isArray(p.painPoints) && p.painPoints.length > 0) {
    lines.push(`業務課題:\n- ${p.painPoints.join('\n- ')}`);
  }
  if (p.impact) lines.push(`影響規模: ${p.impact}`);
  if (p.currentWorkaround) lines.push(`現状の対応: ${p.currentWorkaround}`);
  if (Array.isArray(p.existingSystems) && p.existingSystems.length > 0) {
    lines.push(`既存システム: ${p.existingSystems.join(', ')}`);
  }
  if (Array.isArray(p.dataSources) && p.dataSources.length > 0) {
    lines.push(`データソース: ${p.dataSources.join(', ')}`);
  }
  if (p.budgetRange && typeof p.budgetRange === 'string') {
    lines.push(`予算感: ${budgetLabel[p.budgetRange] ?? p.budgetRange}`);
  }
  if (p.timeline && typeof p.timeline === 'string') {
    lines.push(`期日感: ${timelineLabel[p.timeline] ?? p.timeline}`);
  }
  if (Array.isArray(p.decisionMakers) && p.decisionMakers.length > 0) {
    lines.push(`意思決定者: ${p.decisionMakers.join(', ')}`);
  }
  if (Array.isArray(p.priorAttempts) && p.priorAttempts.length > 0) {
    lines.push(`過去の試み:\n- ${p.priorAttempts.join('\n- ')}`);
  }
  if (Array.isArray(p.successCriteria) && p.successCriteria.length > 0) {
    lines.push(`成功条件:\n- ${p.successCriteria.join('\n- ')}`);
  }
  return lines.join('\n\n');
}

export const POST: APIRoute = async ({ locals, request }) => {
  const env = getAiEnv(locals);
  if (!env) return jsonError(500, 'runtime_unavailable');
  if (!env.RATE_LIMIT) return jsonError(503, 'binding_missing');

  const limit = await limitByIp(env.RATE_LIMIT, request, {
    endpoint: 'hearing-submit',
    perMin: 2,
    perDay: 10,
  });
  if (!limit.ok) return rateLimitResponse(limit);

  let body: z.infer<typeof SubmitRequestSchema>;
  try {
    body = SubmitRequestSchema.parse(await request.json());
  } catch (err) {
    return jsonError(400, 'invalid_payload', err instanceof Error ? err.message : 'unknown');
  }

  const session = await readSession(env.RATE_LIMIT, body.sessionId);
  if (!session) return jsonError(404, 'session_not_found');
  if (session.status === 'submitted') {
    return jsonError(409, 'already_submitted');
  }

  // ユーザーがサマリ画面で編集した内容を反映 (contactEmail は必須なので確実に上書き)
  const merged = {
    ...session.profile,
    ...(body.editedProfile ?? {}),
    contactName: body.contact.contactName ?? session.profile.contactName,
    contactEmail: body.contact.contactEmail,
    contactCompany: body.contact.contactCompany ?? session.profile.contactCompany,
  };

  if (!env.SLACK_WEBHOOK_URL) {
    // 本番でこの状態は事故。ops アラートを試みつつ、ユーザーには500を返す
    await notifyOpsAlert(env.RATE_LIMIT, env.SLACK_WEBHOOK_URL, 'llm_unknown_error', {
      endpoint: '/api/hearing/submit',
      detail: 'SLACK_WEBHOOK_URL が未設定。リードを取りこぼしました。',
    });
    return jsonError(
      503,
      'webhook_missing',
      '送信先設定が不足しています。お問い合わせフォームをご利用ください。'
    );
  }

  const summary = profileToMarkdownSummary(merged as unknown as Record<string, unknown>);

  try {
    await notifyHearingLead(env.SLACK_WEBHOOK_URL, {
      sessionId: session.sessionId,
      summary,
      profile: merged as unknown as Record<string, unknown>,
      contact: {
        name: merged.contactName,
        email: merged.contactEmail,
        company: merged.contactCompany,
      },
    });
  } catch (err) {
    await notifyOpsAlert(env.RATE_LIMIT, env.SLACK_WEBHOOK_URL, 'llm_unknown_error', {
      endpoint: '/api/hearing/submit',
      detail: `Slack送信失敗: ${err instanceof Error ? err.message : String(err)}`,
    });
    return jsonError(502, 'webhook_failed', '送信に失敗しました。時間をおいてお試しください。');
  }

  await writeSession(env.RATE_LIMIT, {
    ...session,
    profile: merged,
    status: 'submitted',
    updatedAt: Date.now(),
  });

  return new Response(JSON.stringify({ ok: true, sessionId: session.sessionId }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
