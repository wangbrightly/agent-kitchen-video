import React from 'react';
import {Box, MonoText, PURPLE_LIGHT, GREY_LINE, WHITE, Svg, abs, glowPurple, glowPurpleS} from '../../ui';
import {FONT_HEAVY, clamp01} from '../../common';

/**
 * G4（SC15–SC18）共用小零件。
 * 本组的关键物件是"单子"：白边黑底卡片 + 顶部 Mono 类型标注（tool_use / tool_result）。
 * 约定与 icons.tsx 一致：线稿为黑填充 + 白描边；紫只给当前重点。
 */

export type Pt = [number, number];

/** 打字机切片：n 帧起，每 fpt 帧长一个字；n<0 一个都不显示 */
export const typeSlice = (s: string, n: number, fpt = 2) => {
  if (n < 0) return '';
  const k = Math.min(s.length, Math.floor(n / fpt) + 1);
  return s.slice(0, k);
};

/** 估算一行中英混排文字的宽度（用于给打字光标定位；中文按全角、拉丁按 0.58em） */
export const textW = (s: string, size: number) =>
  [...s].reduce((a, ch) => a + (ch.charCodeAt(0) > 255 ? size : size * 0.58), 0);

/** 闪烁光标（打字中）。8 帧一呼一吸，属动词动作，不算漂浮 */
export const Caret: React.FC<{x: number; y: number; N: number; h?: number; color?: string; opacity?: number}> = ({
  x,
  y,
  N,
  h = 16,
  color = PURPLE_LIGHT,
  opacity = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 2,
      height: h,
      background: color,
      opacity: opacity * (Math.floor(N / 8) % 2 === 0 ? 0.9 : 0.18),
    }}
  />
);

// ---- 单子 ----
/**
 * 白边"单子"：黑底 + 紫描边 + 顶部 Mono 类型标注。
 * glowK 0→1 时给整张卡加紫柔光（主角光）；rotate 给飞出时的倾角。
 */
export const Slip: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  header: string;
  opacity?: number;
  rotate?: number;
  glowK?: number;
  stroke?: string;
  sw?: number;
  r?: number;
  headerColor?: string;
  children?: React.ReactNode;
}> = ({x, y, w, h, header, opacity = 1, rotate = 0, glowK = 0, stroke = PURPLE_LIGHT, sw = 2, r = 9, headerColor = PURPLE_LIGHT, children}) => {
  const headH = 44;
  return (
    <div style={{...abs(x, y, w, h), opacity, transform: rotate ? `rotate(${rotate.toFixed(2)}deg)` : undefined, transformOrigin: '50% 50%'}}>
      {glowK > 0.01 ? <div style={{...abs(0, 0, w, h), borderRadius: r, boxShadow: glowPurple(glowK)}} /> : null}
      <Box x={0} y={0} w={w} h={h} r={r} fill="#000" stroke={stroke} sw={sw} />
      <MonoText x={16} y={headH / 2 - 13} size={22} color={headerColor}>
        {header}
      </MonoText>
      <div style={{...abs(14, headH, w - 28, 1), background: GREY_LINE, opacity: 0.75}} />
      {children}
    </div>
  );
};

/** 单子内部的三条灰色值条（SC17 的紧凑单子 / 结果单子） */
export const ValueBars: React.FC<{x: number; y: number; w: number; rows?: number; gap?: number; color?: string; opacity?: number}> = ({
  x,
  y,
  w,
  rows = 3,
  gap = 20,
  color = GREY_LINE,
  opacity = 0.9,
}) => (
  <>
    {Array.from({length: rows}, (_, i) => (
      <div
        key={i}
        style={{
          ...abs(x, y + i * gap, i === rows - 1 ? w * 0.62 : w * (0.94 - i * 0.08), 4),
          borderRadius: 2,
          background: color,
          opacity,
        }}
      />
    ))}
  </>
);

