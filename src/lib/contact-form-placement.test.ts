import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('contact form placement', () => {
  it('home embedded contact form includes the Turnstile sitekey and script', () => {
    const source = readSource('src/pages/index.astro');

    expect(source).toContain('TURNSTILE_SITE_KEY');
    expect(source).toContain('<ContactForm client:visible');
    expect(source).toContain('sitekey={sitekey}');
    expect(source).toContain('https://challenges.cloudflare.com/turnstile/v0/api.js');
  });
});
