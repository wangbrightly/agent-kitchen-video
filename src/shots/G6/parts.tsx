import React from 'react';
import {Box, CText, GREY_LIGHT, GREY_LINE, PURPLE, PURPLE_LIGHT, WHITE, abs, glowPurpleS, mixHex} from '../../ui';
import {FONT_HEAVY, clamp01} from '../../common';

/**
 * G6（SC24–SC28）共用小零件。
 * 约定与 icons.tsx 相同：100×100 viewBox、黑填充 + 2.2–3px 描边、size 等比缩放。
 * 本组新增：大号便签卡（SC25）、冰箱门上的四张纸（SC24）、时间轴小便签（SC26）、
 *           刷子 / 盐罐 / 可动手臂的厨师（SC27）、警示三角（SC26）与横线光点（SC28）。
 * 厨房立面线稿与 KITCHEN 常量不在这里重画，直接从 ../G1/parts 复用。
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

// ---- 打字机 / 光标 ----
/** 打字机切片：从起始帧算起，每 fpt 帧长一个字 */
export const typeSlice = (s: string, n: number, fpt = 1.6) => {
  if (n < 0) return '';
  return s.slice(0, Math.min(s.length, Math.floor(n / fpt) + 1));
};

/** 估算一行中文/混排文字的宽度（便签文字用，判断是否越出卡面） */
export const textW = (s: string, size: number, squeeze = 1) =>
  [...s].reduce((a, ch) => a + (ch.charCodeAt(0) > 255 ? size : size * 0.58), 0) * squeeze;

/** 闪烁光标（打字中）：8 帧一呼一吸，属动词动作，不是漂浮 */
export const Caret: React.FC<{x: number; y: number; N: number; h?: number; w?: number; color?: string; opacity?: number}> = ({x, y, N, h = 18, w = 3, color = PURPLE_LIGHT, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      background: color,
      opacity: opacity * (Math.floor(N / 8) % 2 === 0 ? 0.95 : 0.12),
      boxShadow: `0 0 8px rgba(161,117,241,.85)`,
    }}
  />
);

// ---- 便签大卡（SC25）----
/**
 * 黑底白边便签卡：折角 + 顶部图钉 + 一行中文（可打字机）+ 两条灰线 + 右下角光标。
 * active 时边框与横线转紫并带柔光；一次只亮一张（讲到哪张亮哪张）。
 */
export const NoteCard: React.FC<{
  w?: number;
  h?: number;
  title: string;
  chars?: number;
  active?: boolean;
  glowK?: number;
  opacity?: number;
  titleSize?: number;
  cursorOp?: number;
}> = ({w = 290, h = 172, title, chars = 999, active = false, glowK = 0, opacity = 1, titleSize = 24, cursorOp = 0}) => {
  const border = active ? PURPLE_LIGHT : WHITE;
  const lineCol = active ? PURPLE_LIGHT : GREY_LIGHT;
  const shown = title.slice(0, Math.max(0, chars));
  const lines: Array<[number, number]> = [
    [0.62, 0.74],
    [0.77, 0.56],
  ];
  return (
    <div style={{position: 'relative', width: w, height: h, opacity}}>
      <Box x={0} y={0} w={w} h={h} r={5} fill="#000" stroke={border} sw={2.4} glow={active && glowK > 0.005 ? glowPurpleS(glowK) : undefined} />
      {/* 折角 */}
      <svg width={28} height={28} viewBox="0 0 28 28" style={{position: 'absolute', right: -1, bottom: -1, overflow: 'visible'}}>
        <path d="M28 0 V28 H0" fill="none" stroke={border} strokeWidth={2} opacity={0.55} />
        <path d="M28 0 L0 28" fill="none" stroke={border} strokeWidth={1.2} opacity={0.3} />
      </svg>
      {/* 图钉 */}
      <div style={{position: 'absolute', left: w / 2 - 5, top: -5, width: 10, height: 10, borderRadius: 5, background: active ? PURPLE : '#000', border: `2.4px solid ${border}`, boxSizing: 'border-box'}} />
      {/* 一行中文 */}
      <div
        style={{
          position: 'absolute',
          left: 18,
          top: h * 0.27,
          fontFamily: FONT_HEAVY,
          fontSize: titleSize,
          fontWeight: 700,
          color: WHITE,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          transform: 'scaleX(0.86)',
          transformOrigin: '0 0',
        }}
      >
        {shown}
      </div>
      {/* 两条灰线 */}
      {lines.map(([ty, wf], i) => (
        <div key={i} style={{position: 'absolute', left: 18, top: h * ty, width: (w - 36) * wf, height: 3, background: lineCol, opacity: 0.85}} />
      ))}
      {/* 右下角打字光标 */}
      {cursorOp > 0.02 ? <div style={{position: 'absolute', left: w - 40, top: h - 34, width: 3, height: 16, background: PURPLE_LIGHT, opacity: cursorOp, boxShadow: '0 0 8px rgba(161,117,241,.9)'}} /> : null}
    </div>
  );
};