// ---- 工具小图标（SC15 右侧的"这些工具"；64px 级别配角）----
const S = (c: string, w = 3, fill = 'none') => ({
  stroke: c,
  strokeWidth: w,
  fill,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

const GlyphFrame: React.FC<{cx: number; cy: number; size: number; opacity?: number; children: React.ReactNode}> = ({cx, cy, size, opacity = 1, children}) => (
  <div style={{...abs(cx - size / 2, cy - size / 2, size, size), opacity}}>
    <svg width="100%" height="100%" viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {children}
    </svg>
  </div>
);

export type ToolKind = 'file' | 'search' | 'code';
/** 文件 / 搜索 / 终端 三枚线稿工具 */
export const ToolGlyph: React.FC<{kind: ToolKind; cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({
  kind,
  cx,
  cy,
  size = 56,
  color = WHITE,
  accent = PURPLE_LIGHT,
  opacity = 1,
}) => (
  <GlyphFrame cx={cx} cy={cy} size={size} opacity={opacity}>
    {kind === 'file' ? (
      <>
        <path d="M24 14H60L76 30V86H24Z" {...S(color, 3.2, '#000')} />
        <path d="M60 14V30H76" {...S(color, 2.4)} />
        <path d="M34 45H66M34 57H66M34 69H56" {...S(accent, 2.2)} />
      </>
    ) : null}
    {kind === 'search' ? (
      <>
        <circle cx="42" cy="42" r="22" {...S(color, 3.2, '#000')} />
        <path d="M58 58L78 78" {...S(color, 4.2)} />
        <path d="M33 42H51M42 33V51" {...S(accent, 2.2)} />
      </>
    ) : null}
    {kind === 'code' ? (
      <>
        <rect x="16" y="22" width="68" height="56" rx="5" {...S(color, 3.2, '#000')} />
        <path d="M30 43L42 53L30 63" {...S(color, 3)} />
        <path d="M50 63H68" {...S(accent, 3)} />
      </>
    ) : null}
  </GlyphFrame>
);

// ---- 折线箭头（SC17 的结果绕回：顶部长折线 draw-on）----
export const polyPoint = (pts: Pt[], t: number): Pt => {
  const n = pts.length;
  const lens: number[] = [];
  let total = 0;
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    lens.push(L);
    total += L;
  }
  let d = (((t % 1) + 1) % 1) * total;
  for (let i = 0; i < n - 1; i++) {
    if (d <= lens[i] || i === n - 2) {
      const a = pts[i];
      const b = pts[i + 1];
      const k = lens[i] > 0 ? d / lens[i] : 0;
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    }
    d -= lens[i];
  }
  return pts[0];
};

/** 折线可见段（从起点裁到 len 长度），返回折点 + 末端方向 */
const cutPath = (pts: Pt[], len: number) => {
  const out: Pt[] = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const L = Math.hypot(bx - ax, by - ay);
    if (acc + L <= len) {
      out.push([bx, by]);
      acc += L;
    } else {
      const k = L > 0 ? (len - acc) / L : 0;
      out.push([ax + (bx - ax) * k, ay + (by - ay) * k]);
      break;
    }
  }
  return out;
};

/** 折线 draw-on 箭头：p 0→1 自起点长出，箭头随末端方向 */
export const PolyArrow: React.FC<{pts: Pt[]; p: number; color?: string; width?: number; head?: number; opacity?: number}> = ({
  pts,
  p,
  color = PURPLE_LIGHT,
  width = 2.5,
  head = 13,
  opacity = 1,
}) => {
  if (p <= 0) return null;
  const lens = pts.slice(1).map((b, i) => Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  const out = cutPath(pts, total * clamp01(p));
  if (out.length < 2) return null;
  const tip = out[out.length - 1];
  const prev = out[Math.max(0, out.length - 2)];
  const ang = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
  const hw = head * 0.46;
  const bx = tip[0] - Math.cos(ang) * head;
  const by = tip[1] - Math.sin(ang) * head;
  const px = -Math.sin(ang);
  const py = Math.cos(ang);
  return (
    <Svg bloom={false} opacity={opacity}>
      <polyline points={out.map((q) => q.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`${tip[0]},${tip[1]} ${bx + px * hw},${by + py * hw} ${bx - px * hw},${by - py * hw}`} fill={color} />
    </Svg>
  );
};

/** 由外向内生长的直线（SC18 两条细线）：自 (x0,y0) 向 (x1,y1) 长出 len 比例 */
export const GrowLine: React.FC<{x0: number; y0: number; x1: number; y1: number; p: number; color?: string; width?: number; opacity?: number}> = ({
  x0,
  y0,
  x1,
  y1,
  p,
  color = GREY_LINE,
  width = 1.5,
  opacity = 1,
}) => {
  if (p <= 0) return null;
  const k = clamp01(p);
  return (
    <Svg bloom={false} opacity={opacity}>
      <line x1={x0} y1={y0} x2={x0 + (x1 - x0) * k} y2={y0 + (y1 - y0) * k} stroke={color} strokeWidth={width} strokeLinecap="round" />
    </Svg>
  );
};

/** 扩散脉冲环（脑接收结果 / 继续判断下一步） */
export const RingPulse: React.FC<{cx: number; cy: number; p: number; r0?: number; r1?: number; color?: string; opacity?: number; sw?: number}> = ({
  cx,
  cy,
  p,
  r0 = 34,
  r1 = 96,
  color = PURPLE_LIGHT,
  opacity = 1,
  sw = 2,
}) => {
  if (p <= 0 || p >= 1) return null;
  const r = r0 + (r1 - r0) * clamp01(p);
  return (
    <Svg bloom={false} opacity={opacity * (1 - clamp01(p))}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw} />
    </Svg>
  );
};

/** 紫光"当前重点"的描边强度（给卡片用） */
export const slipGlow = (k: number) => glowPurpleS(k);

/** 小标签（中文说明，22–26px） */
export const MiniLabel: React.FC<{cx: number; cy: number; text: string; size?: number; color?: string; opacity?: number}> = ({
  cx,
  cy,
  text,
  size = 26,
  color = '#A0A0A1',
  opacity = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left: cx,
      top: cy,
      transform: 'translate(-50%,-50%)',
      fontFamily: FONT_HEAVY,
      fontWeight: 600,
      fontSize: size,
      lineHeight: 1,
      color,
      opacity,
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);
