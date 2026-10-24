import React from 'react';
import {Box, GLOW_PURPLE, GREY, GREY_LIGHT, GREY_LINE, GREY_MID, PURPLE_LIGHT, Svg, WHITE, abs, mixHex} from '../../ui';
import {FONT_HEAVY, clamp01} from '../../common';

/**
 * G9（SC39–SC43，第 5 章「标准接口」）共用小零件。
 * 与 icons.tsx 同一套约定：100×100 viewBox、黑填充 + 2.6–3px 描边、size 等比缩放。
 * 这里只放本组要用的东西：送料轨、规格框、标准插头、取景框角、五个外部服务图标、接入面板布局。
 * 厨房线稿与 KITCHEN 常量直接从 G1 的 parts 复用，不在这里复制。
 */

const S = (c: string, w = 2.6, fill = 'none') => ({
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

// ---- SC39：墙前的送料轨 ----
/**
 * 水平送料轨：上下两条轨线 + 中间一条送料芯线，按 p（0→1）从左往右长出；
 * 画的过程中前端带一根亮头，画完后由调用方在轨道上跑光点。
 * 坐标是世界坐标（放在 CameraRig 里）。
 */
export const FeedRail: React.FC<{x0: number; x1: number; y: number; p: number; opacity?: number}> = ({x0, x1, y, p, opacity = 1}) => {
  const L = x1 - x0;
  const h = clamp01(p);
  const head = x0 + L * h;
  const ticks: number[] = [];
  for (let x = x0 + 30; x < x1; x += 56) ticks.push(x);
  return (
    <Svg bloom={false} opacity={opacity}>
      <defs>
        {/* 唯一的裁切窗口：随 p 自左向右展开 */}
        <clipPath id="g9-rail-clip">
          <rect x={x0 - 2} y={y - 26} width={Math.max(0, L * h + 2)} height={52} />
        </clipPath>
      </defs>
      <g clipPath="url(#g9-rail-clip)">
        <path d={`M${x0} ${y - 9}H${x1}`} stroke={GREY_LINE} strokeWidth={2.2} />
        <path d={`M${x0} ${y + 9}H${x1}`} stroke={GREY_LINE} strokeWidth={2.2} />
        {ticks.map((x) => (
          <path key={x} d={`M${x} ${y - 15}V${y - 9}M${x} ${y + 9}V${y + 15}`} stroke={GREY_LINE} strokeWidth={1.6} opacity={0.85} />
        ))}
        <path d={`M${x0} ${y}H${x1}`} stroke={PURPLE_LIGHT} strokeWidth={2.4} opacity={0.55} />
      </g>
      {h > 0.01 && h < 0.995 ? (
        <>
          <rect x={head - 2.5} y={y - 17} width={5} height={34} fill={WHITE} opacity={0.95} />
          <circle cx={head} cy={y} r={7} fill={PURPLE_LIGHT} opacity={0.9} />
        </>
      ) : null}
    </Svg>
  );
};

// ---- SC40：虚线规格框 + 四角螺孔 ----
/**
 * 规格框：一圈虚线按 p 自左向右被「画」出来（裁切窗口），四角各一枚螺孔符号（cornerP 0→1 逐个出现）。
 * lit[i] 给某枚螺孔加紫色高光（四角高光按顺序点亮）。
 */
export const SpecFrame: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  p: number;
  cornerP?: number;
  lit?: number[];
}> = ({x, y, w, h, p, cornerP = 0, lit = [0, 0, 0, 0]}) => {
  const hh = clamp01(p);
  const corners: Array<[number, number]> = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
  return (
    <Svg bloom={false}>
      <defs>
        <clipPath id="g9-spec-clip">
          <rect x={x - 6} y={y - 6} width={Math.max(0, (w + 12) * hh)} height={h + 12} />
        </clipPath>
      </defs>
      <g clipPath="url(#g9-spec-clip)">
        <rect x={x} y={y} width={w} height={h} rx={6} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.2} strokeDasharray="16 11" opacity={0.85} />
      </g>
      {corners.map(([cx, cy], i) => {
        const n = clamp01((cornerP - i * 0.2) / 0.4);
        if (n <= 0) return null;
        const k = clamp01(lit[i] ?? 0);
        const c = mixHex(PURPLE_LIGHT, WHITE, k * 0.55);
        return (
          <g key={i} opacity={n}>
            <circle cx={cx} cy={cy} r={9} fill="#000" stroke={c} strokeWidth={2.2} />
            <path d={`M${cx - 4} ${cy}H${cx + 4}`} stroke={c} strokeWidth={1.8} transform={`rotate(${35 + 90 * i} ${cx} ${cy})`} />
            {k > 0.02 ? <circle cx={cx} cy={cy} r={15} fill="none" stroke={PURPLE_LIGHT} strokeWidth={1.6} opacity={k * 0.75} /> : null}
          </g>
        );
      })}
    </Svg>
  );
};

