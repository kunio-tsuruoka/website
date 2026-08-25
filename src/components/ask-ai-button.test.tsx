import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AskAiButton } from './ask-ai-button';

describe('AskAiButton', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  it('押すとAI選択のダイアログが開く', async () => {
    render(
      <AskAiButton
        source="test"
        pageTitle="生成AI受託開発"
        pageSummary="要件定義からAI開発まで"
        serviceName="生成AI受託開発"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'AIに相談する' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ChatGPTで聞く' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Claudeで聞く' })).toBeInTheDocument();
  });

  it('ChatGPTを選ぶとプロンプト付きURLを新しいタブで開く', async () => {
    render(<AskAiButton source="test" pageTitle="生成AI受託開発" />);
    fireEvent.click(screen.getByRole('button', { name: 'AIに相談する' }));
    fireEvent.click(await screen.findByRole('button', { name: 'ChatGPTで聞く' }));

    await waitFor(() => {
      expect(window.open).toHaveBeenCalled();
    });
    const opened = vi.mocked(window.open).mock.calls[0]?.[0];
    expect(String(opened)).toContain('https://chatgpt.com/?q=');
    expect(decodeURIComponent(String(opened))).toContain('生成AI受託開発');
    expect(decodeURIComponent(String(opened))).toContain('中立に評価');
  });

  it('Geminiはクリップボード完了を待たずに先に新しいタブを開く', async () => {
    let resolveClipboard: (() => void) | undefined;
    const order: string[] = [];
    vi.mocked(window.open).mockImplementation(() => {
      order.push('open');
      return null;
    });
    vi.mocked(navigator.clipboard.writeText).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveClipboard = () => {
            order.push('clipboard');
            resolve();
          };
        })
    );

    render(<AskAiButton source="test" pageTitle="生成AI受託開発" />);
    fireEvent.click(screen.getByRole('button', { name: 'AIに相談する' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Geminiで聞く' }));

    expect(window.open).toHaveBeenCalledWith(
      'https://gemini.google.com/app',
      '_blank',
      'noopener,noreferrer'
    );
    expect(order).toEqual(['open']);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    resolveClipboard?.();
    await waitFor(() => {
      expect(order).toEqual(['open', 'clipboard']);
    });
    expect(
      await screen.findByText('プロンプトをコピーしました。開いた画面に貼り付けてください。')
    ).toBeInTheDocument();
  });

  it('プロンプトをクリップボードへコピーできる', async () => {
    render(<AskAiButton source="test" pageTitle="Beekle" />);
    fireEvent.click(screen.getByRole('button', { name: 'AIに相談する' }));
    fireEvent.click(await screen.findByRole('button', { name: 'プロンプトだけコピーする' }));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
    const copied = vi.mocked(navigator.clipboard.writeText).mock.calls[0]?.[0];
    expect(copied).toContain('Beekle株式会社');
    expect(copied).toContain('合う理由と、合わない理由');
  });
});
