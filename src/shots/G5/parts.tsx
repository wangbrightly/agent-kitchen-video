import React from 'react';
import {Box, GREY, GREY_LIGHT, GREY_LINE, PURPLE, PURPLE_LIGHT, WHITE, abs, glowPurpleS} from '../../ui';
import {FONT_HEAVY, FONT_MONO, clamp01} from '../../common';
import {KnifeIcon} from '../../icons';

/**
 * G5（SC19–SC23）共用小零件。
 * 与 icons.tsx 同一套约定：100×100 viewBox、黑填充 + 2.2–3px 白描边、size 等比缩放。
 * 只放本组要用的东西：可抽卡的技能盒、厨房器具（锅/勺/夹/铲）、大卡片、循环箭头、取景框角。
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

/**
 * 技能盒：CardBoxIcon 的可动画版。四张卡脊可单独抬起（lift 单位与 viewBox 一致），
 * 也可以单独隐藏（hide，SC23 抽走一张后盒里只剩三道卡脊）。
 * cx/cy 是 100×100 视图中心，size 为视觉边长。
 */
export const SkillBox: React.FC<{
  cx: number;
  cy: number;
  size?: number;
  color?: string;
  accent?: string;
  opacity?: number;
  lift?: number[];
  hide?: boolean[];
}> = ({cx, cy, size = 170, color = WHITE, accent = PURPLE, opacity = 1, lift = [0, 0, 0, 0], hide = [false, false, false, false]}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    {[26, 39, 52, 65].map((x, i) => {
      if (hide[i]) return null;
      const up = lift[i] ?? 0;
      const y = 26 + (i % 2) * 4;
      return (
        <g key={x} transform={`translate(0 ${-up.toFixed(2)})`}>
          <rect x={x} y={y} width="11" height="34" {...S(color, 2.2, '#000')} />
          <rect x={x + 1.5} y={y - 4} width="8" height="6" {...S(i === 1 ? accent : color, 2, i === 1 ? accent : '#000')} />
        </g>
      );
    })}
    <rect x="16" y="56" width="68" height="30" rx="4" {...S(color, 3, '#000')} />
    <path d="M22 66H78M22 74H62" {...S(color, 2)} />
  </Frame>
);

// ---- 五件厨房器具（刀直接复用 icons，其余同风格）----
export type UtensilKind = 'knife' | 'pot' | 'spoon' | 'tongs' | 'spatula';

/** 锅：深锅 + 双耳 + 锅盖 */
const PotIcon: React.FC<{cx: number; cy: number; size: number; color: string; accent: string; opacity: number}> = ({cx, cy, size, color, accent, opacity}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M28 40H72V70C72 77 67 82 60 82H40C33 82 28 77 28 70Z" {...S(color, 3, '#000')} />
    <path d="M23 40H77" {...S(color, 3)} />
    <path d="M22 48H28M72 48H78" {...S(color, 3)} />
    <path d="M50 40V32" {...S(color, 2.6)} />
    <circle cx="50" cy="28" r="4" {...S(accent, 2.2, '#000')} />
    <path d="M34 54H44" {...S(accent, 2.2)} />
  </Frame>
);

/** 勺：椭圆勺头 + 长柄 */
const SpoonIcon: React.FC<{cx: number; cy: number; size: number; color: string; accent: string; opacity: number}> = ({cx, cy, size, color, accent, opacity}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <ellipse cx="50" cy="31" rx="15" ry="19" {...S(color, 3, '#000')} />
    <path d="M50 50V83" {...S(color, 3)} />
    <circle cx="50" cy="86" r="3.6" {...S(accent, 2.2, '#000')} />
    <path d="M44 27C44 20 48 17 50 17" {...S(accent, 2.2)} />
  </Frame>
);

/** 夹：顶部铰点 + 两条长臂 */
const TongsIcon: React.FC<{cx: number; cy: number; size: number; color: string; accent: string; opacity: number}> = ({cx, cy, size, color, accent, opacity}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <circle cx="50" cy="18" r="6" {...S(color, 3, '#000')} />
    <path d="M46 23 33 72M54 23 67 72" {...S(color, 3)} />
    <path d="M33 72 38 80M67 72 62 80" {...S(color, 3)} />
    <path d="M36 76H46M54 76H64" {...S(accent, 2.2)} />
  </Frame>
);