// ---- SC40 / SC41：标准插头 ----
/** 标准插头：圆角方身 + 两枚圆柱脚（朝左）+ 右侧线缆 + 中心螺钉。脚在 viewBox x=18..40，插到位时对准插座右缘。 */
export const PlugIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({
  cx,
  cy,
  size = 170,
  color = WHITE,
  accent = PURPLE_LIGHT,
  opacity = 1,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <rect x="40" y="26" width="46" height="48" rx="9" {...S(color, 3, '#000')} />
    <rect x="18" y="37" width="26" height="8" rx="4" {...S(color, 2.6, color)} />
    <rect x="18" y="55" width="26" height="8" rx="4" {...S(color, 2.6, color)} />
    <circle cx="63" cy="50" r="5.5" {...S(accent, 2.2, '#000')} />
    <path d="M86 50C93 50 93 64 100 64" {...S(color, 2.6)} />
    <path d="M46 34H80" {...S(accent, 1.8)} opacity={0.7} />
  </Frame>
);

// ---- SC42 / SC43：五个外部服务 ----
/** 文件夹（文件系统） */
export const FolderIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 54, color = GREY_MID, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M16 30H40L46 38H84V76H16Z" {...S(color, 3, '#000')} />
    <path d="M16 46H84" {...S(color, 2.2)} />
    <path d="M28 58H48" {...S(accent, 2.2)} />
  </Frame>
);

/** 数据库圆柱 */
export const DbIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 54, color = GREY_MID, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M22 28V72A28 10 0 0 0 78 72V28" {...S(color, 3, '#000')} />
    <ellipse cx="50" cy="28" rx="28" ry="10" {...S(color, 3, '#000')} />
    <path d="M22 46A28 10 0 0 0 78 46" {...S(color, 2)} />
    <path d="M22 60A28 10 0 0 0 78 60" {...S(color, 2)} opacity={0.75} />
    <path d="M40 28H60" {...S(accent, 2.2)} />
  </Frame>
);

/** 放大镜（搜索服务） */
export const SearchIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 54, color = GREY_MID, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <circle cx="43" cy="43" r="23" {...S(color, 3, '#000')} />
    <path d="M60 60L82 82" {...S(color, 4)} />
    <path d="M33 38C35 32 40 28 47 28" {...S(accent, 2.2)} />
  </Frame>
);

/** 楼宇（企业内部系统） */
export const BuildingIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 54, color = GREY_MID, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <rect x="24" y="18" width="52" height="68" rx="3" {...S(color, 3, '#000')} />
    <path d="M24 32H76M24 46H76M24 60H76" {...S(color, 1.8)} opacity={0.8} />
    <rect x="36" y="66" width="12" height="20" {...S(accent, 2, '#000')} />
    <rect x="56" y="66" width="10" height="12" {...S(color, 2, '#000')} />
  </Frame>
);

/** 应用宫格（第三方应用） */
export const AppGridIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 54, color = GREY_MID, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <rect x="18" y="18" width="28" height="28" rx="6" {...S(color, 2.8, '#000')} />
    <rect x="54" y="18" width="28" height="28" rx="6" {...S(color, 2.8, '#000')} />
    <rect x="18" y="54" width="28" height="28" rx="6" {...S(color, 2.8, '#000')} />
    <rect x="54" y="54" width="28" height="28" rx="6" {...S(accent, 2.8, '#000')} />
  </Frame>
);

// ---- SC42 / SC43 的接入面板布局（两镜共用，保证跨镜连续）----
export const NET = {
  sock: {cx: 258, cy: 396, size: 200},
  panel: {x: 612, y: 150, w: 510, h: 456},
  busX: 612,
  rowX: 676,
  rowW: 430,
  rowH: 76,
  rowY0: 186,
};
export const rowTop = (i: number) => NET.rowY0 + i * 84;
export const rowMid = (i: number) => rowTop(i) + NET.rowH / 2;

export type ServiceKind = 'fs' | 'db' | 'search' | 'enterprise' | 'thirdparty';

export const SERVICES: Array<{kind: ServiceKind; label: string; Icon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}>}> = [
  {kind: 'fs', label: '文件系统', Icon: FolderIcon},
  {kind: 'db', label: '数据库', Icon: DbIcon},
  {kind: 'search', label: '搜索服务', Icon: SearchIcon},
  {kind: 'enterprise', label: '企业内部系统', Icon: BuildingIcon},
  {kind: 'thirdparty', label: '第三方应用', Icon: AppGridIcon},
];

/**
 * 一行「外部服务」：左侧留出 64px 给汇流排的支线（x 612→676），行内是图标 + 名称。
 * k 0→1 灰→紫（当前项），dim 把「已接入但已不是当前」的行压暗一点。
 * dx 是入场时的横向偏移（自右滑入）。
 */
