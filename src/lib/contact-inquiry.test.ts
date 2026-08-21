import { describe, expect, it } from 'vitest';
import { contactTypeLabel, isRecruitmentInquiry, requiresCompanyName } from './contact-inquiry';

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
