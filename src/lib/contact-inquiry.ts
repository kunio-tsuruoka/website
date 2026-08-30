export const BUSINESS_TYPE_LABELS: Record<string, string> = {
  consultation: 'まずは相談したい',
  web: 'Webアプリ開発について',
  mobile: 'モバイルアプリ開発について',
  prototype: '15分で開発方針を整理したい',
  estimate: '見積もり妥当性・概算費用を聞きたい',
  requirements: '作りたいもの・依頼内容を整理したい',
  ai: '社内資料や業務データをAIで使いたい',
  cdp: '顧客データを整理・活用したい',
  dx: '業務改善・AI導入について',
  tech_review: '社内データ・既存システムの不安を相談したい',
  mvp_poc: 'MVP・PoC・新規事業検証について',
  // legacy: サービス終了済みだが、キャッシュされた旧フォームからの送信をラベル不明にしないため残す
  global: '海外向けサービス開発について',
  partner: '開発パートナー・協業のご相談（開発会社・SIer様）',
  other: 'その他',
};

export const RECRUITMENT_TYPE_LABELS: Record<string, string> = {
  recruitment_casual: '採用: カジュアル面談',
  recruitment_newgrad: '採用: 新卒応募',
  recruitment_midcareer: '採用: 中途応募',
};

export const TYPE_LABELS: Record<string, string> = {
  ...BUSINESS_TYPE_LABELS,
  ...RECRUITMENT_TYPE_LABELS,
};

export function isRecruitmentInquiry(type: string): boolean {
  return type.startsWith('recruitment');
}

/** 業務相談は会社名必須。採用は個人でも送れる。 */
export function requiresCompanyName(type: string): boolean {
  if (isRecruitmentInquiry(type)) return false;
  return true;
}

export function contactTypeLabel(type: string): string {
  return TYPE_LABELS[type] || type || '未選択';
}

/**
 * 協業・パートナーのご相談は「Beekle に発注する顧客」ではないため、顧客リード（CRM）には載せない。
 * Slack 通知は従来どおり全件出すので、取りこぼしにはならない。
 */
export function isPartnershipInquiry(type: string): boolean {
  return type === 'partner';
}
