import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildContactCompleteEventParams,
  claimContactCompleteSubmission,
} from './contact-complete';

describe('contact_complete 完了イベント', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('submission_idがないthanks表示は完了イベントにしない', () => {
    expect(buildContactCompleteEventParams('?source=direct-thanks')).toBeNull();
  });

  it('元のsourceとsubmission_idを完了イベントに載せる', () => {
    expect(
      buildContactCompleteEventParams(
        '?source=knowledge-gherkin&intent=requirements-template-mid&phase=mid&submission_id=contact-test-submission-123'
      )
    ).toEqual({
      method: 'form',
      from: 'contact',
      source: 'knowledge-gherkin',
      intent: 'requirements-template-mid',
      phase: 'mid',
      submission_id: 'contact-test-submission-123',
      transport_type: 'beacon',
    });
  });

  it('同じsubmission_idの完了イベントは1回だけ許可する', () => {
    expect(
      claimContactCompleteSubmission(window.sessionStorage, 'contact-test-submission-123')
    ).toBe(true);
    expect(
      claimContactCompleteSubmission(window.sessionStorage, 'contact-test-submission-123')
    ).toBe(false);
  });
});
