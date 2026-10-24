import React from 'react';
import {Box, GREY_LIGHT, GREY_LINE, PURPLE_LIGHT, WHITE, abs, glowPurple} from '../../ui';
import {clamp01} from '../../common';

/**
 * G7（SC29–SC33，第 4 章「命令与钩子」）共用小零件。
 * 与 icons.tsx / 各组 parts 同一套约定：100×100 viewBox 的线稿、黑填充 + 2.2–3px 描边、紫只给当前重点。
 * 只放本组要用的东西：小票、打字条、按住铜铃的手、可动的烟感装置（指针会摆）、虚线探针、扫描横线、发光圆点。
 */

const S = (c: string, w = 3, fill = 'none') => ({
  stroke: c,
  strokeWidth: w,
  fill,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

const Frame: React.FC<{cx: number; cy: number; size: number; opacity?: number; children: React.ReactNode}> = ({cx, cy, size, opacity = 1, children}) => (
  <div style={{...abs(cx - size / 2, cy - size / 2, size, size), opacity}}>
    <svg width="100%" height="100%" viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {children}
    </svg>
  </div>
);

// ---- 文字小工具 ----
/** 打字机切片：n 帧起每 fpt 帧长一个字；n<0 一个都不显示 */
export const typeSlice = (s: string, n: number, fpt = 3) => (n < 0 ? '' : s.slice(0, Math.min(s.length, Math.floor(n / fpt) + 1)));

/** 估算一行中英混排文字的宽度（中文按全角、拉丁按 0.58em），用于光标定位 */
export const textW = (s: string, size: number) => [...s].reduce((a, ch) => a + (ch.charCodeAt(0) > 255 ? size : size * 0.58), 0);

/** 打字光标（8 帧一呼一吸，属动词动作，不算漂浮） */
export const Caret: React.FC<{x: number; y: number; N: number; h?: number; color?: string; opacity?: number}> = ({x, y, N, h = 16, color = PURPLE_LIGHT, opacity = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 2, height: h, background: color, opacity: opacity * (Math.floor(N / 8) % 2 === 0 ? 0.9 : 0.18)}} />
);

// ---- 小票 ----
/**
 * 小票：黑底 + 描边 + 右上打孔 + 顶部一条虚线分隔（收据感）。
 * children 用票内坐标（左上角为原点）；glowK 0→1 给整张票加紫柔光（主角光）。
 */
export const TicketCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
  opacity?: number;
  glowK?: number;
  stroke?: string;
  sw?: number;
  headY?: number;
  children?: React.ReactNode;
}> = ({x, y, w, h, rotate = 0, opacity = 1, glowK = 0, stroke = PURPLE_LIGHT, sw = 2, headY, children}) => (
  <div style={{...abs(x, y, w, h), opacity, transform: rotate ? `rotate(${rotate.toFixed(2)}deg)` : undefined, transformOrigin: '50% 50%'}}>
    {glowK > 0.01 ? <div style={{...abs(0, 0, w, h), borderRadius: 8, boxShadow: glowPurple(glowK)}} /> : null}
    <Box x={0} y={0} w={w} h={h} r={8} fill="#000" stroke={stroke} sw={sw} />
    {/* 打孔 */}
    <div style={{...abs(w - 24, 12, 8, 8), borderRadius: 4, border: `1.5px solid ${stroke}`, opacity: 0.7}} />
    {headY !== undefined ? <div style={{...abs(14, headY, w - 28, 0), borderTop: `1px dashed ${GREY_LINE}`}} /> : null}
    {children}
  </div>
);

/** 打字中的值条：p 0→1 自左长出；caret 在生长端加一根闪烁光标 */
export const TypeBar: React.FC<{x: number; y: number; w: number; h?: number; p: number; color?: string; opacity?: number; caret?: boolean; N?: number}> = ({
  x,
  y,
  w,
  h = 5,
  p,
  color = GREY_LIGHT,
  opacity = 0.85,
  caret = false,
  N = 0,
}) => {
  const k = clamp01(p);
  if (k <= 0) return null;
  const ww = Math.max(3, w * k);
  return (
    <>
      <div style={{...abs(x, y, ww, h), borderRadius: h / 2, background: color, opacity}} />
      {caret && k < 1 ? <Caret x={x + ww + 5} y={y - 6} N={N} h={h + 12} /> : null}
    </>
  );
};

// ---- 手 ----
/**
 * 从上方按下来的手（线稿）：沿用 G1 HandIcon 的手指形状，整体转 180°（指尖朝下），
 * (cx,cy) 是掌心落点；rotate 180 = 竖直向下，小于 180 向右倾。与厨房线稿同一套描边。
 * 注意：翻转用外层 div 的 CSS rotate（SVG <g transform> 在这套环境里不稳）。
 */
export const HandPress: React.FC<{cx: number; cy: number; size?: number; rotate?: number; color?: string; opacity?: number}> = ({
  cx,
  cy,
  size = 160,
  rotate = 180,
  color = WHITE,
  opacity = 1,
}) => (
  <div style={{...abs(cx - size / 2, cy - size / 2, size, size), opacity, transform: `rotate(${rotate}deg)`}}>
    <svg width="100%" height="100%" viewBox="0 0 100 100" style={{position: 'absolute', left: size * 0.02, top: size * 0.1, overflow: 'visible'}}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" stroke={color} strokeWidth={2.6}>
        <path d="M34 52V24a5 5 0 0 1 10 0v28" fill="#000" />
        <path d="M46 52V18a5 5 0 0 1 10 0v34" fill="#000" />
        <path d="M58 52V22a5 5 0 0 1 10 0v30" fill="#000" />
        <path d="M70 52V34a5 5 0 0 1 10 0v18" fill="#000" />
        <path d="M34 54c-9-4-13 3-8 9l10 11h32V52" fill="#000" />
        <path d="M44 84v6M64 84v6" />
        <path d="M38 44h20" stroke={color} strokeWidth={1.6} opacity={0.55} />
      </g>
    </svg>
  </div>
);

