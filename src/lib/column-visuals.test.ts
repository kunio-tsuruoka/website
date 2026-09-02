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

describe('renderColumnVisuals technical cluster CTA', () => {
  it('routes BRIDGE_CTA traffic to PM on Rails instead of Zero Start', () => {
    const result = renderColumnVisuals('<p>{{BRIDGE_CTA}}</p>', {
      source: 'column-gherkin-bdd-introduction',
    });

    expect(result).not.toContain('{{BRIDGE_CTA}}');
    expect(result).toContain('https://pmonrails.com');
    expect(result).toContain('PM on Rails');
    expect(result).toContain('data-cta-source="column-gherkin-bdd-introduction"');
    expect(result).toContain('data-cta-id="pm-on-rails-technical-cluster"');
    expect(result).not.toContain('/prooffirst');
    expect(result).not.toContain('ゼロスタート開発');
  });
});
