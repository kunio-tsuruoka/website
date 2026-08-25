import { readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');

const scanRoots = ['src/components', 'src/content', 'src/data', 'src/lib', 'src/pages'].map((dir) =>
  resolve(root, dir)
);

const bannedPriceAnchors = [
  '初期費用0円',
  '無料PoC',
  '無料プロトタイプ',
  '無料なのは',
  'まずは無料で作る',
  'まず無料で試作品',
  'リスクゼロ',
] as const;
const sourceExtensions = new Set(['.astro', '.md', '.mdx', '.ts', '.tsx']);
const ignoredPathParts = [
  '/src/data/column-embeddings.json',
  '/src/pages/demos/',
  '/src/pages/tools/',
];

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const file = resolve(dir, entry);
    if (ignoredPathParts.some((ignored) => file.includes(ignored))) return [];
    const stat = statSync(file);
    if (stat.isDirectory()) return listSourceFiles(file);
    if (file.includes('.test.')) return [];
    if (![...sourceExtensions].some((ext) => file.endsWith(ext))) return [];
    return [file];
  });
}

const checkedFiles = scanRoots.flatMap(listSourceFiles);

describe('free offer positioning', () => {
  it('does not use zero-yen or free prototype as the development offer anchor', () => {
    const violations = checkedFiles.flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      return bannedPriceAnchors.flatMap((copy) =>
        source.includes(copy) ? [`${relative(root, file)}: ${copy}`] : []
      );
    });

    expect(violations).toEqual([]);
  });
});
