import {
  type StorySpec,
  type UserStory,
  isStorySpec,
  normalizeStorySpec,
  parseStorySpecJson,
} from '@/lib/story-spec';

export const REVISE_MODES = ['full', 'asis', 'story', 'revise'] as const;
export type ReviseMode = (typeof REVISE_MODES)[number];

export type ReviseRequest = {
  mode?: ReviseMode;
  description?: string;
  spec?: StorySpec;
  instruction?: string;
  storyId?: string;
};

export type ChatTurn = {
  role: 'user' | 'assistant';
  content: string;
};

const LANGUAGE_RULES = `値はすべて日本語。英語の As a / I want / So that は使わない。
role は「営業担当」、want は「出張先で領収書を申請する」、benefit は「月末にまとめる手間をなくす」のように、現場の人が話す言葉。
シナリオの本文も日本語。when は意図した行為を1つ。then は業務上の帰結。現在形・三人称。
値の先頭に Given / When / Then / 前提 / 操作 / 結果 は書かない。
画面名・ボタン名を normal / error / boundary に書かない。入力にない数値・固有名詞は捏造しない。`;

function specJson(spec: StorySpec): string {
  return JSON.stringify(spec, null, 2);
}

export function buildFullPrompt(description: string): string {
  return `あなたは要件定義の専門家です。発注側の担当者が書いた「やりたいこと」から、PM on Rails と同じ粒度で要件を整理してください。

# 入力
${description}

# 整理の順番
1. 現状（As-Is）と目指す姿（To-Be）を分ける。入力に現状が薄くても、書かれている範囲だけ書く。一般論で埋めない
2. ユーザーストーリーは「登場人物の目標」単位。システム機能の一覧にしない。1〜5件
3. 各ストーリーにシナリオを付ける。どのストーリーも正常系2、異常系1、境界1を欠かさない
4. ${LANGUAGE_RULES}
   - 良い when: 「営業担当が出張先で領収書を申請する」
   - 悪い when: 「申請ボタンをタップする」「申請画面を開く」
5. 非機能・制約・提案依頼は分かる範囲だけ。不明なら空配列

# 出力
有効な JSON オブジェクト1つだけ。前置き・コードフェンス・説明は出さない。

{
  "title": "業務名を含むタイトル",
  "background": "なぜ今これを整理するか（2〜4文。入力に根拠があることだけ）",
  "asIs": {
    "summary": "いまどうやっているか（2〜3文）",
    "actors": ["登場人物"],
    "tools": ["使っているもの"],
    "pains": ["困りごと"]
  },
  "toBe": {
    "summary": "実現したい姿（2〜3文）",
    "outcomes": ["実現したいこと"]
  },
  "stories": [
    {
      "id": "US-01",
      "role": "営業担当",
      "want": "出張先で領収書を申請する",
      "benefit": "月末にまとめる手間をなくす",
      "priority": "必須",
      "scenarios": [
        {
          "id": "SC-US-01-N1",
          "title": "空きを見て予約する",
          "type": "normal",
          "given": "会員が予約を始めている",
          "when": "空き枠を予約する",
          "then": "予約が残る"
        },
        {
          "id": "SC-US-01-N2",
          "title": "予約を変更する",
          "type": "normal",
          "given": "会員に予約がある",
          "when": "予約日時を変える",
          "then": "新しい日時で予約が残る"
        },
        {
          "id": "SC-US-01-E1",
          "title": "満員の枠は取れない",
          "type": "error",
          "given": "その枠は定員に達している",
          "when": "同じ枠を予約する",
          "then": "予約は残らない"
        },
        {
          "id": "SC-US-01-B1",
          "title": "最後の1枠は取れる",
          "type": "boundary",
          "given": "その枠は残り1人である",
          "when": "その枠を予約する",
          "then": "予約が残る"
        }
      ]
    }
  ],
  "nonFunctional": ["分かる範囲の非機能"],
  "constraints": ["分かる範囲の制約"],
  "proposalRequests": ["ベンダーに聞いてほしいこと"]
}

# 禁止
- EARS 記法、REQ-ID、イベント駆動などの専門ラベル
- 「自分が思う」「重要なポイントは」などの前置き`;
}

