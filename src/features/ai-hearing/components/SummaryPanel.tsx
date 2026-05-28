import { useState } from 'react';
import { useHearingStore } from '../store';

const PHASE_LABEL: Record<string, string> = {
  discovery: '課題はあるが何を作るか未定',
  rfp_prep: 'RFP準備中',
  comparing: 'ベンダー比較中',
  budgeting: '予算化中',
  decided: '発注先内定',
};
const BUDGET_LABEL: Record<string, string> = {
  unknown: '未定',
  under_100: '100万円未満',
  '100_500': '100〜500万円',
  '500_2000': '500〜2000万円',
  over_2000: '2000万円以上',
};
const TIMELINE_LABEL: Record<string, string> = {
  unknown: '未定',
  '1_3m': '1〜3ヶ月',
  '3_6m': '3〜6ヶ月',
  '6_12m': '6〜12ヶ月',
  over_12m: '1年以上',
};

type Props = {
  onSubmit: (args: {
    contactEmail: string;
    contactName?: string;
    contactCompany?: string;
  }) => void;
  onBack: () => void;
};

export function SummaryPanel({ onSubmit, onBack }: Props) {
  const profile = useHearingStore((s) => s.profile);
  const loading = useHearingStore((s) => s.loading);
  const error = useHearingStore((s) => s.error);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [agreed, setAgreed] = useState(false);

  if (!profile) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!email.trim()) return;
    if (!agreed) return;
    onSubmit({
      contactName: name.trim() || undefined,
      contactEmail: email.trim(),
      contactCompany: company.trim() || undefined,
    });
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="py-2 border-b border-gray-100 last:border-b-0">
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="text-sm text-gray-900 whitespace-pre-wrap">{value}</div>
    </div>
  );
  const showRow = (label: string, value: string | null | undefined) =>
    value ? <Row label={label} value={value} /> : null;
  const showList = (label: string, list: string[]) =>
    list.length > 0 ? <Row label={label} value={list.map((v) => `・${v}`).join('\n')} /> : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
        <h2 className="text-lg font-bold text-navy-950 mb-1">AIがまとめた内容</h2>
        <p className="text-xs text-gray-500 mb-4">
          このまま Beekle に送ると、初回のお打ち合わせから具体的な提案に進めます。
        </p>

        <div className="space-y-0">
          {showRow('業種', profile.industry)}
          {showRow('規模', profile.companySize)}
          {showRow(
            '検討フェーズ',
            profile.phase ? (PHASE_LABEL[profile.phase] ?? profile.phase) : null
          )}
          {showList('業務課題', profile.painPoints)}
          {showRow('影響規模', profile.impact)}
          {showRow('現状の対応', profile.currentWorkaround)}
          {showList('既存システム', profile.existingSystems)}
          {showList('扱うデータ', profile.dataSources)}
          {showRow(
            '予算感',
            profile.budgetRange ? (BUDGET_LABEL[profile.budgetRange] ?? profile.budgetRange) : null
          )}
          {showRow(
            '期日感',
            profile.timeline ? (TIMELINE_LABEL[profile.timeline] ?? profile.timeline) : null
          )}
          {showList('意思決定者', profile.decisionMakers)}
          {showList('過去の試み', profile.priorAttempts)}
          {showList('成功条件', profile.successCriteria)}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6 space-y-4"
      >
        <h3 className="text-base font-bold text-navy-950">連絡先</h3>
        <p className="text-xs text-gray-500">
          メールアドレスのみ必須です。後日担当者からご連絡します。
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1" htmlFor="hearing-name">
              お名前 (任意)
            </label>
            <input
              id="hearing-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-gray-300 focus:outline-none focus:border-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1" htmlFor="hearing-company">
              会社名 (任意)
            </label>
            <input
              id="hearing-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              maxLength={120}
              className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-gray-300 focus:outline-none focus:border-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1" htmlFor="hearing-email">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              id="hearing-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={160}
              className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-gray-300 focus:outline-none focus:border-primary-500 text-sm"
            />
          </div>
        </div>

        <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary-600"
            >
              プライバシーポリシー
            </a>
            に同意のうえ、内容を Beekle に送信します。
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="sm:flex-shrink-0 px-5 py-3 min-h-[44px] border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-sm font-medium rounded-full transition"
          >
            会話に戻る
          </button>
          <button
            type="submit"
            disabled={loading || !email.trim() || !agreed}
            className="flex-1 px-5 py-3 min-h-[44px] bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white text-sm font-semibold rounded-full transition"
          >
            {loading ? '送信中...' : 'Beekleに相談する'}
          </button>
        </div>
      </form>
    </div>
  );
}