// ---- 冰箱门上的四张纸（SC24）----
/** 便签：世界坐标 (x,y) 为左上角；紫色那张是「被记住的那条」。lineP 为第二行字迹的生长进度（6037 的「上面可能写着」） */
export const DoorNote: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  purple?: boolean;
  lineP?: number;
  caretOp?: number;
  opacity?: number;
  scale?: number;
  dy?: number;
  rot?: number;
  glowK?: number;
}> = ({x, y, w = 48, h = 54, purple = false, lineP = 1, caretOp = 0, opacity = 1, scale = 1, dy = 0, rot = 0, glowK = 0}) => {
  const ink = purple ? '#000' : GREY_LIGHT;
  return (
    <div style={{position: 'absolute', left: x, top: y + dy, width: w, height: h, opacity, transform: `rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`, transformOrigin: '50% 50%'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxSizing: 'border-box',
          background: purple ? PURPLE : '#000',
          border: `2.4px solid ${purple ? PURPLE_LIGHT : WHITE}`,
          boxShadow: purple && glowK > 0.005 ? glowPurpleS(glowK) : undefined,
        }}
      />
      <div style={{position: 'absolute', left: 7, top: 12, width: w - 14, height: 2.4, background: ink, opacity: 0.9}} />
      <div style={{position: 'absolute', left: 7, top: 22, width: (w - 14) * clamp01(lineP), height: 2.4, background: ink, opacity: 0.9}} />
      {purple && caretOp > 0.02 ? (
        <div style={{position: 'absolute', left: 7 + (w - 14) * clamp01(lineP) + 2, top: 18, width: 2, height: 10, background: '#000', opacity: caretOp}} />
      ) : null}
    </div>
  );
};

// ---- 时间轴小便签（SC26）----
/** 站在时间轴上的小纸：黑底白边 + 顶针 + 两条灰线；lit 时转紫 */
export const AxisNote: React.FC<{
  cx: number;
  cy: number;
  w?: number;
  h?: number;
  lit?: number;
  opacity?: number;
  glowK?: number;
}> = ({cx, cy, w = 110, h = 126, lit = 0, opacity = 1, glowK = 0}) => {
  const k = clamp01(lit);
  // 被光标读到的便签整张转紫（填充一次性切换，像灯被打开），边线随 k 渐变
  const on = k > 0.5;
  const border = mixHex(WHITE, PURPLE_LIGHT, k);
  const ink = on ? '#140733' : GREY_LIGHT;
  return (
    <div style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, opacity}}>
      <Box x={0} y={0} w={w} h={h} r={4} fill={on ? PURPLE : '#000'} stroke={border} sw={2.2} glow={glowK > 0.005 ? glowPurpleS(glowK) : undefined} />
      <div style={{position: 'absolute', left: w / 2 - 4, top: -4, width: 8, height: 8, borderRadius: 4, background: on ? PURPLE : '#000', border: `2px solid ${border}`, boxSizing: 'border-box'}} />
      {[0, 1].map((i) => (
        <div key={i} style={{position: 'absolute', left: 14, top: 34 + i * 26, width: (w - 28) * (i === 0 ? 0.88 : 0.62), height: 3, background: ink, opacity: 0.9}} />
      ))}
    </div>
  );
};

