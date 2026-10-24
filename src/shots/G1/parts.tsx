import React from 'react';
import {CText, Box, Svg, PURPLE, PURPLE_LIGHT, GREY, GREY_MID, GREY_LINE, GREY_LIGHT, WHITE, abs, mixHex} from '../../ui';
import {clamp01, FONT_HEAVY} from '../../common';

/**
 * G1（SC01–SC05）共用小零件。
 * 约定与 icons.tsx 相同：100×100 viewBox、黑填充 + 2.6–3px 描边、size 等比缩放。
 * 这里只放本组要用的东西：厨房立面线稿、灶火、便签、手（虚线缺席态）、对话气泡、虚线环、循环节点等。
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

// ---- 全片空间基准（与分镜表「全片空间基准」逐数一致；后面各组复用）----
export const KITCHEN = {
  fridge: {x: 60, y: 230, w: 130, h: 330}, // x 60–190, y 230–560
  wall: {x: 210, y: 210, w: 970, h: 220}, // 墙带 x 210–1180, y 210–430
  counterY: 470, // 台面线
  counterFrontY: 500, // 前沿带 470–500
  crate: {x: 1050, y: 515, w: 130, h: 105}, // 木箱 x1050–1180, y515–620
  chef: {cx: 700, cy: 355, size: 190}, // 厨师 x=700（SC01/SC53 同锚点）
  ringTop: {cx: 700, cy: 205, r: 52}, // 头顶空虚线圆
  ringFeet: {cx: 700, cy: 452, rx: 76, ry: 16}, // 脚下空虚线圆（贴台面线上方）
};

/**
 * 厨房立面线稿：冰箱 / 墙带 / 台面线+前沿带 / 木箱，全部 GREY_LINE 细线。
 * 墙带描边用负向 dashoffset 持续流动（本镜头唯一持续动作，不做漂浮/呼吸）。
 */
export const KitchenLineArt: React.FC<{N: number; opacity: number}> = ({N, opacity}) => {
  const {fridge, wall, counterY, counterFrontY, crate} = KITCHEN;
  return (
    <Svg bloom={false} opacity={opacity}>
      {/* 墙带：虚线外框持续流动 + 几枚墙钉 */}
      <rect
        x={wall.x}
        y={wall.y}
        width={wall.w}
        height={wall.h}
        rx={8}
        fill="none"
        stroke={GREY_LINE}
        strokeWidth={1.5}
        strokeDasharray="26 18"
        strokeDashoffset={-N * 1.1}
      />
      <path d={`M${wall.x} ${wall.y + wall.h}H${wall.x + wall.w}`} stroke={GREY_LINE} strokeWidth={1.2} strokeDasharray="4 12" strokeDashoffset={N * 0.7} opacity={0.7} />
      {[280, 700, 1120].map((x) => (
        <path key={x} d={`M${x} ${wall.y}V${wall.y + 12}`} stroke={GREY_LINE} strokeWidth={2} opacity={0.8} />
      ))}

      {/* 冰箱：门缝 + 把手 */}
      <rect x={fridge.x} y={fridge.y} width={fridge.w} height={fridge.h} rx={6} fill="none" stroke={GREY_LINE} strokeWidth={1.5} />
      <path d={`M${fridge.x} ${fridge.y + 130}H${fridge.x + fridge.w}`} stroke={GREY_LINE} strokeWidth={1.4} />
      <path d={`M${fridge.x + fridge.w - 14} ${fridge.y + 62}V${fridge.y + 104}`} stroke={GREY_LINE} strokeWidth={2.2} />
      <path d={`M${fridge.x + 10} ${fridge.y + 60}H${fridge.x + 46}`} stroke={GREY_LINE} strokeWidth={1.2} opacity={0.7} />

      {/* 台面线 + 前沿带 */}
      <path d={`M190 ${counterY}H1200`} stroke={GREY_LINE} strokeWidth={1.6} />
      <path d={`M210 ${counterFrontY}H1180`} stroke={GREY_LINE} strokeWidth={1.2} strokeDasharray="6 9" />
      {[250, 390, 530, 670, 810, 950, 1090].map((x) => (
        <path key={x} d={`M${x} ${counterY}V${counterFrontY}`} stroke={GREY_LINE} strokeWidth={1.1} opacity={0.55} />
      ))}

      {/* 木箱：外框 + 上沿 + 交叉板 */}
      <rect x={crate.x} y={crate.y} width={crate.w} height={crate.h} fill="none" stroke={GREY_LINE} strokeWidth={1.5} />
      <path d={`M${crate.x} ${crate.y + 18}H${crate.x + crate.w}`} stroke={GREY_LINE} strokeWidth={1.4} />
      <path d={`M${crate.x} ${crate.y}L${crate.x + crate.w} ${crate.y + crate.h}M${crate.x + crate.w} ${crate.y}L${crate.x} ${crate.y + crate.h}`} stroke={GREY_LINE} strokeWidth={1.2} opacity={0.85} />
      <path d={`M${crate.x} ${crate.y}L${crate.x - 8} ${crate.y - 10}H${crate.x + crate.w - 8}L${crate.x + crate.w} ${crate.y}`} fill="none" stroke={GREY_LINE} strokeWidth={1.4} />
    </Svg>
  );
};

/** 空虚线圆 / 椭圆（SC01 头顶、脚下的占位圈；SC02 脑落位的圈） */
export const DashRing: React.FC<{cx: number; cy: number; rx: number; ry?: number; color?: string; opacity?: number; phase?: number; sw?: number}> = ({
  cx,
  cy,
  rx,
  ry,
  color = GREY_LIGHT,
  opacity = 1,
  phase = 0,
  sw = 2,
}) => (
  <Svg bloom={false} opacity={opacity}>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry ?? rx} fill="none" stroke={color} strokeWidth={sw} strokeDasharray="10 9" strokeDashoffset={phase} />
  </Svg>
);

