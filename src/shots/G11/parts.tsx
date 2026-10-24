import React from 'react';
import {GlowBlob} from '../../fx';
import {CText, Svg, GREY_LIGHT, GREY_LINE, GREY_MID, PURPLE, PURPLE_LIGHT, WHITE, abs, mixHex, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, easeInOutPow} from '../../common';
import {ChefIcon, CrateIcon} from '../../icons';
import {KITCHEN, KitchenLineArt} from '../G1/parts';

/**
 * G11（SC49–SC52，第 6 章「整箱采购」）共用小零件。
 * 约定与 icons.tsx 相同：100×100 viewBox、黑填充 + 2.6–3px 描边、size 等比缩放。
 * 本组新增：带绑带的木箱包（Package）、四角括号、四件小物里的插头、三枚能力图标（文件 / 放大镜 / 表格 / 柱状图 / 数据库）。
 * 厨房线稿与 KITCHEN 常量直接从 G1 的 parts 复用，不在这里复制。
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

// ---- 缓动 / 小工具 ----
/** 二次贝塞尔取点（物体从箱口沿弧线浮出） */
export const qPoint = (x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, t: number): [number, number] => {
  const k = clamp01(t);
  const u = 1 - k;
  return [u * u * x0 + 2 * u * k * cx + k * k * x1, u * u * y0 + 2 * u * k * cy + k * k * y1];
};
/** 一次性闪光包络：0 → 1（3 帧）→ 0（10 帧） */
export const flashK = (n: number) => (n < 0 ? 0 : n < 3 ? n / 3 : Math.max(0, 1 - (n - 3) / 10));
/** 快出幂缓动（浮出 / 弹出一类动作） */
export const easeOutK = (t: number, p = 2.6) => 1 - Math.pow(1 - clamp01(t), p);

// ---- 木箱 → 带绑带的包 ----
let packSeq = 0;
/**
 * 木箱包：CrateIcon 原样 + 两条竖绑带 + 一条横绑带 + 提手 + 蝴蝶结。
 * strapP：绑带从箱口向下裹上的进度（0–1）；handleP：提手 draw-on；knotP：蝴蝶结出现。
 * 画面里同一时刻只会有一只包，但 id 仍按实例自增，避免同帧冲突。
 */
