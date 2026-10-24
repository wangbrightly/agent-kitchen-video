import React from 'react';
import {Box, GLOW_PURPLE, GREY, GREY_LIGHT, GREY_LINE, GREY_MID, PURPLE_LIGHT, Svg, WHITE, abs} from '../../ui';
import {FONT_HEAVY, clamp01} from '../../common';
import {KnifeIcon} from '../../icons';

/**
 * G10（SC44–SC48）共用小零件。
 * 与 icons.tsx / G9 parts 同一套约定：100×100 viewBox、黑填充 + 2.4–3px 描边、size 等比缩放。
 * 本组要的东西：
 *   · 器具（锅 / 勺 / 夹 / 铲）—— SC44 / SC45 的「手里的刀锅铲」
 *   · 菜谱卡 —— SC47 第二列
 *   · 异形插头 + 虚线空插头 —— SC46「没有统一的连接方式」
 *   · 带箱盖的木箱 —— SC48（icons.tsx 的 CrateIcon 没有可动的盖，这里补一只）
 *   · 配置墙（外壳 + 三列 + 表单行）—— SC47 生长 / SC48 坍缩，两镜共用同一套坐标
 *   · 旋转的空转虚线弧、右下角的迷你厨房线稿 —— SC46
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

// ---- 器具（除刀直接用 icons.tsx 的 KnifeIcon）----
export type ToolKind = 'knife' | 'pot' | 'spoon' | 'tongs' | 'spatula';

/** 锅：锅体 + 双耳 + 锅盖 + 蒸汽 */
export const PotIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({
  cx,
  cy,
  size = 120,
  color = WHITE,
  accent = PURPLE_LIGHT,
  opacity = 1,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M22 46H78L72 84H28Z" {...S(color, 3, '#000')} />
    <path d="M16 46H84" {...S(color, 3)} />
    <path d="M11 39V53M89 39V53" {...S(color, 2.6)} />
    <ellipse cx="50" cy="40" rx="29" ry="6" {...S(color, 2.6, '#000')} />
    <path d="M50 31V26" {...S(accent, 2.4)} />
    <path d="M35 62H65" {...S(accent, 2)} opacity={0.8} />
    <path d="M36 18C36 12 42 12 42 6M58 18C58 12 64 12 64 6" {...S(accent, 1.8)} opacity={0.85} />
  </Frame>
);

/** 勺：胖勺头 + 双线扁柄 —— 单线细柄加圆头会被读成放大镜，双线柄才像餐具 */
export const SpoonIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({
  cx,
  cy,
  size = 110,
  color = WHITE,
  accent = PURPLE_LIGHT,
  opacity = 1,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <ellipse cx="42" cy="62" rx="21" ry="26" {...S(color, 3, '#000')} />
    <path d="M54 41C59 31 61 21 60 11" {...S(color, 3)} />
    <path d="M63 43C68 32 70 22 68 12" {...S(color, 3)} />
    <path d="M60 11H68" {...S(color, 3)} />
    <path d="M31 58C35 51 41 48 47 50" {...S(accent, 2)} opacity={0.85} />
  </Frame>
);

/** 夹子：顶部 U 形弹簧 + 两条向外鼓的臂 + 内勾的尖头（张开一点，别收成一根胶囊） */
export const TongsIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({
  cx,
  cy,
  size = 110,
  color = WHITE,
  accent = PURPLE_LIGHT,
  opacity = 1,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M42 16C42 9 46 7 50 7C54 7 58 9 58 16" {...S(color, 3)} />
    <path d="M42 16C36 38 30 58 27 82" {...S(color, 3)} />
    <path d="M58 16C64 38 70 58 73 82" {...S(color, 3)} />
    <path d="M27 82C28 87 31 90 35 91M73 82C72 87 69 90 65 91" {...S(color, 2.8)} />
    <path d="M33 52H27M67 52H73" {...S(accent, 2)} opacity={0.85} />
  </Frame>
);

/** 铲：带槽的平板 + 长柄 */
export const SpatulaIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({
  cx,
  cy,
  size = 110,
  color = WHITE,
  accent = PURPLE_LIGHT,
  opacity = 1,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <rect x="32" y="14" width="36" height="32" rx="4" {...S(color, 3, '#000')} />
    <path d="M41 21V39M50 21V39M59 21V39" {...S(accent, 1.8)} opacity={0.9} />
    <path d="M50 46V86" {...S(color, 3.4)} />
    <path d="M43 86H57" {...S(color, 2.6)} />
  </Frame>
);

/** 器具统一入口：knife 走 icons.tsx，其余本文件 */
export const ToolIcon: React.FC<{kind: ToolKind; cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({
  kind,
  cx,
  cy,
  size = 110,
  color = WHITE,
  accent = PURPLE_LIGHT,
  opacity = 1,
}) => {
  if (kind === 'knife') return <KnifeIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  if (kind === 'pot') return <PotIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  if (kind === 'spoon') return <SpoonIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  if (kind === 'tongs') return <TongsIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  return <SpatulaIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
};

/** 菜谱卡：卡片 + 顶部色标 + 三行字 + 右下角小勾 */
export const RecipeCardIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({
  cx,
  cy,
  size = 110,
  color = WHITE,
  accent = PURPLE_LIGHT,
  opacity = 1,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <rect x="25" y="12" width="50" height="76" rx="4" {...S(color, 3, '#000')} />
    <rect x="33" y="6" width="34" height="10" rx="3" {...S(accent, 2.2, '#000')} />
    <path d="M35 32H65M35 44H65M35 56H55" {...S(color, 2)} />
    <path d="M35 72H44" {...S(accent, 2)} />
    <path d="M56 70 60 74 68 64" {...S(accent, 2)} />
  </Frame>
);

// ---- SC46：虚线空插头 ----
/** 与 G9 的 PlugIcon 同几何，但整只画成虚线（表示「空插头」） */
export const PlugOutline: React.FC<{cx: number; cy: number; size?: number; color?: string; opacity?: number}> = ({cx, cy, size = 180, color = GREY_LIGHT, opacity = 1}) => {
  const D = (c: string, w = 2.6, fill = 'none') => ({stroke: c, strokeWidth: w, fill, strokeDasharray: '6 6', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const});
  return (
    <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
      <rect x="40" y="26" width="46" height="48" rx="9" {...D(color)} />
      <rect x="18" y="37" width="26" height="8" rx="4" {...D(color)} />
      <rect x="18" y="55" width="26" height="8" rx="4" {...D(color)} />
      <circle cx="63" cy="50" r="5.5" {...D(color, 2.2)} />
      <path d="M86 50C93 50 93 64 100 64" {...D(color)} />
    </Frame>
  );
};

// ---- SC46：四种形状不对的插头 ----
export type PlugShape = 'round' | 'square' | 'wide' | 'angled';
/** 异形插头：脚朝左（和标准插头同向），但身体形状/脚位都不同 —— 插不进统一的插座 */
export const OddPlug: React.FC<{shape: PlugShape; cx: number; cy: number; size?: number; color?: string; opacity?: number}> = ({
  shape,
  cx,
  cy,
  size = 110,
  color = GREY_LIGHT,
  opacity = 1,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    {shape === 'round' ? (
      <>
        <circle cx="64" cy="50" r="24" {...S(color, 3, '#000')} />
        <rect x="24" y="38" width="22" height="8" rx="4" {...S(color, 2.4, color)} />
        <rect x="24" y="54" width="22" height="8" rx="4" {...S(color, 2.4, color)} />
        <circle cx="66" cy="50" r="6" {...S(color, 2)} />
      </>
    ) : null}
    {shape === 'square' ? (
      <>
        <rect x="42" y="26" width="44" height="48" rx="2" {...S(color, 3, '#000')} />
        <rect x="18" y="34" width="26" height="10" {...S(color, 2.4, color)} />
        <rect x="18" y="56" width="26" height="10" {...S(color, 2.4, color)} />
        <path d="M68 38H76M68 50H76" {...S(color, 2)} />
      </>
    ) : null}
    {shape === 'wide' ? (
      <>
        <rect x="42" y="16" width="46" height="68" rx="6" {...S(color, 3, '#000')} />
        <rect x="18" y="26" width="26" height="8" rx="3" {...S(color, 2.4, color)} />
        <rect x="18" y="46" width="26" height="8" rx="3" {...S(color, 2.4, color)} />
        <rect x="18" y="66" width="26" height="8" rx="3" {...S(color, 2.4, color)} />
      </>
    ) : null}
    {shape === 'angled' ? (
      <>
        <path d="M44 24H84L90 50 82 78H46L34 52Z" {...S(color, 3, '#000')} />
        <rect x="18" y="36" width="24" height="8" rx="3" {...S(color, 2.4, color)} transform="rotate(-12 30 40)" />
        <rect x="20" y="58" width="24" height="8" rx="3" {...S(color, 2.4, color)} transform="rotate(12 32 62)" />
        <path d="M62 44 72 58" {...S(color, 2)} />
      </>
    ) : null}
  </Frame>
);

/** 红叉（draw-on，两笔先后画出）。返回 <g>，必须在 <Svg> 里用。 */
export const StrikeX: React.FC<{cx: number; cy: number; size: number; p: number; color?: string; sw?: number}> = ({cx, cy, size, p, color = '#EC081F', sw = 6}) => {
  const r = size / 2;
  const d = size * Math.SQRT2;
  const p1 = clamp01(p / 0.6);
  const p2 = clamp01((p - 0.3) / 0.7);
  return (
    <g stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none">
      <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} strokeDasharray={d} strokeDashoffset={d * (1 - p1)} />
      <line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} strokeDasharray={d} strokeDashoffset={d * (1 - p2)} />
    </g>
  );
};

// ---- SC46：三枚空转虚线弧 ----
/** 三枚 70° 虚线弧绕 (cx,cy) 匀速旋转；period 帧转一圈 */
export const IdleArcs: React.FC<{cx: number; cy: number; r?: number; n: number; period?: number; color?: string; opacity?: number}> = ({
  cx,
  cy,
  r = 64,
  n,
  period = 40,
  color = GREY_LIGHT,
  opacity = 1,
}) => {
  if (n < 0) return null;
  const rot = ((n % period) / period) * 360;
  const arcs = [0, 120, 240].map((a) => {
    const a0 = ((a + rot) * Math.PI) / 180;
    const a1 = ((a + 66 + rot) * Math.PI) / 180;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  });
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity}}>
      {arcs.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={2.6} strokeDasharray="7 9" strokeLinecap="round" opacity={0.9} />
      ))}
      <circle cx={cx} cy={cy} r={2.6} fill={color} opacity={0.8} />
    </svg>
  );
};