// ---- 烟感装置（AlarmIcon 的可动版）----
/**
 * 烟感 + 恒温器：与 icons.tsx 的 AlarmIcon 同一几何，但指针 needle（度）可摆、顶上的小铃铛 bellK>0 时亮紫。
 * stub=false 时不画自带的那截短探针（SC33 要接一根长探针）。
 */
export const AlarmDevice: React.FC<{
  cx: number;
  cy: number;
  size?: number;
  color?: string;
  accent?: string;
  opacity?: number;
  needle?: number;
  bellK?: number;
  stub?: boolean;
}> = ({cx, cy, size = 300, color = WHITE, accent = PURPLE_LIGHT, opacity = 1, needle = 0, bellK = 0, stub = true}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <rect x="20" y="26" width="60" height="42" rx="4" {...S(color, 3, '#000')} />
    <circle cx="50" cy="47" r="14" {...S(accent, 2.4, '#000')} />
    {/* 表盘刻度 */}
    {[-60, 0, 60].map((a) => {
      const r0 = 5.5;
      const r1 = 10.5;
      const rad = ((a - 90) * Math.PI) / 180;
      return <line key={a} x1={50 + r0 * Math.cos(rad)} y1={47 + r0 * Math.sin(rad)} x2={50 + r1 * Math.cos(rad)} y2={47 + r1 * Math.sin(rad)} stroke={color} strokeWidth={1.6} opacity={0.65} />;
    })}
    {/* 指针（缓慢摆动） */}
    <g transform={`rotate(${needle.toFixed(2)} 50 47)`}>
      <path d="M50 47 58 36" {...S(accent, 2.6)} />
    </g>
    <circle cx="50" cy="47" r="2" fill={accent} />
    {/* 顶上的小铃铛 */}
    <path d="M54 22C54 15 60 12 66 12S74 17 74 22Z" {...S(bellK > 0.05 ? accent : color, 2.4, '#000')} />
    {bellK > 0.05 ? (
      <g opacity={clamp01(bellK)}>
        <path d="M58 8C58 4 62 2 66 2S74 4 74 8" fill="none" stroke={accent} strokeWidth={1.8} opacity={0.85} />
      </g>
    ) : null}
    {stub ? (
      <>
        <path d="M50 68V88" {...S(color, 2.6)} />
        <circle cx="50" cy="92" r="5" {...S(color, 2.4, '#000')} />
      </>
    ) : null}
  </Frame>
);

// ---- 虚线折线（探针 / 连接线）----
export type Pt = [number, number];

/** 折线按长度裁到 len（draw-on 用） */
export const cutPath = (pts: Pt[], len: number): Pt[] => {
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

export const polyLen = (pts: Pt[]) => pts.slice(1).reduce((a, b, i) => a + Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1]), 0);

/** 虚线折线：p 0→1 自起点长出，dash 为虚线样式 */
export const DashPolyline: React.FC<{pts: Pt[]; p: number; color?: string; sw?: number; dash?: string; opacity?: number}> = ({
  pts,
  p,
  color = PURPLE_LIGHT,
  sw = 2.2,
  dash = '10 9',
  opacity = 1,
}) => {
  const k = clamp01(p);
  if (k <= 0) return null;
  const out = cutPath(pts, polyLen(pts) * k);
  if (out.length < 2) return null;
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity}}>
      <polyline points={out.map((q) => q.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={dash} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/** 发光圆点（探针端点 / 沿线跑的光点） */
export const GlowDot: React.FC<{cx: number; cy: number; r?: number; color?: string; opacity?: number}> = ({cx, cy, r = 5, color = WHITE, opacity = 1}) => (
  <div style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none'}}>
    <div style={{...abs(cx - r, cy - r, 2 * r, 2 * r), borderRadius: r, background: color, boxShadow: '0 0 12px 4px rgba(102,45,248,.85)'}} />
    <div style={{...abs(cx - r * 2, cy - r * 2, 4 * r, 4 * r), borderRadius: 2 * r, border: `1px solid ${PURPLE_LIGHT}`, opacity: 0.4}} />
  </div>
);

// ---- 扫描横线（SC32「大字下方一条反复扫的横线」）----
/** 底线（p draw-on）+ 一束高光自左向右反复扫过；不是 LightSweep，只是一条细线 */
export const SweepUnderline: React.FC<{x: number; y: number; w: number; p: number; t: number; segW?: number; color?: string; opacity?: number}> = ({
  x,
  y,
  w,
  p,
  t,
  segW = 150,
  color = PURPLE_LIGHT,
  opacity = 1,
}) => {
  const k = clamp01(p);
  if (k <= 0) return null;
  const pos = x + (w + segW) * (((t % 1) + 1) % 1) - segW;
  return (
    <div style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none'}}>
      <div style={{...abs(x, y, w * k, 2), background: GREY_LINE, opacity: 0.9}} />
      <div
        style={{
          ...abs(Math.max(x, pos), y - 1, Math.min(segW, x + w - Math.max(x, pos)), 4),
          background: `linear-gradient(90deg, rgba(161,117,241,0) 0%, ${color} 50%, rgba(161,117,241,0) 100%)`,
          boxShadow: '0 0 14px 3px rgba(102,45,248,.5)',
          borderRadius: 2,
        }}
      />
    </div>
  );
};

/** 票身边框色：当前重点 / 已落位 */
export const TICKET_STROKE = {live: PURPLE_LIGHT, idle: '#7E6BA8'};