export const Package: React.FC<{
  cx: number;
  cy: number;
  size: number;
  strapP?: number;
  handleP?: number;
  knotP?: number;
  color?: string;
  band?: string;
  opacity?: number;
}> = ({cx, cy, size, strapP = 1, handleP = 1, knotP = 1, color = WHITE, band = PURPLE, opacity = 1}) => {
  const idRef = React.useRef<string | undefined>(undefined);
  if (!idRef.current) idRef.current = `g11-pack-${packSeq++}`;
  const id = idRef.current;
  const vp = clamp01(strapP);
  const hp = clamp01(handleP);
  const kp = clamp01(knotP);
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <CrateIcon cx={cx} cy={cy} size={size} color={color} />
      <div style={{...abs(cx - size / 2, cy - size / 2, size, size)}}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <defs>
            <clipPath id={`${id}-v`}>
              <rect x="0" y="44" width="100" height={43 * vp} />
            </clipPath>
            <clipPath id={`${id}-h`}>
              <rect x="12" y="62" width={76 * vp} height="14" />
            </clipPath>
          </defs>

          {/* 提手：从箱沿升起的一道弧（draw-on） */}
          {hp > 0 ? (
            <path d="M24 44 Q50 -22 76 44" fill="none" stroke={WHITE} strokeWidth="3.2" strokeLinecap="round" strokeDasharray={86} strokeDashoffset={86 * (1 - hp)} />
          ) : null}

          {/* 两条竖绑带（自箱口向下裹） */}
          <g clipPath={`url(#${id}-v)`}>
            {[27, 65].map((x) => (
              <g key={x}>
                <rect x={x} y="44" width="8" height="43" fill={band} />
                <rect x={x + 3.1} y="44" width="1.6" height="43" fill={PURPLE_LIGHT} opacity="0.9" />
              </g>
            ))}
          </g>
          {/* 横绑带 */}
          <g clipPath={`url(#${id}-h)`}>
            <rect x="12" y="64" width="76" height="9" fill={band} />
            <rect x="12" y="67.6" width="76" height="1.5" fill={PURPLE_LIGHT} opacity="0.9" />
          </g>
          {/* 卡扣 */}
          {vp > 0.94 ? (
            <g opacity={clamp01((vp - 0.94) / 0.06)}>
              {[27, 65].map((x) => (
                <g key={x}>
                  <rect x={x - 0.5} y="64" width="9" height="9" fill="#000" stroke={WHITE} strokeWidth="1.6" />
                  <rect x={x + 2.1} y="66.6" width="3.8" height="3.8" fill={PURPLE_LIGHT} />
                </g>
              ))}
            </g>
          ) : null}
          {/* 蝴蝶结：两片环 + 结心 */}
          {kp > 0.02 ? (
            <g opacity={kp} transform={`translate(50 26) scale(${(0.8 + 0.2 * kp).toFixed(3)}) translate(-50 -26)`}>
              <ellipse cx="43" cy="25" rx="8.5" ry="4.6" transform="rotate(-24 43 25)" fill={band} stroke={WHITE} strokeWidth="1.6" />
              <ellipse cx="57" cy="25" rx="8.5" ry="4.6" transform="rotate(24 57 25)" fill={band} stroke={WHITE} strokeWidth="1.6" />
              <circle cx="50" cy="26" r="4.6" fill={band} stroke={WHITE} strokeWidth="1.6" />
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
};

// ---- 四角括号（「这整箱东西」/「一组能力」的取景） ----
export const Bracket: React.FC<{x: number; y: number; w: number; h: number; p: number; color?: string; sw?: number; arm?: number; opacity?: number}> = ({
  x,
  y,
  w,
  h,
  p,
  color = PURPLE_LIGHT,
  sw = 2.4,
  arm = 28,
  opacity = 1,
}) => {
  const k = clamp01(p);
  if (k <= 0 || opacity <= 0) return null;
  const a = arm * k;
  const x2 = x + w;
  const y2 = y + h;
  const d = [
    `M${x} ${y + a}V${y}H${x + a}`,
    `M${x2 - a} ${y}H${x2}V${y + a}`,
    `M${x2} ${y2 - a}V${y2}H${x2 - a}`,
    `M${x + a} ${y2}H${x}V${y2 - a}`,
  ].join(' ');
  return (
    <Svg bloom={false} opacity={opacity}>
      <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

// ---- 一次性紫环（落位 / 拿到能力） ----
export const PulseRing: React.FC<{cx: number; cy: number; p: number; r?: number; opacity?: number; color?: string}> = ({cx, cy, p, r = 26, opacity = 1, color = PURPLE_LIGHT}) => {
  if (p <= 0 || p >= 1) return null;
  const rr = r * (0.55 + 1.0 * clamp01(p));
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity}}>
      <circle cx={cx} cy={cy} r={rr} fill="none" stroke={color} strokeWidth={2.2} opacity={1 - clamp01(p)} style={{filter: 'drop-shadow(0 0 6px rgba(102,45,248,.85))'}} />
    </svg>
  );
};

// ---- 四件小物里的插头（配置） ----
export const PlugGlyph: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 100, color = WHITE, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <rect x="38" y="18" width="34" height="48" rx="8" {...S(color, 3, '#000')} />
    <rect x="18" y="30" width="20" height="9" rx="4" {...S(color, 2.4, color)} />
    <rect x="18" y="48" width="20" height="9" rx="4" {...S(color, 2.4, color)} />
    <circle cx="55" cy="41" r="5" {...S(accent, 2.2, '#000')} />
    <path d="M72 62C80 62 80 80 90 80" {...S(color, 2.6)} />
    <path d="M44 27H66" {...S(accent, 1.6)} opacity={0.7} />
  </Frame>
);