// ---- 器具 / 便签 / 手（同一套 S 描边风格）----
/** 灶火：灶眼 + 外焰 + 内焰 */
export const StoveIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({
  cx,
  cy,
  size = 84,
  color = WHITE,
  accent = PURPLE,
  opacity = 1,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <ellipse cx="50" cy="76" rx="30" ry="8" {...S(color, 3, '#000')} />
    <path d="M28 72V80M72 72V80M50 84V80" {...S(color, 2.8)} />
    <path d="M50 66C39 55 45 46 50 30C55 46 61 55 50 66Z" {...S(color, 3, '#000')} />
    <path d="M50 60C45 53 48 47 50 39C52 47 55 53 50 60Z" {...S(accent, 2.2, accent)} />
    <path d="M50 22V27" {...S(color, 2.4)} />
  </Frame>
);

/** 便签（记忆）：折角纸 + 一枚图钉 + 三行字 */
export const StickyNoteIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({
  cx,
  cy,
  size = 84,
  color = WHITE,
  accent = PURPLE,
  opacity = 1,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M26 20H62L74 32V80H26Z" {...S(color, 3, '#000')} />
    <path d="M62 20V32H74" {...S(color, 2.4)} />
    <path d="M36 44H64M36 55H64M36 66H54" {...S(color, 2.2)} />
    <circle cx="38" cy="32" r="4.5" {...S(accent, 2.2, accent)} />
  </Frame>
);

/** 手（虚线缺席态）：手掌 + 四指 + 拇指 + 手腕；SC04「大脑没有手」用 */
export const HandIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; opacity?: number; dashed?: boolean}> = ({
  cx,
  cy,
  size = 92,
  color = GREY,
  opacity = 1,
  dashed = true,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? '6 6' : undefined} stroke={color} strokeWidth={2.6}>
      <path d="M34 52V24a5 5 0 0 1 10 0v28" />
      <path d="M46 52V18a5 5 0 0 1 10 0v34" />
      <path d="M58 52V22a5 5 0 0 1 10 0v30" />
      <path d="M70 52V34a5 5 0 0 1 10 0v18" />
      <path d="M34 54c-9-4-13 3-8 9l10 11h32V52" />
      <path d="M44 84v6M64 84v6" />
    </g>
  </Frame>
);

/** 对话气泡（带左侧小尾巴）：SC04「我认为……」 */
export const SpeechBubble: React.FC<{x: number; y: number; w: number; h: number; opacity?: number; children: React.ReactNode}> = ({x, y, w, h, opacity = 1, children}) => (
  <div style={{opacity}}>
    {/* 尾巴：外层白三角 + 内层黑三角，拼出 2px 描边 */}
    <div style={{...abs(x - 15, y + h * 0.55 - 11, 0, 0), width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderRight: `16px solid ${WHITE}`}} />
    <div style={{...abs(x - 10, y + h * 0.55 - 8, 0, 0), width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: '12px solid #000'}} />
    <Box x={x} y={y} w={w} h={h} r={14} fill="#000" stroke={WHITE} sw={2}>
      {children}
    </Box>
  </div>
);

// ---- 循环节点 ----
type Pt = [number, number];
/** 闭合折线上按弧长取点，t∈[0,1) 绕一圈 */
export const polyPoint = (pts: Pt[], t: number): Pt => {
  const n = pts.length;
  const lens: number[] = [];
  let total = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    lens.push(L);
    total += L;
  }
  let d = (((t % 1) + 1) % 1) * total;
  for (let i = 0; i < n; i++) {
    if (d <= lens[i] || i === n - 1) {
      const a = pts[i];
      const b = pts[(i + 1) % n];
      const k = lens[i] > 0 ? d / lens[i] : 0;
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    }
    d -= lens[i];
  }
  return pts[0];
};

/** 点在某段直线上的位置（光点沿引线跑） */
export const linePoint = (x0: number, y0: number, x1: number, y1: number, t: number): Pt => [x0 + (x1 - x0) * clamp01(t), y0 + (y1 - y0) * clamp01(t)];

/** 厨师身体部位的紫色脉冲环（SC05 每亮一枚小图标闪一次）。p 0→1 时扩散并淡出。 */
export const PulseRing: React.FC<{cx: number; cy: number; p: number; r?: number; opacity?: number}> = ({cx, cy, p, r = 24, opacity = 1}) => {
  if (p <= 0 || p >= 1) return null;
  const rr = r * (0.55 + 1.0 * clamp01(p));
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <circle
        cx={cx}
        cy={cy}
        r={rr}
        fill="none"
        stroke={PURPLE_LIGHT}
        strokeWidth={2.4}
        opacity={opacity * (1 - clamp01(p))}
        style={{filter: 'drop-shadow(0 0 6px rgba(102,45,248,.85))'}}
      />
    </svg>
  );
};

/** 小标签（图标下方 22px 说明字），供 SC05 用 */
export const MiniLabel: React.FC<{cx: number; cy: number; text: string; color?: string; opacity?: number}> = ({cx, cy, text, color = GREY, opacity = 1}) => (
  <CText cx={cx} cy={cy} size={22} weight={600} family={FONT_HEAVY} color={color} opacity={opacity} dy={-1}>
    {text}
  </CText>
);

/** 颜色工具：给 SC05 图标做灰→紫 */
export const mixGrayPurple = (k: number) => mixHex(GREY_MID, PURPLE_LIGHT, clamp01(k));