// ---- SC46：右下角的迷你厨房线稿（被反复拆改）----
/** 一块 260×200 的厨房立面小稿：墙带 + 挂锅 + 冰箱 + 台面 + 灶眼 + 木箱；shake 时整块抖，两块板被撬开 */
export const KitchenMini: React.FC<{x: number; y: number; w?: number; h?: number; opacity?: number; shake?: number}> = ({
  x,
  y,
  w = 260,
  h = 200,
  opacity = 1,
  shake = 0,
}) => {
  const sx = Math.sin(shake * Math.PI * 2) * 5;
  const sy = Math.cos(shake * Math.PI * 3) * 3;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity, transform: `translate(${sx.toFixed(2)}px, ${sy.toFixed(2)}px)`}}>
      <svg width={w} height={h} viewBox="0 0 100 74" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {/* 墙带 + 瓷砖格 */}
        <rect x="18" y="4" width="70" height="30" fill="none" stroke={GREY_LINE} strokeWidth={1.6} />
        <path d="M18 14H88M18 24H88M36 4V34M54 4V34M72 4V34" fill="none" stroke={GREY_LINE} strokeWidth={0.9} opacity={0.55} />
        {/* 墙上挂的一口锅 */}
        <path d="M25 16H37L35 24H27Z" fill="none" stroke={GREY_LIGHT} strokeWidth={1.6} />
        <path d="M31 16V11M25 17H37" fill="none" stroke={GREY_LIGHT} strokeWidth={1.4} />
        {/* 冰箱 */}
        <rect x="2" y="8" width="12" height="42" fill="none" stroke={GREY_LIGHT} strokeWidth={1.8} />
        <path d="M2 26H14M10 14V21" fill="none" stroke={GREY_LIGHT} strokeWidth={1.3} />
        {/* 台面 + 前沿 */}
        <path d="M0 50H100" fill="none" stroke={GREY_LIGHT} strokeWidth={1.8} />
        <path d="M3 57H97" fill="none" stroke={GREY_LINE} strokeWidth={1.1} strokeDasharray="5 4" />
        {/* 灶台 + 两个灶眼 */}
        <rect x="28" y="42" width="22" height="8" rx="1.4" fill="none" stroke={GREY_LIGHT} strokeWidth={1.5} />
        <circle cx="34" cy="46" r="2.4" fill="none" stroke={GREY_LIGHT} strokeWidth={1.3} />
        <circle cx="44" cy="46" r="2.4" fill="none" stroke={GREY_LIGHT} strokeWidth={1.3} />
        {/* 木箱 */}
        <rect x="76" y="40" width="18" height="16" fill="none" stroke={GREY_LIGHT} strokeWidth={1.6} />
        <path d="M76 40 71 33H89L94 40" fill="none" stroke={GREY_LIGHT} strokeWidth={1.4} />
        <path d="M82 40V56M88 40V56" fill="none" stroke={GREY_LINE} strokeWidth={1} opacity={0.7} />
        {/* 两块正在被撬下来的板（跟着抖动错位） */}
        <path d={`M${41 + sx * 0.7} ${35 + sy * 0.6}H${58 + sx * 0.7}`} fill="none" stroke={GREY} strokeWidth={2.2} />
        <path d={`M${63 - sx * 0.6} ${29 - sy * 0.5}H${75 - sx * 0.6}`} fill="none" stroke={GREY} strokeWidth={2.2} />
        {/* 拆改标线 */}
        <path d="M20 62V68M20 62H31M20 68H31" fill="none" stroke={GREY} strokeWidth={1.2} />
      </svg>
    </div>
  );
};

