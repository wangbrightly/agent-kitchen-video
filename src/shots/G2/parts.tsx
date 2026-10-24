import React from 'react';
import {CText, PURPLE_LIGHT, GREY, abs} from '../../ui';
import {FONT_HEAVY, FONT_MONO, clamp01} from '../../common';

/**
 * G2（SC06–SC09）共用小零件。
 * 沿用 icons.tsx 的约定：100×100 viewBox、黑填充 + 2.6–3px 描边、size 等比缩放。
 * 本组补的都是分镜里点到、但图标库没有的图元：虚线厨师（缺席/未定态）、柱状图、信封、
 * 花括号道具、向上生长的括号线、脉冲环、流动光点。
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

/** 虚线厨师轮廓（和 ChefIcon 同一套骨架，只描边不填充、整体 grey 虚线）。SC07「不同的厨师身体」用。 */
export const ChefGhost: React.FC<{cx: number; cy: number; size?: number; color?: string; opacity?: number; sw?: number}> = ({
  cx,
  cy,
  size = 110,
  color = GREY,
  opacity = 1,
  sw = 2.4,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <g {...S(color, sw)} strokeDasharray="5 5">
      <circle cx="50" cy="15" r="11" />
      <path d="M50 26V34" />
      <rect x="34" y="34" width="32" height="30" rx="8" />
      <circle cx="30" cy="40" r="6.5" />
      <circle cx="70" cy="40" r="6.5" />
      <path d="M27 47 22 62M73 47 78 62" />
      <circle cx="22" cy="66" r="4.5" />
      <circle cx="78" cy="66" r="4.5" />
      <path d="M43 64V80M57 64V80" />
      <circle cx="43" cy="66" r="4" />
      <circle cx="57" cy="66" r="4" />
      <path d="M36 88H46M54 88H64" />
    </g>
  </Frame>
);

/** 柱状图（分析数据）：坐标轴 + 四根柱 + 一条目标虚线。 */
export const BarChartIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({
  cx,
  cy,
  size = 58,
  color = '#FFFFFF',
  accent = GREY,
  opacity = 1,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M16 84H86M16 84V16" {...S(color, 3)} />
    <path d="M22 28H84" {...S(accent, 1.6)} strokeDasharray="5 6" />
    <rect x="26" y="58" width="12" height="26" {...S(color, 2.8, '#000')} />
    <rect x="43" y="44" width="12" height="40" {...S(color, 2.8, '#000')} />
    <rect x="60" y="30" width="12" height="54" {...S(color, 2.8, '#000')} />
    <rect x="77" y="50" width="9" height="34" {...S(color, 2.8, '#000')} />
  </Frame>
);

/** 信封（处理邮件）：矩形 + 折角封口 + 右上邮票。 */
export const EnvelopeIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({
  cx,
  cy,
  size = 58,
  color = '#FFFFFF',
  accent = GREY,
  opacity = 1,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <rect x="12" y="28" width="76" height="52" rx="4" {...S(color, 3, '#000')} />
    <path d="M13 31 50 58 87 31" {...S(accent, 2.2)} />
    <rect x="66" y="6" width="20" height="16" rx="2" {...S(color, 2.2, '#000')} />
    <path d="M70 14H82" {...S(accent, 1.6)} strokeDasharray="3 4" />
  </Frame>
);

/** 花括号道具（写代码）：等宽字，两个大括号中间留空。 */
export const BraceProp: React.FC<{cx: number; cy: number; size?: number; color?: string; opacity?: number}> = ({cx, cy, size = 62, color = '#FFFFFF', opacity = 1}) => (
  <CText cx={cx} cy={cy} size={size} weight={600} family={FONT_MONO} color={color} opacity={opacity} letterSpacing={6} dy={0}>
    {'{ }'}
  </CText>
);

/**
 * 向上生长的括号线：从底部横臂起笔，沿竖线上行，到顶部再折出横臂。
 * dir=1 开口向右（左侧用），dir=-1 开口向左（右侧用）。p 为 draw-on 进度（pathLength=1）。
 */
export const Bracket: React.FC<{x: number; yTop: number; yBot: number; dir?: 1 | -1; p: number; color?: string; opacity?: number; arm?: number; sw?: number}> = ({
  x,
  yTop,
  yBot,
  dir = 1,
  p,
  color = '#D4D4D4',
  opacity = 1,
  arm = 18,
  sw = 2,
}) => {
  const q = clamp01(p);
  if (q <= 0) return null;
  const d = dir === 1 ? `M${x + arm} ${yBot} H${x} V${yTop} H${x + arm}` : `M${x - arm} ${yBot} H${x} V${yTop} H${x - arm}`;
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity}}>
      <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - q} />
    </svg>
  );
};

/** 5px 紫光点（沿线跑）。 */
export const FlowDot: React.FC<{cx: number; cy: number; r?: number; opacity?: number}> = ({cx, cy, r = 3, opacity = 1}) => (
  <div style={{...abs(cx - r, cy - r, r * 2, r * 2), borderRadius: r, background: '#FFFFFF', boxShadow: '0 0 8px 2px rgba(102,45,248,.8)', opacity}} />
);

/** 语义脉冲环（点亮 / 落位时一圈扩散），p 0→1。 */
export const PulseRing: React.FC<{cx: number; cy: number; p: number; r?: number; opacity?: number}> = ({cx, cy, p, r = 24, opacity = 1}) => {
  if (p <= 0 || p >= 1) return null;
  const rr = r * (0.55 + 1.0 * clamp01(p));
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <circle cx={cx} cy={cy} r={rr} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.4} opacity={opacity * (1 - clamp01(p))} style={{filter: 'drop-shadow(0 0 6px rgba(102,45,248,.85))'}} />
    </svg>
  );
};

/** 22–30px 说明字（图标 / 图元下方）。 */
export const MiniLabel: React.FC<{cx: number; cy: number; text: string; size?: number; color?: string; opacity?: number}> = ({cx, cy, text, size = 26, color = GREY, opacity = 1}) => (
  <CText cx={cx} cy={cy} size={size} weight={600} family={FONT_HEAVY} color={color} opacity={opacity} dy={-1}>
    {text}
  </CText>
);

/** 直线上的点：光点沿引线 / 箭头跑（t 0→1）。 */
export const linePoint = (x0: number, y0: number, x1: number, y1: number, t: number): [number, number] => [
  x0 + (x1 - x0) * clamp01(t),
  y0 + (y1 - y0) * clamp01(t),
];
