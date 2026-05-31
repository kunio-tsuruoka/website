import { z } from 'zod';

// 会話メッセージ（ai-hearing と同形）
export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

// flow-mapper の FlowDiagram を検証するための zod スキーマ（セッション読み出し時の防御用）。
// 型の真実源は src/features/flow-mapper/types.ts の FlowDiagram。ここは構造検証のみ。
export const FlowStepSchema = z.object({
  id: z.string(),
  type: z.enum(['start', 'task', 'decision', 'system', 'wait', 'end']),
  laneId: z.string(),
  phaseId: z.string(),
  label: z.string(),
  durationMin: z.number(),
  tool: z.string(),
  pain: z.string(),
  improvement: z.string(),
  next: z.array(z.string()),
  quantity: z.number().optional(),
  unitCostYen: z.number().optional(),
  unitLabel: z.string().optional(),
  costMode: z.enum(['labor', 'variable', 'both']).optional(),
});

export const FlowDiagramSchema = z.object({
  title: z.string(),
  phases: z.array(z.object({ id: z.string(), name: z.string() })),
  lanes: z.array(
    z.object({ id: z.string(), name: z.string(), rateYenPerHour: z.number().optional() })
  ),
  steps: z.array(FlowStepSchema),
});

export const EMPTY_DIAGRAM = { title: '業務フロー', phases: [], lanes: [], steps: [] };

// セッションに保存する改善提案（lib/flow-interview/suggest.ts の FlowSuggestion 相当を緩く検証）
export const SessionSuggestionSchema = z.object({
  kind: z.string(),
  target: z.string(),
  title: z.string(),
  effect: z.string(),
  detail: z.string(),
});

export const SessionStateSchema = z.object({
  sessionId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  messages: z.array(MessageSchema),
  diagram: FlowDiagramSchema,
  turns: z.number().default(0),
  status: z.enum(['active', 'done']).default('active'),
  // 会話ステートマシンの現在ノード（src/lib/flow-interview/graph.ts の FlowNode）
  node: z.enum(['overview', 'steps', 'actors', 'duration', 'done']).default('overview'),
  suggestSummary: z.string().nullable().default(null),
  suggestions: z.array(SessionSuggestionSchema).default([]),
});
export type SessionState = z.infer<typeof SessionStateSchema>;

// チャット API のレスポンス（start / answer 共通）
export type FlowChatResponse =
  | {
      sessionId: string;
      assistantMessage: string;
      diagram: z.infer<typeof FlowDiagramSchema>;
      stepCount: number;
      isReady: boolean;
    }
  | { error: string; message?: string };