// ---- SC48：木箱（箱盖 / 箱体分开画，刀要从两者之间升出来）----
/**
 * 箱盖：绕左上角 (16,46) 掀起，open 0→1 转 −96°（翻过竖直、斜靠在箱子左侧，像敞开的箱盖）。
 * 掀开后落在箱体左外侧，不会挡住从箱口升起来的刀 —— 所以使用时画在箱体之前，被箱体挡住根部。
 */
export const CrateLid: React.FC<{cx: number; cy: number; size?: number; open?: number; color?: string; accent?: string; opacity?: number}> = ({
  cx,
  cy,
  size = 280,
  open = 0,
  color = WHITE,
  accent = PURPLE_LIGHT,
  opacity = 1,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <g transform={`rotate(${(-96 * open).toFixed(2)} 16 46)`}>
      <rect x="16" y="30" width="68" height="16" rx="2" {...S(color, 3, '#000')} />
      <path d="M16 38H84" {...S(color, 1.8)} opacity={0.4} />
      {/* 铰链：只在靠轴的一端画两枚紫短条，免得整块读成梯子 */}
      <path d="M23 38V46M32 38V46" {...S(accent, 2.2)} opacity={0.85} />
    </g>
  </Frame>
);

/**
 * 箱体：外框 + 两侧竖板 + 底板 + 一道木纹，中间留空 —— 箱里的东西画在它之后（在前）。
 * 口沿在 open>0 时亮起一条紫线，表示「箱子打开了」。
 */
export const CrateBox: React.FC<{cx: number; cy: number; size?: number; open?: number; color?: string; accent?: string; opacity?: number; showLid?: boolean}> = ({
  cx,
  cy,
  size = 280,
  open = 0,
  color = WHITE,
  accent = PURPLE_LIGHT,
  opacity = 1,
  showLid = true,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    {showLid ? (
      <g transform={`rotate(${(-96 * open).toFixed(2)} 16 46)`}>
        <rect x="16" y="30" width="68" height="16" rx="2" {...S(color, 3, '#000')} />
        <path d="M16 38H84" {...S(color, 1.8)} opacity={0.4} />
        <path d="M31 38V46M50 38V46M69 38V46" {...S(accent, 2)} opacity={0.8} />
      </g>
    ) : null}
    <path d="M16 46H84V92H16Z" {...S(color, 3, '#000')} />
    {/* 两侧竖板 / 底板 / 一道木纹：把「窗格」读成木箱的框 */}
    <rect x="16" y="46" width="6" height="46" fill={color} opacity={0.1} />
    <rect x="78" y="46" width="6" height="46" fill={color} opacity={0.1} />
    <rect x="16" y="86" width="68" height="6" fill={color} opacity={0.1} />
    <path d="M16 86H84" {...S(color, 2)} opacity={0.4} />
    <path d="M16 67H84" {...S(color, 1.4)} opacity={0.18} />
    {/* 口沿：开了才亮 */}
    <path d="M20 46H80" {...S(accent, 2.6)} opacity={0.85 * open} />
  </Frame>
);

// ---- 配置墙（SC47 生长 / SC48 坍缩共用）----
/**
 * 墙面坐标：外框 (120,175) 760×435；三列各 240 宽，列左 120 / 380 / 640。
 * 标题条 y≈199；列头 y 242–302；表单行从 y 318 起，6 行 × (40 高 + 6 间隙) 到 588。
 */
export const WALL = {
  x: 120,
  y: 175,
  w: 760,
  h: 435,
  cols: [120, 380, 640],
  colW: 240,
  bayY: 228,
  bayH: 370,
  headY: 242,
  headH: 62,
  rowY0: 318,
  rowH: 40,
  rowGap: 6,
};
export const rowY = (i: number) => WALL.rowY0 + i * (WALL.rowH + WALL.rowGap);

export type WallKind = 'knife' | 'recipe' | 'plug';

/** 墙外壳：外框 + 标题条 + 一道细横线；p 自左向右揭开（20–24 帧） */
export const WallShell: React.FC<{p: number; opacity?: number; sink?: number; glowK?: number}> = ({p, opacity = 1, sink = 0, glowK = 0}) => {
  const k = clamp01(p);
  return (
    <div style={{position: 'absolute', inset: 0, opacity, transform: `translateY(${sink.toFixed(2)}px)`}}>
      {glowK > 0.01 ? (
        <div style={{...abs(WALL.x - 6, WALL.y - 6, WALL.w + 12, WALL.h + 12), borderRadius: 14, boxShadow: GLOW_PURPLE, opacity: glowK}} />
      ) : null}
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${((1 - k) * 100).toFixed(2)}% 0 0)`}}>
        <Box x={WALL.x} y={WALL.y} w={WALL.w} h={WALL.h} r={10} fill="rgba(0,0,0,0.38)" stroke={GREY_MID} sw={1.6} />
      </div>
      <div style={{position: 'absolute', left: WALL.x + 26, top: WALL.y + 13, fontFamily: FONT_HEAVY, fontWeight: 600, fontSize: 23, letterSpacing: 3, color: GREY, opacity: clamp01((k - 0.2) / 0.6), whiteSpace: 'nowrap'}}>配置清单</div>
      <div style={{position: 'absolute', left: WALL.x + 132, top: WALL.y + 42, width: (WALL.w - 158) * k, height: 1.2, background: GREY_LINE, opacity: 0.55}} />
    </div>
  );
};

/** 列头图标 + 标签（左对齐，图标 54）*/
const ColHeader: React.FC<{i: number; kind: WallKind; k: number}> = ({i, kind, k}) => {
  const x = WALL.cols[i];
  const cy = WALL.headY + WALL.headH / 2;
  const label = kind === 'knife' ? '一把刀' : kind === 'recipe' ? '一张菜谱' : '外部服务';
  return (
    <div style={{position: 'absolute', inset: 0, opacity: k, transform: `translateY(${((1 - k) * -10).toFixed(2)}px)`}}>
      <Box x={x + 10} y={WALL.headY} w={220} h={WALL.headH} r={7} fill="rgba(0,0,0,0.5)" stroke={GREY_LINE} sw={1.4} />
      {kind === 'plug' ? (
        <div style={{position: 'absolute', left: x + 14, top: cy - 27, width: 54, height: 54}}>
          <svg width="54" height="54" viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <rect x="12" y="20" width="76" height="48" rx="5" stroke={GREY_LIGHT} strokeWidth={6} fill="#000" />
            {[26, 44, 62].map((hx) => (
              <circle key={hx} cx={hx} cy="44" r="7" fill="none" stroke={GREY_LIGHT} strokeWidth={5} />
            ))}
            <rect x="14" y="74" width="72" height="6" rx="3" fill={GREY_LIGHT} />
            <path d="M50 80V88" stroke={GREY_LIGHT} strokeWidth={5} />
          </svg>
        </div>
      ) : kind === 'knife' ? (
        <KnifeIcon cx={x + 41} cy={cy} size={54} color={GREY_LIGHT} accent={GREY_MID} />
      ) : (
        <RecipeCardIcon cx={x + 41} cy={cy} size={54} color={GREY_LIGHT} accent={GREY_MID} />
      )}
      <div style={{position: 'absolute', left: x + 78, top: cy - 15, fontFamily: FONT_HEAVY, fontWeight: 600, fontSize: 26, lineHeight: 1, color: GREY_LIGHT, whiteSpace: 'nowrap'}}>{label}</div>
    </div>
  );
};

/** 一行「要填的表单」：左侧勾选格 + 标签条 + 输入线 + 右侧小方块 */
const FormRow: React.FC<{i: number; j: number; k: number}> = ({i, j, k}) => {
  const x = WALL.cols[i];
  const y = rowY(j);
  const e = clamp01(k);
  if (e <= 0.001) return null;
  const lw = 62 + ((i * 3 + j * 7) % 26);
  return (
    <div style={{position: 'absolute', left: x + 12, top: y, width: 216, height: WALL.rowH, opacity: e, transform: `translateY(${((1 - e) * -14).toFixed(2)}px)`}}>
      <Box x={0} y={0} w={216} h={WALL.rowH} r={5} fill="rgba(0,0,0,0.45)" stroke={GREY_LINE} sw={1.1} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 3, height: WALL.rowH, background: GREY_MID, opacity: 0.9}} />
      <div style={{position: 'absolute', left: 12, top: 14, width: 12, height: 12, boxSizing: 'border-box', border: `1.4px solid ${GREY_MID}`}} />
      {/* 标签条（比输入线早 2 帧出现 —— 「2 帧错峰」） */}
      <div style={{position: 'absolute', left: 34, top: 17, width: lw, height: 5, borderRadius: 2, background: GREY_MID, opacity: clamp01((k - 0.12) / 0.6) * 0.85}} />
      <div style={{position: 'absolute', left: 108, top: 18, width: 66 + ((i * 5 + j * 9) % 22), height: 4, borderRadius: 2, background: GREY_LINE, opacity: 0.9}} />
      <div style={{position: 'absolute', left: 194, top: 14, width: 11, height: 11, boxSizing: 'border-box', border: `1.2px dashed ${GREY_LINE}`}} />
    </div>
  );
};

/**
 * 一列：虚线列框 + 列头（含「能力」占位 → 具体物件）+ 6 行表单。
 * bayP 画列框；placeholderK 是 SC47 第一列在 11550 的「能力」空槽；headerK 是具体物件列头。
 */
export const ConfigColumn: React.FC<{
  i: number;
  kind: WallKind;
  bayP: number;
  headerK: number;
  placeholderK?: number;
  rowK: number[];
  opacity?: number;
}> = ({i, kind, bayP, headerK, placeholderK = 0, rowK, opacity = 1}) => {
  const x = WALL.cols[i];
  const b = clamp01(bayP);
  const headCy = WALL.headY + WALL.headH / 2;
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${((1 - b) * 100).toFixed(2)}% 0 0)`}}>
        <Box x={x + 6} y={WALL.bayY} w={WALL.colW - 12} h={WALL.bayH} r={8} fill="none" stroke={GREY_LINE} sw={1.2} dashed />
      </div>
      {/* 「能力」空槽（SC47 第一列，11550 起） */}
      {placeholderK > 0.001 && headerK < 0.999 ? (
        <div style={{position: 'absolute', inset: 0, opacity: placeholderK * (1 - headerK)}}>
          <Box x={x + 10} y={WALL.headY} w={220} h={WALL.headH} r={7} fill="rgba(0,0,0,0.3)" stroke={GREY_MID} sw={1.6} />
          <div style={{position: 'absolute', left: x + 10, top: headCy - 15, width: 220, textAlign: 'center', fontFamily: FONT_HEAVY, fontWeight: 600, fontSize: 26, lineHeight: 1, color: GREY, whiteSpace: 'nowrap'}}>能力</div>
        </div>
      ) : null}
      {headerK > 0.001 ? <ColHeader i={i} kind={kind} k={headerK} /> : null}
      {rowK.map((k, j) => (
        <FormRow key={j} i={i} j={j} k={k} />
      ))}
    </div>
  );
};
