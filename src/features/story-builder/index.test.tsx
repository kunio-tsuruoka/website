import { StoryBuilder } from '@/features/story-builder';
import { normalizeStorySpec } from '@/lib/story-spec';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}));

const spec = normalizeStorySpec({
  title: '経費精算システムの要件整理',
  background: '紙の精算が月末に集中している。',
  asIs: {
    summary: '出張後に紙の領収書をまとめて申請している。',
    actors: ['営業担当', '上長'],
    tools: ['紙', 'Excel'],
    pains: ['領収書をなくす'],
  },
  toBe: {
    summary: '出張先からその場で申請できる。',
    outcomes: ['紛失がなくなる'],
  },
  stories: [
    {
      role: '営業担当',
      want: '出張先で領収書を撮影して申請したい',
      benefit: '帰社後にまとめる手間をなくしたい',
      priority: '必須',
      scenarios: [
        {
          title: '撮影した領収書で申請する',
          type: 'normal',
          given: '営業担当が出張中である',
          when: '領収書を撮影して申請する',
          outcome: '上長に承認依頼が届く',
        },
        {
          title: '通信できないときに下書きが残る',
          type: 'error',
          given: '申請の途中である',
          when: '送信中に通信できなくなる',
          outcome: '下書きが残り、あとから再送できる',
        },
      ],
    },
  ],
  nonFunctional: [],
  constraints: [],
  proposalRequests: ['概算費用を出してほしい'],
});

describe('StoryBuilder', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('入力から現状・ストーリー・RFPまで進める', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ success: true, spec }),
      })
    );

    render(<StoryBuilder />);

    expect(
      screen.getByRole('heading', { name: 'いまの業務と、こうしたいを書く' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'サンプルを入れる' }));
    fireEvent.click(screen.getByRole('button', { name: '現状・ストーリー・RFPに整理する' }));

    await waitFor(() => {
      expect(screen.getByText('いまどうやっているか')).toBeInTheDocument();
    });
    expect(
      screen.getByDisplayValue('出張後に紙の領収書をまとめて申請している。')
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('出張先からその場で申請できる。')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('出張後に紙の領収書をまとめて申請している。'), {
      target: { value: '月末に紙の領収書をまとめて申請している。' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'ストーリーを直す' }));
    expect(screen.getByText('営業担当が、出張先で領収書を撮影して申請したい')).toBeInTheDocument();
    expect(screen.getByText('誰が')).toBeInTheDocument();
    expect(screen.getByText('何を')).toBeInTheDocument();
    expect(screen.getByText('なぜ')).toBeInTheDocument();
    expect(screen.getByDisplayValue('撮影した領収書で申請する')).toBeInTheDocument();
    expect(screen.getAllByText('前提（Given）').length).toBeGreaterThan(0);
    expect(screen.getAllByText('操作（When）').length).toBeGreaterThan(0);
    expect(screen.getAllByText('期待する結果（Then）').length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('上長に承認依頼が届く')).toBeInTheDocument();
    expect(screen.getByDisplayValue('通信できないときに下書きが残る')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Gherkin（.feature）をダウンロード' })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'シナリオを足す' }));
    expect(screen.getAllByRole('button', { name: 'このシナリオを消す' }).length).toBe(3);

    fireEvent.click(screen.getByRole('button', { name: 'RFPに進む' }));
    expect(screen.getByRole('heading', { name: '経費精算システムの要件整理' })).toBeInTheDocument();
    expect(screen.getByText(/月末に紙の領収書をまとめて申請している。/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'RFPをダウンロード' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'スコープ管理に送る' })).toBeInTheDocument();
  });

  test('現状だけ再整理するとストーリーは残る', async () => {
    localStorage.setItem(
      'beekle-story-builder-v2',
      JSON.stringify({ description: '既存メモ', spec })
    );
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        success: true,
        spec: {
          ...spec,
          asIs: { ...spec.asIs, summary: '再整理した現状' },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<StoryBuilder />);
    await waitFor(() => {
      expect(screen.getByText('いまどうやっているか')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: '現状と目指す姿だけ再整理する' }));
    await waitFor(() => {
      expect(screen.getByDisplayValue('再整理した現状')).toBeInTheDocument();
    });
    const body = JSON.parse((fetchMock.mock.calls[0][1] as { body: string }).body) as {
      mode: string;
    };
    expect(body.mode).toBe('asis');
    fireEvent.click(screen.getByRole('button', { name: 'ストーリーを直す' }));
    expect(screen.getByText('営業担当が、出張先で領収書を撮影して申請したい')).toBeInTheDocument();
  });

  test('会話の指示で整理を直す', async () => {
    localStorage.setItem(
      'beekle-story-builder-v2',
      JSON.stringify({ description: '既存メモ', spec })
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          success: true,
          spec: {
            ...spec,
            stories: [{ ...spec.stories[0], priority: '任意' }],
          },
          note: '上長の承認を任意にした。',
        }),
      })
    );

    render(<StoryBuilder />);
    await waitFor(() => {
      expect(screen.getByText('会話で直す')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText('例：上長の承認は必須じゃない。後回しでいい。'), {
      target: { value: '上長の承認は後回しでいい' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'この指示で直す' }));
    await waitFor(() => {
      expect(screen.getByText('上長の承認を任意にした。')).toBeInTheDocument();
    });
    expect(screen.getByText('上長の承認は後回しでいい')).toBeInTheDocument();
  });

  test('空の入力では生成できない', () => {
    render(<StoryBuilder />);
    fireEvent.click(screen.getByRole('button', { name: '現状・ストーリー・RFPに整理する' }));
    expect(
      screen.getByText('やりたいこと、またはいま困っていることを書いてください')
    ).toBeInTheDocument();
  });

  test('保存済みの仕様があれば現状タブから開く', async () => {
    localStorage.setItem(
      'beekle-story-builder-v2',
      JSON.stringify({ description: '既存メモ', spec })
    );
    render(<StoryBuilder />);
    await waitFor(() => {
      expect(screen.getByText('いまどうやっているか')).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('heading', { name: 'いまの業務と、こうしたいを書く' })
    ).not.toBeInTheDocument();
  });
});