// ---- 刷子（SC27）----
/** 厨房刷：斜柄 + 金属箍 + 刷毛；刷头朝左下，整体可绕中心转 */
export const Brush: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; rot?: number; opacity?: number}> = ({cx, cy, size = 78, color = WHITE, accent = PURPLE_LIGHT, rot = 0, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <g transform={`rotate(${rot} 50 50)`}>
      {/* 柄 */}
      <path d="M58 10 L78 30 L52 56 L32 36 Z" {...S(color, 3, '#000')} />
      {/* 金属箍 */}
      <path d="M32 36 L52 56 L45 63 L25 43 Z" {...S(accent, 2.6, '#000')} />
      {/* 刷毛 */}
      <path d="M25 43 L45 63 L34 78 L14 58 Z" {...S(color, 2.8, '#000')} />
      <path d="M22 50 L42 70 M19 57 L36 74" {...S(color, 1.6)} />
    </g>
  </Frame>
);

// ---- 敞口锅（SC27）----
/** 敞口锅：椭圆锅口 + 桶身 + 双耳，锅口朝上，盐可以倒进去 */
export const OpenPot: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 165, color = WHITE, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M26 44V64C26 74 33 82 42 82H58C67 82 74 74 74 64V44" {...S(color, 3, '#000')} />
    <ellipse cx="50" cy="44" rx="24" ry="6.5" {...S(color, 3, '#000')} />
    <path d="M19 48H26M74 48H81" {...S(color, 3)} />
    <path d="M34 58H45" {...S(accent, 2.4)} />
  </Frame>
);

// ---- 盐罐（SC27）----/** 盐罐：罐身 + 带孔盖，罐身写「盐」；rot 让罐口倒向锅 */
export const SaltShaker: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; rot?: number; opacity?: number}> = ({cx, cy, size = 88, color = WHITE, accent = PURPLE_LIGHT, rot = 0, opacity = 1}) => (
  <div style={{position: 'absolute', inset: 0, opacity, transform: `rotate(${rot}deg)`, transformOrigin: `${cx}px ${cy}px`}}>
    <Frame cx={cx} cy={cy} size={size}>
      <path d="M33 36 H67 L62 86 H38 Z" {...S(color, 3, '#000')} />
      <path d="M35 22 H65 V36 H35 Z" {...S(color, 2.8, '#000')} />
      <circle cx="43" cy="27" r="1.9" fill={color} />
      <circle cx="50" cy="27" r="1.9" fill={color} />
      <circle cx="57" cy="27" r="1.9" fill={color} />
      <path d="M41 50 H59 M41 58 H59" {...S(accent, 2)} />
    </Frame>
    <CText cx={cx} cy={cy + size * 0.19} size={Math.round(size * 0.2)} weight={700} family={FONT_HEAVY} color={WHITE} dy={-1}>
      盐
    </CText>
  </div>
);

// ---- 可动手臂的厨师（SC27）----
/**
 * ChefIcon 的同一套骨架，但左臂可绕肩转动（SC27 要「把盐罐倒进锅里」）。
 * 手臂角度 armAngle 以度计：0 = 自然下垂（与 ChefIcon 的站姿一致），正角度把左臂抬向左上。
 * 手的位置用 pourHand() 计算，盐罐由镜头按同一套角度摆放。
 */
