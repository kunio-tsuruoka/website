import { createClient } from 'microcms-js-sdk';
import { mkdir, writeFile } from 'node:fs/promises';

const TARGET_ID = 'dto3f38226f';
const MARKERS = ['AI_DEV_SERVICE_BRIDGE', 'CONTACT_CTA'];
const STATUS_PATH = 'public/cta-repair-status.json';

const status = {
  target: TARGET_ID,
  status: 'starting',
  workingExamples: {},
  before: {},
  updatedFields: [],
  after: {},
};

const saveStatus = async () => {
  await mkdir('public', { recursive: true });
  await writeFile(STATUS_PATH, `${JSON.stringify(status, null, 2)}\n`);
};

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
  status.status = 'failed';
  status.error = 'microCMS environment variables are unavailable';
  await saveStatus();
  process.exit(0);
}

const client = createClient({ serviceDomain, apiKey });
const markerToken = (marker) => `{{${marker}}}`;
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wrappedRegex = (marker, flags = '') =>
  new RegExp(`<p>\\s*${escapeRegExp(markerToken(marker))}\\s*</p>`, flags);
const standaloneLineRegex = (marker, flags = '') =>
  new RegExp(
    `(^|\\r?\\n)[ \\t]*${escapeRegExp(markerToken(marker))}[ \\t]*(?=\\r?\\n|$)`,
    flags
  );

const snippet = (value, marker) => {
  const token = markerToken(marker);
  const index = value.indexOf(token);
  if (index < 0) return null;
  return value
    .slice(Math.max(0, index - 120), Math.min(value.length, index + token.length + 120))
    .replace(/\n/g, '\\n');
};

const findStrings = (value, marker, path = '$', out = []) => {
  if (typeof value === 'string') {
    if (value.includes(markerToken(marker))) out.push({ path, value });
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => findStrings(item, marker, `${path}[${index}]`, out));
    return out;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      findStrings(child, marker, `${path}.${key}`, out);
    }
  }
  return out;
};

const analyzeString = (value, marker) => {
  const token = markerToken(marker);
  const total = value.split(token).length - 1;
  const wrappedCount = [...value.matchAll(wrappedRegex(marker, 'g'))].length;
  const withoutWrapped = value.replace(wrappedRegex(marker, 'g'), '');
  const remaining = withoutWrapped.split(token).length - 1;
  const standaloneCount = [...withoutWrapped.matchAll(standaloneLineRegex(marker, 'g'))].length;
  return {
    total,
    wrappedCount,
    remaining,
    standaloneCount,
    safeToNormalize: remaining === standaloneCount,
  };
};

const normalizeString = (value, marker) => {
  if (!value.includes(markerToken(marker))) return value;
  const analysis = analyzeString(value, marker);
  if (!analysis.safeToNormalize) {
    throw new Error(`Unexpected non-standalone ${marker} occurrence`);
  }

  const sentinel = `__CTA_${marker}_ALREADY_WRAPPED__`;
  let next = value.replace(wrappedRegex(marker, 'g'), sentinel);
  next = next.replace(standaloneLineRegex(marker, 'g'), (_match, prefix) => {
    return `${prefix}<p>${markerToken(marker)}</p>`;
  });
  return next.replaceAll(sentinel, `<p>${markerToken(marker)}</p>`);
};

const normalizeDeep = (value, marker) => {
  if (typeof value === 'string') return normalizeString(value, marker);
  if (Array.isArray(value)) return value.map((item) => normalizeDeep(item, marker));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, normalizeDeep(child, marker)])
    );
  }
  return value;
};

try {
  let offset = 0;
  while (Object.keys(status.workingExamples).length < MARKERS.length) {
    const page = await client.get({
      endpoint: 'columns',
      queries: { limit: 100, offset, fields: 'id,content' },
    });

    for (const article of page.contents) {
      for (const marker of MARKERS) {
        if (status.workingExamples[marker]) continue;
        if (typeof article.content !== 'string') continue;
        if (!article.content.includes(markerToken(marker))) continue;

        status.workingExamples[marker] = {
          id: article.id,
          isParagraphWrapped: wrappedRegex(marker).test(article.content),
          snippet: snippet(article.content, marker),
        };
      }
    }

    offset += page.contents.length;
    if (offset >= page.totalCount || page.contents.length === 0) break;
  }

  for (const marker of MARKERS) {
    const working = status.workingExamples[marker];
    if (!working) throw new Error(`No working column example found for ${marker}`);
    if (!working.isParagraphWrapped) {
      throw new Error(`Working column marker ${marker} is not paragraph-wrapped`);
    }
  }

  const before = await client.get({ endpoint: 'blogs', contentId: TARGET_ID });

  for (const marker of MARKERS) {
    const hits = findStrings(before, marker);
    if (hits.length === 0) throw new Error(`Target blog does not contain ${marker}`);

    status.before[marker] = hits.map(({ path, value }) => ({
      path,
      analysis: analyzeString(value, marker),
      snippet: snippet(value, marker),
    }));

    if (status.before[marker].some((hit) => !hit.analysis.safeToNormalize)) {
      throw new Error(`Target blog contains an unsafe ${marker} placement`);
    }
  }

  let next = before;
  for (const marker of MARKERS) next = normalizeDeep(next, marker);

  const systemFields = new Set(['id', 'createdAt', 'updatedAt', 'publishedAt', 'revisedAt']);
  const patch = {};
  for (const [key, value] of Object.entries(next)) {
    if (systemFields.has(key)) continue;
    if (JSON.stringify(value) !== JSON.stringify(before[key])) patch[key] = value;
  }

  status.updatedFields = Object.keys(patch);

  if (status.updatedFields.length > 0) {
    await client.update({ endpoint: 'blogs', contentId: TARGET_ID, content: patch });
  }

  const after = await client.get({ endpoint: 'blogs', contentId: TARGET_ID });
  for (const marker of MARKERS) {
    const hits = findStrings(after, marker);
    status.after[marker] = hits.map(({ path, value }) => ({
      path,
      isParagraphWrapped: wrappedRegex(marker).test(value),
      snippet: snippet(value, marker),
    }));

    if (hits.length === 0 || status.after[marker].some((hit) => !hit.isParagraphWrapped)) {
      throw new Error(`Post-update verification failed for ${marker}`);
    }
  }

  status.status = status.updatedFields.length > 0 ? 'repaired-and-verified' : 'already-normalized-and-verified';
} catch (error) {
  status.status = 'failed';
  status.error = error instanceof Error ? error.message : String(error);
}

await saveStatus();
console.log(JSON.stringify(status, null, 2));