/** 铲：带槽铲头 + 长柄 + 挂环 */
const SpatulaIcon: React.FC<{cx: number; cy: number; size: number; color: string; accent: string; opacity: number}> = ({cx, cy, size, color, accent, opacity}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M33 50H67V78C67 81 65 83 62 83H38C35 83 33 81 33 78Z" {...S(color, 3, '#000')} />
    <path d="M50 50V22" {...S(color, 3)} />
    <circle cx="50" cy="16" r="6" {...S(color, 2.6, '#000')} />
    <path d="M41 61V75M50 61V75M59 61V75" {...S(accent, 2.2)} />
  </Frame>
);

export const UtensilIcon: React.FC<{
  kind: UtensilKind;
  cx: number;
  cy: number;
  size?: number;
  color?: string;
  accent?: string;
  opacity?: number;
  rotate?: number;
}> = ({kind, cx, cy, size = 84, color = WHITE, accent = PURPLE, opacity = 1, rotate = 0}) => {
  let body: React.ReactNode;
  if (kind === 'knife') body = <KnifeIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  else if (kind === 'pot') body = <PotIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  else if (kind === 'spoon') body = <SpoonIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  else if (kind === 'tongs') body = <TongsIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  else body = <SpatulaIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  if (!rotate) return <>{body}</>;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `rotate(${rotate}deg)`, transformOrigin: `${cx}px ${cy}px`}}>
      {body}
    </div>
  );
};

/**
 * 菜谱大卡：黑底白框 + 左对齐标题 + 三条灰横线。
 * 标题用 chars 控制打字机；lineFill 0→1 逐行填充；active 时描边和填充转紫。
 * 尺寸由调用方在外层定位（卡面固定 w×h）。
 */
export const BigCard: React.FC<{
  w: number;
  h: number;
  title: string;
  chars: number;
  titleSize?: number;
  lineFill?: number[];
  active?: boolean;
  glowK?: number;
  cursorRow?: number;
  cursorOp?: number;
  opacity?: number;
  r?: number;
  stroke?: string;
  fill?: string;
}> = ({w, h, title, chars, titleSize = 22, lineFill = [0, 0, 0], active = false, glowK = 0, cursorRow = -1, cursorOp = 0, opacity = 1, r = 10, stroke, fill = '#000'}) => {
  const border = stroke ?? (active ? PURPLE_LIGHT : WHITE);
  const lineColor = active ? PURPLE_LIGHT : GREY_LIGHT;
  return (
    <Box x={0} y={0} w={w} h={h} r={r} fill={fill} stroke={border} sw={2} opacity={opacity} glow={active && glowK > 0 ? glowPurpleS(glowK) : undefined}>
      <div
        style={{
          position: 'absolute',
          left: 14,
          top: titleSize > 24 ? 20 : 17,
          fontFamily: FONT_HEAVY,
          fontWeight: 700,
          fontSize: titleSize,
          lineHeight: 1,
          color: WHITE,
          letterSpacing: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {title.slice(0, Math.max(0, chars))}
      </div>
      {[0, 1, 2].map((i) => {
        const baseW = w * [0.78, 0.66, 0.52][i] - 14;
        const y = h * [0.42, 0.6, 0.78][i];
        const f = clamp01(lineFill[i] ?? 0);
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: 14, top: y, width: baseW, height: 3, background: GREY_LINE, opacity: 0.65}} />
            <div style={{position: 'absolute', left: 14, top: y, width: baseW * f, height: 3, background: lineColor}} />
          </React.Fragment>
        );
      })}
      {cursorRow >= 0 && cursorRow < 3 && cursorOp > 0.02 ? (
        <div
          style={{
            position: 'absolute',
            left: 14 + (w * [0.78, 0.66, 0.52][cursorRow] - 14) * clamp01(lineFill[cursorRow] ?? 0),
            top: h * [0.42, 0.6, 0.78][cursorRow] - 6,
            width: 2,
            height: 14,
            background: PURPLE_LIGHT,
            opacity: cursorOp,
            boxShadow: '0 0 8px rgba(161,117,241,.9)',
          }}
        />
      ) : null}
    </Box>
  );
};

