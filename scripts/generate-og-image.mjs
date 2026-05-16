#!/usr/bin/env node
// public/og-image.png を生成する（1200x630, Beekle ブランド）
// 実行: node scripts/generate-og-image.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'public/og-image.png');

const WIDTH = 1200;
const HEIGHT = 630;
const PURPLE = '#3D4DB7';
const NAVY = '#001738';
const YELLOW = '#ffd600';

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${PURPLE}"/>
      <stop offset="100%" stop-color="${NAVY}"/>
    </linearGradient>
    <radialGradient id="glow" cx="85%" cy="20%" r="50%">
      <stop offset="0%" stop-color="#7B8BFF" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#7B8BFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  <g font-family="'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic','Noto Sans CJK JP','Noto Sans JP',sans-serif" fill="white">
    <text x="80" y="270" font-size="64" font-weight="700">動くプロトタイプから始める</text>
    <text x="80" y="358" font-size="64" font-weight="700">システム開発。</text>
    <rect x="80" y="408" width="520" height="64" rx="32" fill="${YELLOW}"/>
    <text x="340" y="452" font-size="32" font-weight="700" fill="${NAVY}" text-anchor="middle">初期費用0円のゼロスタート</text>
    <text x="80" y="560" font-size="26" font-weight="500" fill-opacity="0.85">Beekle 株式会社  |  beekle.jp</text>
  </g>
</svg>
`;

async function main() {
  const logoPath = resolve(ROOT, 'public/logo.png');
  const logoBuf = await readFile(logoPath);
  const logoResized = await sharp(logoBuf)
    .resize({ width: 280, withoutEnlargement: false })
    .toBuffer();

  const png = await sharp(Buffer.from(svg))
    .composite([{ input: logoResized, top: 80, left: 80 }])
    .png({ quality: 90, compressionLevel: 9 })
    .toBuffer();

  await writeFile(OUT, png);
  const stats = await sharp(png).metadata();
  console.log(`OK: ${OUT} (${stats.width}x${stats.height}, ${png.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