// ---- 三枚代码能力 + 三枚数据能力（同一套描边风格） ----
/** 文件读写：折角页 + 三行字 + 右下角一支小笔 */
export const FileAbilityIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 88, color = WHITE, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M26 12H58L72 26V82H26Z" {...S(color, 3, '#000')} />
    <path d="M58 12V26H72" {...S(color, 2.4)} />
    <path d="M36 38H62M36 48H62M36 58H52" {...S(color, 2.2)} />
    <path d="M66 76L82 60L88 66L72 82Z" {...S(accent, 2.4, '#000')} />
    <path d="M66 76L72 82" {...S(accent, 1.8)} />
  </Frame>
);

/** 代码检查：放大镜 + 镜片里的 < > */
export const MagnifierIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 88, color = WHITE, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <circle cx="42" cy="40" r="25" {...S(color, 3, '#000')} />
    <path d="M60 58L82 80" {...S(color, 6)} />
    <path d="M35 31L27 40L35 49" {...S(accent, 2.4)} />
    <path d="M49 31L57 40L49 49" {...S(accent, 2.4)} />
  </Frame>
);

/** 表格处理：表头 + 网格 */
export const TableIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 88, color = WHITE, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <rect x="16" y="22" width="68" height="58" rx="4" {...S(color, 3, '#000')} />
    <rect x="16" y="22" width="68" height="14" rx="4" {...S(color, 2.4, '#000')} />
    <path d="M24 29H52" {...S(accent, 2.6)} />
    <path d="M16 46H84M16 61H84M38 36V80M60 36V80" {...S(color, 2)} />
  </Frame>
);

/** 柱状图：坐标轴 + 三根柱子（中间一根紫） */
export const BarChartIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 88, color = WHITE, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M20 14V80H86" {...S(color, 3)} />
    <rect x="30" y="54" width="12" height="20" {...S(color, 2.4, '#000')} />
    <rect x="50" y="40" width="12" height="34" {...S(accent, 2.4, accent)} opacity={0.55} />
    <rect x="70" y="48" width="12" height="26" {...S(color, 2.4, '#000')} />
  </Frame>
);

/** 数据库查询：圆柱 */
export const DbCylinderIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 88, color = WHITE, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <ellipse cx="50" cy="24" rx="27" ry="9" {...S(color, 3, '#000')} />
    <path d="M23 24V74A27 9 0 0 0 77 74V24" {...S(color, 3, '#000')} />
    <path d="M23 42A27 9 0 0 0 77 42" {...S(color, 2.2)} />
    <path d="M23 58A27 9 0 0 0 77 58" {...S(color, 2.2)} />
    <circle cx="50" cy="24" r="4" fill={accent} />
  </Frame>
);

/** 图标下方的小标签（22–24px 灰字；当前项由调用方传白色） */
export const AbilityLabel: React.FC<{cx: number; cy: number; text: string; size?: number; color?: string; opacity?: number}> = ({cx, cy, text, size = 24, color = GREY_LIGHT, opacity = 1}) => (
  <CText cx={cx} cy={cy} size={size} weight={600} family={FONT_HEAVY} color={color} opacity={opacity} dy={-1}>
    {text}
  </CText>
);

// ---- 测试勾（SC51 的「运行测试」） ----
export const CheckBadgeIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 88, color = WHITE, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <circle cx="50" cy="50" r="34" {...S(color, 3, '#000')} />
    <path d="M33 51L45 63L68 37" {...S(accent, 5.4)} />
  </Frame>
);

