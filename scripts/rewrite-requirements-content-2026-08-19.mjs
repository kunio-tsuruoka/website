import { createClient } from 'microcms-js-sdk';
import {
  REQUIREMENTS_CONTENT_UPGRADE_SLUGS,
  upgradeRequirementsContent,
} from '../src/lib/requirements-content-upgrades.js';

/**
 * Optional MicroCMS sync for the six requirements-related articles.
 *
 * The website already applies the same upgrade at render time. This script exists so the
 * transformed body can later be persisted back to MicroCMS from a trusted local environment.
 * It intentionally updates only `content`; slug/contentId, title, description and category are
 * never sent in the PATCH payload.
 *
 * Dry-run:
 *   node --env-file=.env scripts/rewrite-requirements-content-2026-08-19.mjs
 * Apply:
 *   node --env-file=.env scripts/rewrite-requirements-content-2026-08-19.mjs --apply
 */

const APPLY = process.argv.includes('--apply');
const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
  throw new Error('MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY are required');
}

const client = createClient({ serviceDomain, apiKey });
const plans = [];

for (const slug of REQUIREMENTS_CONTENT_UPGRADE_SLUGS) {
  const current = await client.get({ endpoint: 'columns', contentId: slug });
  const upgraded = upgradeRequirementsContent(slug, current.content || '');

  if (upgraded === current.content) {
    console.log(`${slug}: no content change`);
    continue;
  }

  plans.push({
    slug,
    upgraded,
    title: current.title,
    description: current.description || '',
    categoryId: current.category?.id || '',
  });

  console.log(
    `${slug}: content ${current.content.length} -> ${upgraded.length} bytes; ` +
      `title/description/category unchanged`
  );
}

if (!APPLY) {
  console.log(`dry-run complete: ${plans.length} article(s) would be updated`);
  process.exit(0);
}

for (const plan of plans) {
  await client.update({
    endpoint: 'columns',
    contentId: plan.slug,
    content: { content: plan.upgraded },
  });

  const verified = await client.get({ endpoint: 'columns', contentId: plan.slug });
  if (verified.title !== plan.title) throw new Error(`${plan.slug}: title changed unexpectedly`);
  if ((verified.description || '') !== plan.description) {
    throw new Error(`${plan.slug}: description changed unexpectedly`);
  }
  if ((verified.category?.id || '') !== plan.categoryId) {
    throw new Error(`${plan.slug}: category changed unexpectedly`);
  }

  console.log(`${plan.slug}: PATCH verified`);
}

console.log(`apply complete: ${plans.length} article(s) updated`);