/** 小号菜谱卡（SC22 底部扇形摊开用）：无标题，三条线 + 一枚紫角标 */
export const MiniRecipe: React.FC<{w?: number; h?: number; accent?: string; opacity?: number}> = ({w = 150, h = 110, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Box x={0} y={0} w={w} h={h} r={8} fill="#000" stroke={WHITE} sw={2} opacity={opacity}>
    <div style={{position: 'absolute', left: 12, top: 14, width: 34, height: 4, background: accent}} />
    {[0, 1, 2].map((i) => (
      <div key={i} style={{position: 'absolute', left: 12, top: 34 + i * 20, width: w * [0.74, 0.6, 0.46][i] - 12, height: 3, background: GREY_LINE}} />
    ))}
  </Box>
);

/**
 * 循环箭头：270° 圆弧 + 箭头，rot 由调用方按帧算。
 * 只做小配角，线宽 4。
 */
export const SpinIcon: React.FC<{cx: number; cy: number; size?: number; rot?: number; color?: string; opacity?: number}> = ({cx, cy, size = 26, rot = 0, color = PURPLE_LIGHT, opacity = 1}) => (
  <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity, transform: `rotate(${rot}deg)`}}>
    <svg width="100%" height="100%" viewBox="0 0 100 100" style={{overflow: 'visible'}}>
      <path d="M50 16A34 34 0 1 1 22 34" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />
      <path d="M50 16L41 8M50 16L57 26" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

/**
 * 四角取景框：p=0→1 时四条 L 从角尖长出；arms 为每条臂的长度。
 * 用 strokeDasharray 做 draw-on，不引入 filter。
 */
export const CornerBrackets: React.FC<{x: number; y: number; w: number; h: number; p?: number; color?: string; arms?: number; sw?: number; opacity?: number}> = ({
  x,
  y,
  w,
  h,
  p = 1,
  color = PURPLE_LIGHT,
  arms = 30,
  sw = 2.4,
  opacity = 1,
}) => {
  const len = arms * 2;
  const off = len * (1 - clamp01(p));
  const common = {fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, strokeDasharray: len, strokeDashoffset: off};
  return (
    <svg width={1280} height={720} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity}}>
      <path d={`M${x} ${y + arms}V${y}H${x + arms}`} {...common} />
      <path d={`M${x + w - arms} ${y}H${x + w}V${y + arms}`} {...common} />
      <path d={`M${x} ${y + h - arms}V${y + h}H${x + arms}`} {...common} />
      <path d={`M${x + w - arms} ${y + h}H${x + w}V${y + h - arms}`} {...common} />
    </svg>
  );
};

/** 小灰字（SC23 的「按需读取」）：左对齐、行高 1、不做光 */
export const GreyNote: React.FC<{x: number; y: number; size?: number; opacity?: number; children: React.ReactNode}> = ({x, y, size = 22, opacity = 1, children}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: FONT_HEAVY, fontSize: size, fontWeight: 500, color: GREY, letterSpacing: 1, lineHeight: 1, whiteSpace: 'nowrap', opacity}}>{children}</div>
);

/** 等宽小标签（SKILL.md 的 name / description 行） */
export const MonoLabel: React.FC<{x: number; y: number; size?: number; color?: string; opacity?: number; children: React.ReactNode}> = ({x, y, size = 19, color = GREY, opacity = 1, children}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: FONT_MONO, fontSize: size, fontWeight: 500, color, letterSpacing: 0.5, lineHeight: 1, whiteSpace: 'nowrap', opacity}}>{children}</div>
);

/** 卡片上的灰文本条（右端可由 fill 控制生长） */
export const TextBar: React.FC<{x: number; y: number; w: number; h?: number; color?: string; opacity?: number; fill?: number}> = ({x, y, w, h = 3, color = GREY_LINE, opacity = 1, fill = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w * clamp01(fill), height: h, background: color, opacity}} />
);
