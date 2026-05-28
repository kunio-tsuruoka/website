import { z } from 'zod';

export const COMPANY_SIZE_VALUES = ['1-10', '11-50', '51-200', '201-500', '500+'] as const;
export const PHASE_VALUES = ['discovery', 'rfp_prep', 'comparing', 'budgeting', 'decided'] as const;
export const BUDGET_RANGE_VALUES = [
  'unknown',
  'under_100',
  '100_500',
  '500_2000',
  'over_2000',
] as const;
export const TIMELINE_VALUES = ['unknown', '1_3m', '3_6m', '6_12m', 'over_12m'] as const;

export const HearingProfileSchema = z.object({
  industry: z.string().nullable().default(null),
  companySize: z.enum(COMPANY_SIZE_VALUES).nullable().default(null),
  phase: z.enum(PHASE_VALUES).nullable().default(null),
  painPoints: z.array(z.string()).default([]),
  currentWorkaround: z.string().nullable().default(null),
  impact: z.string().nullable().default(null),
  existingSystems: z.array(z.string()).default([]),
  dataSources: z.array(z.string()).default([]),
  budgetRange: z.enum(BUDGET_RANGE_VALUES).nullable().default(null),
  timeline: z.enum(TIMELINE_VALUES).nullable().default(null),
  decisionMakers: z.array(z.string()).default([]),
  priorAttempts: z.array(z.string()).default([]),
  successCriteria: z.array(z.string()).default([]),
  contactEmail: z.string().email().nullable().default(null),
  contactName: z.string().nullable().default(null),
  contactCompany: z.string().nullable().default(null),
});

export type HearingProfile = z.infer<typeof HearingProfileSchema>;

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;

export const SessionStateSchema = z.object({
  sessionId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  messages: z.array(MessageSchema),
  profile: HearingProfileSchema,
  status: z.enum(['active', 'ready', 'submitted']).default('active'),
});

export type SessionState = z.infer<typeof SessionStateSchema>;

export const CORE_FIELDS: Array<keyof HearingProfile> = [
  'industry',
  'companySize',
  'phase',
  'painPoints',
  'impact',
  'budgetRange',
  'timeline',
];

export const READY_THRESHOLD = 6;

export function completenessScore(profile: HearingProfile): {
  filled: number;
  total: number;
  ratio: number;
  ready: boolean;
} {
  let filled = 0;
  for (const key of CORE_FIELDS) {
    const v = profile[key];
    if (Array.isArray(v) ? v.length > 0 : v !== null && v !== '') filled += 1;
  }
  const total = CORE_FIELDS.length;
  return { filled, total, ratio: filled / total, ready: filled >= READY_THRESHOLD };
}

export type ChatApiResponse =
  | {
      sessionId: string;
      assistantMessage: string;
      profile: HearingProfile;
      progress: { filled: number; total: number; ratio: number; ready: boolean };
      status: SessionState['status'];
    }
  | { error: string; message?: string };

export type SubmitApiResponse =
  | { ok: true; sessionId: string }
  | { error: string; message?: string };
