import { useEffect } from 'react';
import { ACCEPTED_MIMES_ATTR, MAX_BYTES } from '../constants';
import { useOcrStore } from '../store';

type Props = {
  /** Turnstile widget をマウントする ref（親 feature から渡す）。 */
  turnstileContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  /** Turnstile token 取得済みかどうか。送信ボタン活性化に使う。 */
  hasTurnstileToken: boolean;
  /** 親 feature の `submit` を委譲。 */
  onSubmit: () => void;
};

export function UploadPanel({ turnstileContainerRef, hasTurnstileToken, onSubmit }: Props) {
  const file = useOcrStore((s) => s.file);
  const previewUrl = useOcrStore((s) => s.previewUrl);
  const loading = useOcrStore((s) => s.loading);
  const error = useOcrStore((s) => s.error);
  const setFile = useOcrStore((s) => s.setFile);
  const setPreviewUrl = useOcrStore((s) => s.setPreviewUrl);
  const setError = useOcrStore((s) => s.setError);
  const clearError = useOcrStore((s) => s.clearError);
  const clearResult = useOcrStore((s) => s.clearResult);

  // file が変わったらプレビュー URL を作り直す（既存挙動互換）。
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, setPreviewUrl]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    clearError();
    clearResult();
    if (f && f.size > MAX_BYTES) {
      setError('ファイルサイズは5MB以下にしてください。');
      setFile(null);
      return;
    }
    setFile(f);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6 space-y-4">
      <h3 className="font-bold text-lg">領収書をアップロード</h3>
      <input
        type="file"
        accept={ACCEPTED_MIMES_ATTR}
        onChange={onFileChange}
        disabled={loading}
        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
      />
      {previewUrl && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <img
            src={previewUrl}
            alt="領収書プレビュー"
            className="w-full h-auto max-h-80 object-contain"
          />
        </div>
      )}
      <div ref={turnstileContainerRef} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={onSubmit}
        disabled={!file || loading || !hasTurnstileToken}
        className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition"
      >
        {loading ? '解析中...' : '領収書を解析する'}
      </button>
      <p className="text-xs text-gray-500">
        ※ JPEG/PNG/WebP/GIF、最大5MB。アップロードされた画像はサーバ保存されません。
      </p>
    </div>
  );
}
