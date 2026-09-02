import { describe, expect, it } from 'vitest';
import {
  contactTypeLabel,
  isPartnershipInquiry,
  isRecruitmentInquiry,
  requiresCompanyName,
} from './contact-inquiry';

describe('isRecruitmentInquiry', () => {
  it('採用種別だけ true', () => {
    expect(isRecruitmentInquiry('recruitment_casual')).toBe(true);
    expect(isRecruitmentInquiry('recruitment_newgrad')).toBe(true);
    expect(isRecruitmentInquiry('consultation')).toBe(false);
  });
});

describe('requiresCompanyName', () => {
  it('業務相談は必須、採用は任意', () => {
    expect(requiresCompanyName('consultation')).toBe(true);
    expect(requiresCompanyName('')).toBe(true);
    expect(requiresCompanyName('recruitment_casual')).toBe(false);
  });
});

describe('contactTypeLabel', () => {
  it('採用種別の日本語ラベルを返す', () => {
    expect(contactTypeLabel('recruitment_midcareer')).toBe('採用: 中途応募');
  });
});

describe('isPartnershipInquiry', () => {
  it('協業・提携種別だけ true', () => {
    expect(isPartnershipInquiry('partner')).toBe(true);
    expect(isPartnershipInquiry('consultation')).toBe(false);
    expect(isPartnershipInquiry('estimate')).toBe(false);
    expect(isPartnershipInquiry('')).toBe(false);
  });

  it('開発の依頼・外注は発注側なので false', () => {
    expect(isPartnershipInquiry('partner_request')).toBe(false);
  });
});

describe('contactTypeLabel（協業と依頼の分離）', () => {
  it('依頼と協業で別ラベルを返す', () => {
    expect(contactTypeLabel('partner_request')).toBe(
      '開発の依頼・外注のご相談（開発会社・SIer様）'
    );
    expect(contactTypeLabel('partner')).toBe('協業・提携のご相談');
  });
});