export const PourChef: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; armAngle?: number; opacity?: number}> = ({
  cx,
  cy,
  size = 160,
  color = WHITE,
  accent = PURPLE,
  armAngle = 0,
  opacity = 1,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <circle cx="50" cy="15" r="11" {...S(color, 3, '#000')} />
    <path d="M50 26V34" {...S(accent, 3)} />
    <rect x="34" y="34" width="32" height="30" rx="8" {...S(color, 3, '#000')} />
    <circle cx="70" cy="40" r="6.5" {...S(color, 2.4, '#000')} />
    {/* 右臂：静止下垂 */}
    <path d="M73 47 78 62" {...S(color, 3)} />
    <circle cx="78" cy="66" r="4.5" {...S(color, 2.2, '#000')} />
    {/* 左臂：绕肩 (30,42) 转动 */}
    <g transform={`rotate(${armAngle.toFixed(2)} 30 42)`}>
      <path d="M30 42 16 58" {...S(color, 3)} />
      <circle cx="14" cy="62" r="5" {...S(color, 2.2, '#000')} />
    </g>
    <path d="M43 64V80M57 64V80" {...S(color, 3)} />
    <circle cx="43" cy="66" r="4" {...S(color, 2.2, '#000')} />
    <circle cx="57" cy="66" r="4" {...S(color, 2.2, '#000')} />
    <path d="M36 88H46M54 88H64" {...S(color, 3.4)} />
  </Frame>
);

/** 与 PourChef 手臂同一套变换：手（掌心）的世界坐标 */
export const pourHand = (cx: number, cy: number, size: number, armAngle: number) => {
  const a = (armAngle * Math.PI) / 180;
  const dx = 14 - 30;
  const dy = 62 - 42;
  const vx = 30 + dx * Math.cos(a) - dy * Math.sin(a);
  const vy = 42 + dx * Math.sin(a) + dy * Math.cos(a);
  const s = size / 100;
  return {x: cx + (vx - 50) * s, y: cy + (vy - 50) * s};
};

// ---- 警示三角（SC26）----
/** 橙色警示三角：p 为弹出进度（0→1 缩放 0.5→1 + 淡入），glowK 给短橙闪 */
export const WarnTriangle: React.FC<{cx: number; cy: number; size?: number; p?: number; glowK?: number; opacity?: number}> = ({cx, cy, size = 56, p = 1, glowK = 0, opacity = 1}) => {
  const k = clamp01(p);
  if (k <= 0) return null;
  const s = 0.5 + 0.5 * k;
  const h = size;
  const w = size * 0.9;
  return (
    <div style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, opacity: opacity * k, transform: `scale(${s.toFixed(3)})`, transformOrigin: '50% 50%', filter: glowK > 0.005 ? `drop-shadow(0 0 ${Math.round(14 * glowK)}px rgba(240,95,65,${(0.85 * glowK).toFixed(2)}))` : undefined}}>
      <svg width={w} height={h} viewBox="0 0 90 100" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d="M45 6 L88 90 H2 Z" fill="#000" stroke="#F05F41" strokeWidth={5} strokeLinejoin="round" />
        <path d="M45 36 V64" stroke="#F05F41" strokeWidth={7} strokeLinecap="round" />
        <circle cx="45" cy="76" r="4.4" fill="#F05F41" />
      </svg>
    </div>
  );
};

// ---- 时间轴 ----
/** 时间轴刻度：一条竖线 + 一枚标签（今天 / 明天 / 后天）；lit 0→1 灰转紫 */
export const TickLabel: React.FC<{x: number; y: number; text: string; p?: number; lit?: number}> = ({x, y, text, p = 1, lit = 0}) => {
  const k = clamp01(lit);
  const col = k > 0.5 ? PURPLE_LIGHT : k > 0.1 ? '#C9B4F5' : GREY_LIGHT;
  return (
    <>
      <div style={{position: 'absolute', left: x - 1, top: y - 7 * p, width: 2, height: 14 * p, background: col, opacity: p > 0 ? 0.95 : 0}} />
      <CText cx={x} cy={y + 36} size={22} weight={600} family={FONT_HEAVY} color={col} opacity={p} dy={-1}>
        {text}
      </CText>
    </>
  );
};