export const ServiceRow: React.FC<{i: number; k: number; dim?: number; op?: number; dx?: number; glowK?: number}> = ({i, k = 0, dim = 1, op = 1, dx = 0, glowK = 0}) => {
  const svc = SERVICES[i];
  const kk = clamp01(k) * dim;
  const stroke = mixHex(GREY_LINE, PURPLE_LIGHT, clamp01(k) * 0.9);
  const mid = rowMid(i);
  const lit = kk > 0.02;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, transform: `translateX(${dx.toFixed(2)}px)`}}>
      {glowK > 0.01 ? <div style={{...abs(NET.rowX - 10, rowTop(i) - 10, NET.rowW + 20, NET.rowH + 20), borderRadius: 18, boxShadow: GLOW_PURPLE, opacity: glowK}} /> : null}
      <Box x={NET.rowX} y={rowTop(i)} w={NET.rowW} h={NET.rowH} r={10} fill={lit ? 'rgba(30,16,62,0.55)' : 'rgba(0,0,0,0.5)'} stroke={stroke} sw={1.8} />
      <div style={{...abs(NET.rowX + 10, mid - 22, 4, 44 * kk), borderRadius: 2, background: PURPLE_LIGHT, opacity: 0.95}} />
      <svc.Icon cx={NET.rowX + 62} cy={mid} size={52} color={mixHex(GREY_MID, WHITE, kk)} accent={mixHex(GREY_MID, PURPLE_LIGHT, kk)} />
      <div
        style={{
          position: 'absolute',
          left: NET.rowX + 104,
          top: mid - 15,
          fontFamily: FONT_HEAVY,
          fontWeight: 600,
          fontSize: 27,
          lineHeight: 1,
          color: mixHex(GREY, WHITE, kk),
          whiteSpace: 'nowrap',
        }}
      >
        {svc.label}
      </div>
    </div>
  );
};

// ---- 连线的弧长取点（光点沿折线跑）----
export type Pt = [number, number];
/** 接入折线：插座右缘 → 汇流排 → 该行中高 → 行左缘 */
export const busPath = (i: number): Pt[] => [
  [NET.sock.cx + 76, NET.sock.cy],
  [NET.busX, NET.sock.cy],
  [NET.busX, rowMid(i)],
  [NET.rowX, rowMid(i)],
];
export const polyLen = (pts: Pt[]) => pts.reduce((acc, p, i) => (i === 0 ? 0 : acc + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1])), 0);
/** 按累计弧长取点，t∈[0,1] */
export const polyAt = (pts: Pt[], t: number): Pt => {
  const total = polyLen(pts);
  let d = clamp01(t) * total;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (d <= L || i === pts.length - 1) {
      const k = L > 0 ? Math.min(1, d / L) : 0;
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    }
    d -= L;
  }
  return pts[0];
};

/** 一节折线按 p 画出来（用于支线 draw-on）：返回 path 的 d */
export const pathD = (pts: Pt[]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]}`).join(' ');

/** 折线 draw-on：按弧长比例 p 把线画出来 */
export const Link: React.FC<{pts: Pt[]; p: number; color?: string; w?: number; opacity?: number}> = ({pts, p, color = PURPLE_LIGHT, w = 2.4, opacity = 1}) => {
  const L = Math.max(1, polyLen(pts));
  const k = clamp01(p);
  if (k <= 0) return null;
  return (
    <svg width={1280} height={720} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <path d={pathD(pts)} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={L * (1 - k)} opacity={opacity} />
    </svg>
  );
};

/** 在连线上跑的光点（自己带柔光，不占 GLOW_PURPLE） */
export const RunDot: React.FC<{x: number; y: number; opacity?: number; size?: number}> = ({x, y, opacity = 1, size = 9}) => (
  <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: size / 2, background: WHITE, boxShadow: '0 0 12px 4px rgba(102,45,248,.75)', opacity}} />
);

// ---- 取景框角（SC42「比如」）----
/** 四角 L 形括号，p 0→1 从角尖长出；用于把注意力先框到第一项上（还不是点亮）。 */
export const FocusBracket: React.FC<{x: number; y: number; w: number; h: number; p: number; color?: string; arms?: number; sw?: number; opacity?: number}> = ({
  x,
  y,
  w,
  h,
  p,
  color = GREY_LIGHT,
  arms = 18,
  sw = 2.2,
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

/** 扩散环（一次性落位脉冲）：p 0→1 时半径 r0→r1、透明度降到 0 */
export const RingPulse: React.FC<{cx: number; cy: number; p: number; r0?: number; r1?: number; color?: string; opacity?: number; sw?: number}> = ({
  cx,
  cy,
  p,
  r0 = 24,
  r1 = 60,
  color = PURPLE_LIGHT,
  opacity = 1,
  sw = 2.4,
}) => {
  const k = clamp01(p);
  if (k <= 0 || k >= 1) return null;
  return (
    <svg width={1280} height={720} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <circle cx={cx} cy={cy} r={r0 + (r1 - r0) * k} fill="none" stroke={color} strokeWidth={sw} opacity={opacity * (1 - k)} />
    </svg>
  );
};

