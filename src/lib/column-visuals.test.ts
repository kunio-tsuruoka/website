import { describe, expect, it } from 'vitest';
import { renderColumnVisuals } from './column-visuals';

describe('renderColumnVisuals chatgpt evaluation CTA', () => {
  it('expands a ChatGPT evaluation marker with prompt and tracking metadata', () => {
    const result = renderColumnVisuals('<p>{{CHATGPT_EVALUATION_CTA:technical_skill}}</p>', {
      source: 'column-ai-vendor-technical-skill',
    });

    expect(result).not.toContain('{{CHATGPT_EVALUATION_CTA:technical_skill}}');
    expect(result).toContain('data-chatgpt-evaluation-cta');
    expect(result).toContain('data-cta-source="column-ai-vendor-technical-skill"');
    expect(result).toContain('data-evaluation-type="technical_skill"');
    expect(result).toContain('data-cta-location="article-body"');
    expect(result).toContain('ChatGPTでこの会社を判定する');
    expect(result).toContain('AIが生成したものを判断できる会社か');
    expect(result).toContain('data-chatgpt-evaluation-prompt');
  });

  it('supports all planned evaluation types', () => {
    const types = [
      'technical_skill',
      'requirements',
      'change_management',
      'testing',
      'bus_factor',
      'prototype_to_production',
      'delay_recovery',
    ];

    for (const type of types) {
      const result = renderColumnVisuals(`<p>{{CHATGPT_EVALUATION_CTA:${type}}}</p>`, {
        source: 'column-ai-vendor-checklist',
      });

      expect(result).not.toContain(`{{CHATGPT_EVALUATION_CTA:${type}}}`);
      expect(result).toContain(`data-evaluation-type="${type}"`);
      expect(result).toContain('data-chatgpt-evaluation-button');
    }
  });
});

describe('renderColumnVisuals PM on Rails bridge', () => {
  it('expands {{PM_ON_RAILS_BRIDGE}} into an external waitlist card with UTM and tracking metadata', () => {
    const result = renderColumnVisuals('<p>{{PM_ON_RAILS_BRIDGE}}</p>', {
      source: 'column-gherkin-bdd-introduction',
    });

    expect(result).not.toContain('{{PM_ON_RAILS_BRIDGE}}');
    expect(result).toContain('class="cv-card cv-card-cta"');
    expect(result).toContain(
      'href="https://pmonrails.com/waitlist?utm_source=beekle.jp&amp;utm_medium=column&amp;utm_campaign=technical_cluster&amp;utm_content=gherkin-bdd-introduction"'
    );
    expect(result).toContain('target="_blank" rel="noopener noreferrer"');
    expect(result).toContain('data-cta-source="column-gherkin-bdd-introduction"');
    expect(result).toContain('data-cta-id="bridge-pm-on-rails"');
    expect(result).toContain('ウェイティングリストに登録する');
  });

  it('replaces a bare marker too and leaves other markup untouched', () => {
    const result = renderColumnVisuals('<h2>x</h2>{{PM_ON_RAILS_BRIDGE}}<p>y</p>', {
      source: 'column-spec-driven-development',
    });
    expect(result).not.toContain('{{PM_ON_RAILS_BRIDGE}}');
    expect(result).toContain('<h2>x</h2>');
    expect(result).toContain('<p>y</p>');
    expect(result).toContain('utm_content=spec-driven-development');
  });

  it('keeps internal CTA cards without target/rel', () => {
    const result = renderColumnVisuals('<p>{{CONTACT_CTA}}</p>', { source: 'column-x' });
    expect(result).not.toContain('target="_blank"');
  });
});
