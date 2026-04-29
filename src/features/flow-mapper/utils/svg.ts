import {
  HEADER_H,
  LANE_LABEL_W,
  STEP_TYPE_FILL,
  STEP_TYPE_LABEL,
  STEP_TYPE_STROKE,
} from '../constants';
import type { FlowDiagram, LayoutBox } from '../types';
import { fmtMin } from './format';
import { buildArrowPath, computeLayout } from './layout';

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function diagramToSvg(d: FlowDiagram, label: string): string {
  const layout = computeLayout(d);
  const W = layout.width;
  const H = layout.height + 36;
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Hiragino Sans, Noto Sans JP, sans-serif">`
  );
  parts.push('<defs>');
  parts.push(
    '<marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker>'
  );
  parts.push('</defs>');
  parts.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
  parts.push(
    `<text x="12" y="22" font-size="14" font-weight="bold" fill="#001738">${escapeXml(label)}：${escapeXml(d.title)}</text>`
  );

  // タイトル分だけ下にオフセット
  const offsetY = 32;

  parts.push(
    `<rect x="0" y="${offsetY}" width="${LANE_LABEL_W}" height="${HEADER_H}" fill="#f9fafb" stroke="#d1d5db"/>`
  );
  for (const phase of d.phases) {
    const px = layout.phaseX.get(phase.id);
    if (!px) continue;
    parts.push(
      `<rect x="${px.x}" y="${offsetY}" width="${px.w}" height="${HEADER_H}" fill="#eef0fb" stroke="#c7caee"/>`
    );
    parts.push(
      `<text x="${px.x + 8}" y="${offsetY + HEADER_H / 2 + 5}" font-size="13" font-weight="bold" fill="#001738">${escapeXml(phase.name)}</text>`
    );
  }

  for (let idx = 0; idx < d.lanes.length; idx++) {
    const lane = d.lanes[idx];
    const ly = layout.laneY.get(lane.id);
    if (!ly) continue;
    const bandFill = idx % 2 === 0 ? '#fafafa' : '#ffffff';
    parts.push(
      `<rect x="${LANE_LABEL_W}" y="${ly.y + offsetY}" width="${W - LANE_LABEL_W}" height="${ly.h}" fill="${bandFill}" stroke="#e5e7eb"/>`
    );
    parts.push(
      `<rect x="0" y="${ly.y + offsetY}" width="${LANE_LABEL_W}" height="${ly.h}" fill="${bandFill}" stroke="#d1d5db"/>`
    );
    parts.push(
      `<text x="8" y="${ly.y + offsetY + ly.h / 2 + 5}" font-size="13" font-weight="bold" fill="#001738">${escapeXml(lane.name)}</text>`
    );
  }

  for (const s of d.steps) {
    const from = layout.step.get(s.id);
    if (!from) continue;
    for (const nid of s.next) {
      const to = layout.step.get(nid);
      if (!to) continue;
      const fromShifted: LayoutBox = { ...from, y: from.y + offsetY };
      const toShifted: LayoutBox = { ...to, y: to.y + offsetY };
      const path = buildArrowPath(fromShifted, toShifted);
      parts.push(
        `<path d="${path}" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>`
      );
    }
  }

  for (const s of d.steps) {
    const box = layout.step.get(s.id);
    if (!box) continue;
    const fill = STEP_TYPE_FILL[s.type];
    const stroke = STEP_TYPE_STROKE[s.type];
    parts.push(
      `<rect x="${box.x}" y="${box.y + offsetY}" width="${box.w}" height="${box.h}" rx="6" ry="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`
    );
    parts.push(
      `<text x="${box.x + 8}" y="${box.y + offsetY + 16}" font-size="9" font-weight="bold" fill="#374151">[${escapeXml(STEP_TYPE_LABEL[s.type])}]${s.durationMin > 0 ? ` ${fmtMin(s.durationMin)}` : ''}</text>`
    );
    const maxChars = 18;
    const label1 = s.label.slice(0, maxChars);
    const label2 = s.label.length > maxChars ? s.label.slice(maxChars, maxChars * 2) : '';
    parts.push(
      `<text x="${box.x + 8}" y="${box.y + offsetY + 34}" font-size="11" font-weight="bold" fill="#111827">${escapeXml(label1)}</text>`
    );
    if (label2) {
      parts.push(
        `<text x="${box.x + 8}" y="${box.y + offsetY + 48}" font-size="11" font-weight="bold" fill="#111827">${escapeXml(label2)}</text>`
      );
    }
    if (s.tool) {
      parts.push(
        `<text x="${box.x + 8}" y="${box.y + offsetY + 62}" font-size="9" fill="#6b7280">${escapeXml(s.tool.slice(0, 20))}</text>`
      );
    }
  }

  parts.push('</svg>');
  return parts.join('');
}

export async function svgToPng(svg: string, scale = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('canvas context not available'));
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('canvas.toBlob failed'));
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image load failed'));
    };
    img.src = url;
  });
}