// ---- 代码角标 / 数据角标（贴在包面上，表示这一包是什么插件） ----
export const CodeBadge: React.FC<{cx: number; cy: number; size?: number; opacity?: number}> = ({cx, cy, size = 44, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <circle cx="50" cy="50" r="46" fill={PURPLE_LIGHT} />
    <path d="M38 36L22 50L38 64" fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M62 36L78 50L62 64" fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M57 30L43 70" fill="none" stroke="#000" strokeWidth="4.6" strokeLinecap="round" />
  </Frame>
);

export const DataBadge: React.FC<{cx: number; cy: number; size?: number; opacity?: number}> = ({cx, cy, size = 44, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <circle cx="50" cy="50" r="46" fill={PURPLE_LIGHT} />
    <rect x="26" y="30" width="48" height="40" rx="4" fill="none" stroke="#000" strokeWidth="5" />
    <path d="M26 42H74M42 42V70M58 42V70" fill="none" stroke="#000" strokeWidth="4" />
  </Frame>
);

// ---- 厨房地图（SC51/SC52 共用）：G1 的线稿 + 厨师，整体缩放成左侧的一张「地图」 ----
export const MAP = {s: 0.64, tx: 0, ty: 90};
/** 世界坐标 → 屏幕坐标（只有厨房地图这一层缩放，其余元素仍用屏幕坐标） */
export const mapPt = (x: number, y: number) => [x * MAP.s + MAP.tx, y * MAP.s + MAP.ty] as [number, number];
/** 地图上的台面线、厨师（屏幕坐标） */
export const MAP_COUNTER_Y = KITCHEN.counterY * MAP.s + MAP.ty; // 390.8
export const MAP_CHEF = {cx: KITCHEN.chef.cx * MAP.s + MAP.tx, cy: KITCHEN.chef.cy * MAP.s + MAP.ty, size: KITCHEN.chef.size * MAP.s};

export const MapStage: React.FC<{N: number; opacity: number}> = ({N, opacity}) => (
  <div style={{position: 'absolute', inset: 0, transform: `translate(${MAP.tx}px, ${MAP.ty}px) scale(${MAP.s})`, transformOrigin: '0 0', opacity}}>
    <KitchenLineArt N={N} opacity={1} />
    <ChefIcon cx={KITCHEN.chef.cx} cy={KITCHEN.chef.cy} size={KITCHEN.chef.size} color={WHITE} accent={GREY_MID} opacity={0.9} />
  </div>
);

// ---- 右侧能力栏：一枚图标从包里弹出 → 沿弧线飞到行位 → 落位标签 + 分隔线 ----
export type FlyAbilityProps = {
  N: number;
  f: number; // 弹出帧
  from: [number, number]; // 包口
  to: [number, number]; // 行位（图标中心）
  ctrl: [number, number]; // 弧线控制点
  label: string;
  labelX: number;
  labelY: number;
  ruleX2: number;
  draw: (cx: number, cy: number, size: number, accent: string) => React.ReactNode;
};
const POP = 4;
const FLY = 14;
export const FlyAbility: React.FC<FlyAbilityProps> = ({N, f, from, to, ctrl, label, labelX, labelY, ruleX2, draw}) => {
  const n = N - f;
  if (n < 0) return null;
  const pop = easeOutK(n / POP, 2.2);
  const e = easeInOutPow(2.2)(clamp01((n - POP) / FLY));
  const [x, y] = qPoint(from[0], from[1], ctrl[0], ctrl[1], to[0], to[1], e);
  const landed = n >= POP + FLY;
  const size = 40 + 24 * pop; // 64
  // 紫色只在刚落地这一小段给当前行；之后转灰
  const accent = n < 52 ? PURPLE_LIGHT : GREY_MID;
  const dim = clamp01((n - 30 - 42) / 12);
  const labelColor = mixHex(WHITE, GREY_LIGHT, dim);
  return (
    <>
      {!landed ? <GlowBlob cx={x} cy={y} r={44} k={0.17 * pop} alpha={0.3} /> : null}
      <div style={{position: 'absolute', inset: 0, opacity: clamp01(0.12 + 1.4 * pop)}}>{draw(x, y, landed ? 64 : size, accent)}</div>
      {landed ? <PulseRing cx={to[0]} cy={to[1]} p={clamp01((n - POP - FLY) / 14)} r={36} opacity={0.8} /> : null}
      <div style={{position: 'absolute', left: labelX, top: labelY - 14, opacity: softOp(n - (POP + FLY + 2), 8), fontFamily: FONT_HEAVY, fontWeight: 700, fontSize: 27, lineHeight: 1, color: labelColor, whiteSpace: 'nowrap'}}>{label}</div>
      <div style={{position: 'absolute', left: labelX, top: labelY + 18, width: (ruleX2 - labelX) * clamp01((n - (POP + FLY + 2)) / 12), height: 1.2, background: GREY_LINE, opacity: 0.75}} />
    </>
  );
};