export function buildAsIsPrompt(description: string, spec: StorySpec): string {
  return `いまの整理のうち、現状と目指す姿だけを書き直してください。ストーリーとシナリオは触らない。

# もともとの入力
${description}

# いまの整理
${specJson(spec)}

# 出力
有効な JSON オブジェクト1つだけ。title / background / asIs / toBe を含む完全な StorySpec を返す。stories はいまの整理をそのまま残す。
${LANGUAGE_RULES}
前置きは出さない。`;
}

export function buildStoryPrompt(description: string, spec: StorySpec, storyId: string): string {
  const story = spec.stories.find((item) => item.id === storyId);
  return `指定したユーザーストーリーだけを書き直してください。他のストーリー、現状、目指す姿は触らない。

# もともとの入力
${description}

# いまの整理
${specJson(spec)}

# 対象
${storyId}
${story ? JSON.stringify(story, null, 2) : ''}

# 出力
有効な JSON オブジェクト1つだけ。完全な StorySpec を返す。対象ストーリー以外はそのまま残す。
対象ストーリーは id を ${storyId} のまま、誰が／何を／なぜとシナリオを現場の言葉で書き直す。
どのストーリーも正常系2、異常系1、境界1を欠かさない。
${LANGUAGE_RULES}
前置きは出さない。`;
}

export function buildRevisePrompt(
  description: string,
  spec: StorySpec,
  instruction: string
): string {
  return `担当者の指示だけを、いまの整理に反映してください。指示されていない箇所は残す。

# もともとの入力
${description}

# いまの整理
${specJson(spec)}

# 指示
${instruction}

# 出力
有効な JSON オブジェクト1つだけ。前置きは出さない。

{
  "note": "何を直したかを1〜2文",
  "spec": { いまの整理と同じ形の完全な StorySpec }
}

${LANGUAGE_RULES}`;
}

export function applyRevision(
  current: StorySpec,
  incoming: StorySpec,
  mode: ReviseMode,
  storyId?: string
): StorySpec {
  if (mode === 'full' || mode === 'revise') return incoming;
  if (mode === 'asis') {
    return {
      ...current,
      title: incoming.title || current.title,
      background: incoming.background,
      asIs: incoming.asIs,
      toBe: incoming.toBe,
    };
  }
  if (mode === 'story') {
    const next = pickRevisedStory(current, incoming, storyId);
    if (!next) return current;
    return {
      ...current,
      stories: current.stories.map((story) => (story.id === next.id ? next : story)),
    };
  }
  return incoming;
}

function pickRevisedStory(
  current: StorySpec,
  incoming: StorySpec,
  storyId?: string
): UserStory | null {
  if (storyId) {
    const matched = incoming.stories.find((story) => story.id === storyId);
    if (matched) return { ...matched, id: storyId };
    if (incoming.stories[0]) return { ...incoming.stories[0], id: storyId };
    return null;
  }
  const changed = incoming.stories.find((story, i) => {
    const before = current.stories[i];
    return !before || JSON.stringify(before) !== JSON.stringify(story);
  });
  return changed ?? incoming.stories[0] ?? null;
}

export function parseRevisionPayload(text: string): { spec: StorySpec; note: string } {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('JSON オブジェクトが見つかりません');
  }
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as {
    note?: unknown;
    spec?: unknown;
  } & Record<string, unknown>;
  if (parsed.spec && isStorySpec(parsed.spec)) {
    return {
      spec: normalizeStorySpec(parsed.spec),
      note:
        typeof parsed.note === 'string' && parsed.note.trim() ? parsed.note.trim() : '直しました。',
    };
  }
  return {
    spec: parseStorySpecJson(cleaned),
    note:
      typeof parsed.note === 'string' && parsed.note.trim() ? parsed.note.trim() : '直しました。',
  };
}

export function isReviseMode(value: unknown): value is ReviseMode {
  return typeof value === 'string' && (REVISE_MODES as readonly string[]).includes(value);
}
