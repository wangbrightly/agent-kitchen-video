import React from 'react';
import {GlowBlob} from '../../fx';
import {AlarmIcon, BellIcon, BrainIcon, CardBoxIcon, ChefIcon, CrateIcon, KnifeIcon, SheetIcon, SocketIcon} from '../../icons';
import {CText, GREY_LIGHT, GREY_MID, PURPLE_LIGHT, Pill, Svg, WHITE, mixHex, scaleIn, slideUp, softOp} from '../../ui';
import {FONT_HEAVY, FONT_WIDE, clamp01} from '../../common';
import {KitchenLineArt, StickyNoteIcon} from '../G1/parts';

/**
 * G12（SC53–SC57，第 7 章：把所有东西放回厨房）共用图元。
 *
 * 这一组的画面语言是「一张解剖图」：整张厨房线稿先由灰转白，再把第 1–6 章的
 * 十个概念一件件放回原位，每件配一条引线 + 一枚小标签。所以这里只需要四类东西：
 *   1) 白描边地图（双层交叉淡入，几何与 G1 像素级一致）；
 *   2) 引线（折线 draw-on + 一枚沿弧长匀速跑的光点）；
 *   3) 标签（白字 + 极细呼吸下划线；当前项为紫）；
 *   4) 十个「物件」（图标 + 聚光虚线圈 + 柔光），颜色全部由「点亮进度 lit / 当前进度 cur」推。
 *
 * 坐标系一律用世界坐标（与分镜表「全片空间基准」逐数一致），由 CameraRig 负责推近。
 * 不修改 G1 的线稿：白色版本用 CSS filter brightness(0) invert(1) 复制一份，两层交叉淡入。
 */

// ---------------------------------------------------------------- 世界布局
/** 十个物件 + 厨师的世界坐标（尺寸取图标 size，位置取空间基准给的中心） */
export const G12 = {
  chef: {x: 700, y: 355, size: 210},
  brain: {x: 700, y: 205, size: 86},
  ringTop: {cx: 700, cy: 205, r: 52},
  ringFeet: {cx: 700, cy: 452, rx: 76, ry: 16},
  badge: {x: 700, y: 352, size: 70},
  knife: {x: 714, y: 398, size: 180, rot: 20},
  cardbox: {x: 385, y: 409, size: 170},
  note: {x: 140, y: 425, size: 210},
  bell: {x: 930, y: 414, size: 176},
  alarm: {x: 1065, y: 292, size: 180},
  socket: {x: 360, y: 292, size: 170},
  crate: {x: 1115, y: 554, size: 178},
  pill: {x: 700, y: 500, w: 120, h: 40},
};

/** 节拍帧（全部等于字幕块起始帧；见 BUILD_NOTES「时间轴对账」） */
export const AT = {
  chef: 13109,
  brain: 13170,
  agentTag: 13109,
  llm: 13192,
  badge: 13282,
  prompt: 13325,
  knife: 13379,
  tool: 13419,
  cardbox: 13449,
  skill: 13495,
  note: 13569,
  memory: 13602,
  bell: 13645,
  command: 13668,
  alarm: 13716,
  hook: 13766,
  socket: 13837,
  mcp: 13871,
  crate: 13919,
  plugin: 13950,
  dim: 14028,
};

/** 当前项进度：本项点亮 → 下一件点亮时用 12 帧让位 */
export const curK = (N: number, f: number, next: number) => clamp01((N - f) / 10) * (1 - clamp01((N - next) / 12));

/** SC56 末拍：九枚标签 14 帧同步变灰（只留白描边） */
export const dimK = (N: number) => clamp01((N - AT.dim) / 14);

// ---------------------------------------------------------------- 颜色
const GREY_RGB = [0x74, 0x74, 0x74];
const WHITE_RGB = [255, 255, 255];
const PURPLE_RGB = [0xa1, 0x75, 0xf1];
const rgbCss = (v: number[]) => `rgb(${v.map((x) => Math.round(x)).join(',')})`;

/** 灰 → 白（点亮） */
export const litGrey = (lit: number) => {
  const t = clamp01(lit);
  return rgbCss(GREY_RGB.map((g, i) => g + (WHITE_RGB[i] - g) * t));
};
/** 灰 → 白（点亮）→ 紫（当前）。分开算，避开 mixHex 嵌套返回 rgb() 解析成 NaN 的老坑 */
export const accentMix = (lit: number, cur: number) => {
  const t1 = clamp01(lit);
  const t2 = clamp01(cur);
  return rgbCss(
    WHITE_RGB.map((w, i) => {
      const base = GREY_RGB[i] + (w - GREY_RGB[i]) * t1;
      return base + (PURPLE_RGB[i] - base) * t2;
    }),
  );
};

/** 一件物件的入场 / 点亮状态 */
export const itemState = (N: number, f: number, cur: number, dim: number) => {
  const t = N - f;
  const si = scaleIn(t, 18);
  const lit = clamp01(t / 11);
  const c = clamp01(cur) * (1 - clamp01(dim));
  return {
    t,
    op: t < 0 ? 0 : clamp01(0.15 + 1.4 * si),
    scale: 1.05 - 0.05 * si,
    lit,
    cur: c,
    stroke: litGrey(lit),
    accent: accentMix(lit, c),
  };
};

// ---------------------------------------------------------------- 地图
/** 末 8 帧淡出（比 ui.exitOp 的 1.5 次幂更缓地起步）：
 *  SC55 的尾段是整张亮白地图，1.5 次幂在第 2 帧就掉到 0.875，被 motion_check
 *  判成「大面积变化」而不是离场；2 次幂既保住 8 帧淡出，又让起步更顺。 */
export const exitOpEase = (N: number, to: number, len = 8) => {
  const n = N - (to - len);
  return n <= 0 ? 1 : Math.max(0, 1 - Math.pow(n / len, 2));
};
/**
 * 灰 → 白 的厨房线稿。两层同源：
 *  - 灰层：G1 原色 opacity 0.5（与 G1/G6/G9 的「回到地图」一致）；
 *  - 白层：整层 CSS filter brightness(0) invert(1)，几何与灰层逐像素相同。
 * whiteK 0→1 交叉淡入。木箱线稿用 clip-path 挖洞让位给 CrateIcon
 * （不能铺黑块：背景是星空+雾的渐变，黑块会露出一个方块）。
 */
const CRATE_HOLE =
  'polygon(evenodd, 0px 0px, 1280px 0px, 1280px 720px, 0px 720px, 0px 0px, ' +
  '1034px 502px, 1034px 628px, 1186px 628px, 1186px 502px, 1034px 502px)';

export const KitchenMap: React.FC<{N: number; whiteK: number; opacity?: number}> = ({N, whiteK, opacity = 1}) => {
  const w = clamp01(whiteK);
  return (
    <>
      {w < 0.999 && (
        <div style={{position: 'absolute', inset: 0, opacity: 0.5 * opacity * (1 - w), clipPath: CRATE_HOLE}}>
          <KitchenLineArt N={N} opacity={1} />
        </div>
      )}
      {w > 0.001 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.9 * opacity * w,
            filter: 'brightness(0) invert(1) drop-shadow(0 0 2px rgba(255,255,255,.3))',
            clipPath: CRATE_HOLE,
          }}
        >
          <KitchenLineArt N={N} opacity={1} />
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- 引线
export type Pt = [number, number];

export const polyLen = (pts: Pt[]) => {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return s;
};

/** 按弧长取点（t 0→1），折线拐角处也匀速 */
export const alongPts = (pts: Pt[], t: number): Pt => {
  const total = polyLen(pts);
  let d = (((t % 1) + 1) % 1) * total;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (d <= L || i === pts.length - 1) {
      const k = L > 0 ? d / L : 0;
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    }
    d -= L;
  }
  return pts[0];
};

/** 折线引线：draw-on + 两端小圆点 + 可选沿弧长跑的光点（光晕用两层半透明圆，不用 SVG filter） */
export const Leader: React.FC<{
  pts: Pt[];
  p: number;
  color?: string;
  opacity?: number;
  sw?: number;
  dotT?: number | null;
  dotColor?: string;
  dotR?: number;
}> = ({pts, p, color = WHITE, opacity = 0.6, sw = 1.4, dotT = null, dotColor = PURPLE_LIGHT, dotR = 3.2}) => {
  const q = clamp01(p);
  const L = polyLen(pts);
  const last = pts[pts.length - 1];
  const dot = dotT == null ? null : alongPts(pts, dotT);
  return (
    <Svg bloom={false} opacity={opacity}>
      <polyline
        points={pts.map((v) => v.join(',')).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={L}
        strokeDashoffset={L * (1 - q)}
      />
      {q > 0.03 && <circle cx={pts[0][0]} cy={pts[0][1]} r={2.3} fill={color} opacity={0.7} />}
      {q > 0.97 && <circle cx={last[0]} cy={last[1]} r={2.6} fill={color} opacity={0.85} />}
      {dot && q > 0.6 && (
        <>
          <circle cx={dot[0]} cy={dot[1]} r={dotR + 5} fill={dotColor} opacity={0.16} />
          <circle cx={dot[0]} cy={dot[1]} r={dotR} fill={dotColor} opacity={0.95} />
        </>
      )}
    </Svg>
  );
};

// ---------------------------------------------------------------- 聚光 / 标签
/** 当前物件的虚线聚光圈（慢速转动 dash，让「当前」这件事一直在动） */
export const SpotRing: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry?: number;
  opacity: number;
  phase?: number;
  color?: string;
  sw?: number;
}> = ({cx, cy, rx, ry, opacity, phase = 0, color = PURPLE_LIGHT, sw = 2}) => {
  if (opacity <= 0.004) return null;
  return (
    <Svg bloom={false} opacity={opacity}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry ?? rx} fill="none" stroke={color} strokeWidth={sw} strokeDasharray="9 11" strokeDashoffset={phase} />
    </Svg>
  );
};

/** 地图标签：白字 + 极细下划线（下划线做 54 帧呼吸，分镜「已点亮的标签有极细的呼吸描边」） */
export const MapTag: React.FC<{
  cx: number;
  cy: number;
  text: string;
  size: number;
  w: number;
  opacity?: number;
  rise?: number;
  color?: string;
  underline?: number;
  underlineColor?: string;
  chinese?: boolean;
  shadow?: string;
}> = ({cx, cy, text, size, w, opacity = 1, rise = 0, color = WHITE, underline = 0, underlineColor = GREY_MID, chinese = false, shadow}) => (
  <div style={{position: 'absolute', inset: 0, opacity, transform: `translateY(${rise.toFixed(2)}px)`}}>
    <CText
      cx={cx}
      cy={cy}
      size={size}
      weight={chinese ? 600 : 400}
      family={chinese ? FONT_HEAVY : FONT_WIDE}
      color={color}
      letterSpacing={chinese ? 1.5 : 1.5}
      shadow={shadow}
    >
      {text}
    </CText>
    {underline > 0.004 && (
      <div
        style={{
          position: 'absolute',
          left: cx - w / 2,
          top: cy + size * 0.5,
          width: w,
          height: 1.3,
          borderRadius: 1,
          background: underlineColor,
          opacity: underline,
        }}
      />
    )}
  </div>
);

export type CalloutSpec = {
  text: string;
  x: number;
  y: number;
  size: number;
  w: number;
  pts: Pt[];
  chinese?: boolean;
};

/**
 * 一枚标签 + 它的引线。f = 标签出现帧（= 字幕块起始帧）：
 * 引线 f−3 起 14 帧画完，标签 f 起 11 帧 slideUp。
 * 当前项：紫下划线 + 紫字光 + 引线上跑紫点；其余：白字 + 灰白下划线慢呼吸。
 */
export const MapCallout: React.FC<{N: number; f: number; spec: CalloutSpec; cur: number; dim: number}> = ({N, f, spec, cur, dim}) => {
  const n = N - f;
  if (n < -4) return null;
  const p = clamp01((N - (f - 3)) / 14);
  const op = softOp(n, 11);
  const rise = slideUp(n, 10, 11);
  const d = clamp01(dim);
  const c = clamp01(cur) * (1 - d);
  const color = mixHex(WHITE, GREY_MID, d);
  const pulse = 0.5 + 0.5 * Math.sin((2 * Math.PI * (N + f * 7)) / 54);
  const uK = (1 - d) * (c > 0.02 ? 0.55 + 0.35 * pulse : 0.2 + 0.14 * pulse);
  const uColor = c > 0.02 ? PURPLE_LIGHT : mixHex(GREY_LIGHT, GREY_MID, d);
  const runDot = c > 0.35 && d < 0.5 && n > 12;
  return (
    <>
      <Leader
        pts={spec.pts}
        p={p}
        color={mixHex(WHITE, GREY_MID, d)}
        opacity={(1 - 0.45 * d) * 0.62}
        dotT={runDot ? (N - f - 12) / 64 : null}
        dotColor={PURPLE_LIGHT}
        dotR={3.2}
      />
      <MapTag
        cx={spec.x}
        cy={spec.y}
        text={spec.text}
        size={spec.size}
        w={spec.w}
        opacity={op}
        rise={rise}
        color={color}
        underline={uK}
        underlineColor={uColor}
        chinese={spec.chinese}
        shadow={c > 0.05 ? `0 0 12px rgba(102,45,248,${(0.45 * c).toFixed(2)})` : undefined}
      />
    </>
  );
};

// ---------------------------------------------------------------- 厨师 / 脑 / Agent
/**
 * Agent → 脑 的主引线（脚下胶囊沿右侧绕到头顶的脑，避开刀柄与铜铃）。
 * SC53 起一直在（它是这张图的主干），当前时跑一枚紫点，落灰后停。
 */
export const AgentLink: React.FC<{N: number; cur: number; dim: number}> = ({N, cur, dim}) => {
  const f = 13170;
  const n = N - f;
  if (n < 0) return null;
  const d = clamp01(dim);
  const c = clamp01(cur) * (1 - d);
  return (
    <Leader
      pts={[[764, 492], [800, 466], [800, 236], [754, 213]]}
      p={clamp01(n / 16)}
      color={mixHex(WHITE, GREY_MID, d)}
      opacity={(1 - 0.45 * d) * 0.72}
      dotT={c > 0.35 && d < 0.5 && n > 20 ? (N - f - 20) / 60 : null}
      dotColor={PURPLE_LIGHT}
      dotR={3.4}
    />
  );
};

/** 厨师（地图上 210）——SC53 的当前项，SC54 起降为白描边 */
export const ChefOnMap: React.FC<{N: number; f: number; cur: number; glowK: number; size?: number}> = ({N, f, cur, glowK, size = G12.chef.size}) => {
  const t = N - f;
  const si = scaleIn(t, 21);
  const op = t < 0 ? 0 : clamp01(0.12 + 1.7 * si);
  return (
    <>
      <GlowBlob cx={G12.chef.x} cy={G12.chef.y - 24} r={size * 0.82} N={N} k={glowK} alpha={0.16} />
      <GlowBlob cx={G12.chef.x} cy={G12.chef.y - 8} r={size * 0.56} N={N} k={glowK} alpha={0.2} />
      {t >= 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: op,
            transform: `scale(${(1.06 - 0.06 * si).toFixed(3)})`,
            transformOrigin: `${G12.chef.x}px ${G12.chef.y}px`,
          }}
        >
          <ChefIcon cx={G12.chef.x} cy={G12.chef.y} size={size} color={WHITE} accent={accentMix(1, cur)} />
        </div>
      )}
    </>
  );
};

/**
 * 厨师头顶 / 脚下的慢脉冲圈。
 *  - SC53：48 帧一次呼吸（半径 +4%，亮度 0.5→0.95），白圈 + 紫脚圈；
 *  - SC54 起：降为静态白圈（0.3），只当地图上的站位标记。
 */
export const ChefRings: React.FC<{N: number; f: number; pulse: number; feetAccent: number; topAccent?: number}> = ({N, f, pulse, feetAccent, topAccent = 0}) => {
  const t = N - f;
  if (t < 0) return null;
  const op = softOp(t, 12);
  const ph = 2 * Math.PI * (t / 64);
  const rg = 1 + (pulse > 0.5 ? 0.04 * Math.sin(ph) : 0);
  const oTop = op * (pulse > 0.5 ? 0.55 + 0.4 * (0.5 + 0.5 * Math.sin(ph)) : 0.3);
  const oFeet = op * (pulse > 0.5 ? 0.5 + 0.42 * (0.5 + 0.5 * Math.sin(ph + Math.PI)) : 0.26);
  return (
    <>
      <SpotRing cx={G12.ringTop.cx} cy={G12.ringTop.cy} rx={G12.ringTop.r * rg} opacity={oTop} phase={-N * 0.7} color={accentMix(1, topAccent)} sw={1.8} />
      <SpotRing cx={G12.ringFeet.cx} cy={G12.ringFeet.cy} rx={G12.ringFeet.rx * rg} ry={G12.ringFeet.ry * rg} opacity={oFeet} phase={-N * 0.7} color={accentMix(1, feetAccent)} sw={1.8} />
    </>
  );
};

/** 头顶的脑（LLM）：13170 起 18 帧落进空圈 */
export const BrainOnMap: React.FC<{N: number; f: number}> = ({N, f}) => {
  const st = itemState(N, f, 0, 0);
  if (st.t < 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: st.op,
        transform: `scale(${st.scale.toFixed(3)})`,
        transformOrigin: `${G12.brain.x}px ${G12.brain.y}px`,
      }}
    >
      <BrainIcon cx={G12.brain.x} cy={G12.brain.y} size={G12.brain.size} color={st.stroke} accent={st.accent} />
    </div>
  );
};

/** 脚下「Agent」胶囊（SC53 用 GlitchIn 包住；SC57 复用为缩略图标签） */
export const AgentPill: React.FC<{
  N: number;
  f: number;
  dim: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  size?: number;
}> = ({N, f, dim, x = G12.pill.x, y = G12.pill.y, w = G12.pill.w, h = G12.pill.h, size = 26}) => {
  const n = N - f;
  if (n < 0) return null;
  const op = softOp(n, 11);
  const rise = slideUp(n, 10, 11);
  const d = clamp01(dim);
  const fill = mixHex('#6630F8', '#2A2A2A', d);
  const stroke = mixHex(WHITE, GREY_MID, d);
  const color = mixHex(WHITE, GREY_MID, d);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, transform: `translateY(${rise.toFixed(2)}px)`}}>
      <Pill x={x - w / 2} y={y - h / 2} w={w} h={h} r={h / 2} fill={fill} stroke={stroke} sw={1.4} text="Agent" fontSize={size} family={FONT_WIDE} color={color} letterSpacing={1.5} />
    </div>
  );
};

// ---------------------------------------------------------------- 十个物件
type ItemProps = {N: number; cur: number; dim: number};

/** 胸牌：岗位职责 = 系统提示词 */
export const BadgeItem: React.FC<ItemProps> = ({N, cur, dim}) => {
  const st = itemState(N, AT.badge, cur, dim);
  if (st.t < 0) return null;
  return (
    <>
      <GlowBlob cx={G12.badge.x} cy={G12.badge.y} r={96} N={N} k={st.cur} alpha={0.22} />
      <SpotRing cx={G12.badge.x} cy={G12.badge.y} rx={92} ry={62} opacity={0.8 * st.cur} phase={-N * 0.9} />
      <div style={{position: 'absolute', inset: 0, opacity: st.op, transform: `scale(${st.scale.toFixed(3)})`, transformOrigin: `${G12.badge.x}px ${G12.badge.y}px`}}>
        <SheetIcon cx={G12.badge.x} cy={G12.badge.y} size={G12.badge.size} color={st.stroke} accent={st.accent} />
      </div>
    </>
  );
};

/** 刀：Tool */
export const KnifeItem: React.FC<ItemProps> = ({N, cur, dim}) => {
  const st = itemState(N, AT.knife, cur, dim);
  if (st.t < 0) return null;
  return (
    <>
      <GlowBlob cx={G12.knife.x} cy={G12.knife.y - 6} r={104} N={N} k={st.cur} alpha={0.2} />
      <SpotRing cx={G12.knife.x} cy={G12.knife.y - 6} rx={92} ry={58} opacity={0.75 * st.cur} phase={-N * 0.9} />
      <div style={{position: 'absolute', inset: 0, opacity: st.op, transform: `scale(${st.scale.toFixed(3)})`, transformOrigin: `${G12.knife.x}px ${G12.knife.y}px`}}>
        <div style={{position: 'absolute', inset: 0, transform: `rotate(${G12.knife.rot}deg)`, transformOrigin: `${G12.knife.x}px ${G12.knife.y}px`}}>
          <KnifeIcon cx={G12.knife.x} cy={G12.knife.y} size={G12.knife.size} color={st.stroke} accent={st.accent} />
        </div>
      </div>
    </>
  );
};

/** 菜谱卡盒：Skill */
export const CardBoxItem: React.FC<ItemProps> = ({N, cur, dim}) => {
  const st = itemState(N, AT.cardbox, cur, dim);
  if (st.t < 0) return null;
  return (
    <>
      <GlowBlob cx={G12.cardbox.x} cy={G12.cardbox.y - 14} r={96} N={N} k={st.cur} alpha={0.2} />
      <SpotRing cx={G12.cardbox.x} cy={G12.cardbox.y - 12} rx={88} ry={64} opacity={0.78 * st.cur} phase={-N * 0.9} />
      <div style={{position: 'absolute', inset: 0, opacity: st.op, transform: `scale(${st.scale.toFixed(3)})`, transformOrigin: `${G12.cardbox.x}px ${G12.cardbox.y}px`}}>
        <CardBoxIcon cx={G12.cardbox.x} cy={G12.cardbox.y} size={G12.cardbox.size} color={st.stroke} accent={st.accent} />
      </div>
    </>
  );
};

/** 冰箱门上的便签：Memory */
export const NoteItem: React.FC<ItemProps> = ({N, cur, dim}) => {
  const st = itemState(N, AT.note, cur, dim);
  if (st.t < 0) return null;
  return (
    <>
      <GlowBlob cx={G12.note.x} cy={G12.note.y} r={96} N={N} k={st.cur} alpha={0.22} />
      <SpotRing cx={G12.note.x} cy={G12.note.y} rx={82} ry={92} opacity={0.78 * st.cur} phase={-N * 0.9} />
      <div style={{position: 'absolute', inset: 0, opacity: st.op, transform: `scale(${st.scale.toFixed(3)})`, transformOrigin: `${G12.note.x}px ${G12.note.y}px`}}>
        <StickyNoteIcon cx={G12.note.x} cy={G12.note.y} size={G12.note.size} color={st.stroke} accent={st.accent} />
      </div>
    </>
  );
};

/** 台面上的铜铃：Command */
export const BellItem: React.FC<ItemProps> = ({N, cur, dim}) => {
  const st = itemState(N, AT.bell, cur, dim);
  if (st.t < 0) return null;
  return (
    <>
      <GlowBlob cx={G12.bell.x} cy={G12.bell.y - 10} r={98} N={N} k={st.cur} alpha={0.2} />
      <SpotRing cx={G12.bell.x} cy={G12.bell.y - 8} rx={88} ry={62} opacity={0.76 * st.cur} phase={-N * 0.9} />
      <div style={{position: 'absolute', inset: 0, opacity: st.op, transform: `scale(${st.scale.toFixed(3)})`, transformOrigin: `${G12.bell.x}px ${G12.bell.y}px`}}>
        <BellIcon cx={G12.bell.x} cy={G12.bell.y} size={G12.bell.size} color={st.stroke} accent={st.accent} />
      </div>
    </>
  );
};

/** 烟感 + 恒温器：Hook。探针 / 表盘上的扫描线持续转（分镜「烟感探针持续扫」） */
export const AlarmItem: React.FC<ItemProps> = ({N, cur, dim}) => {
  const st = itemState(N, AT.alarm, cur, dim);
  if (st.t < 0) return null;
  const k = G12.alarm.size / 100;
  const dialX = G12.alarm.x + (50 - 50) * k;
  const dialY = G12.alarm.y + (47 - 50) * k;
  const dialR = 14 * k;
  const probeX = G12.alarm.x;
  const probeY = G12.alarm.y + (92 - 50) * k;
  const ang = (N * 4.2) % 360;
  const tip = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin((2 * Math.PI * N) / 44));
  return (
    <>
      <GlowBlob cx={G12.alarm.x} cy={G12.alarm.y} r={100} N={N} k={st.cur} alpha={0.2} />
      <SpotRing cx={G12.alarm.x} cy={G12.alarm.y - 6} rx={92} ry={68} opacity={0.76 * st.cur} phase={-N * 0.9} />
      <div style={{position: 'absolute', inset: 0, opacity: st.op, transform: `scale(${st.scale.toFixed(3)})`, transformOrigin: `${G12.alarm.x}px ${G12.alarm.y}px`}}>
        <AlarmIcon cx={G12.alarm.x} cy={G12.alarm.y} size={G12.alarm.size} color={st.stroke} accent={st.accent} />
      </div>
      {/* 表盘里的扫描线（当前为紫，落灰后为白） */}
      <Svg bloom={false} opacity={st.op}>
        <g transform={`rotate(${ang.toFixed(1)} ${dialX} ${dialY})`}>
          <line x1={dialX} y1={dialY} x2={dialX + dialR * 0.92} y2={dialY} stroke={st.accent} strokeWidth={1.8} opacity={0.9} />
          <path d={`M${dialX} ${dialY} L${dialX + dialR * 0.75} ${dialY} A${dialR * 0.75} ${dialR * 0.75} 0 0 0 ${dialX + dialR * 0.53} ${dialY + dialR * 0.53} Z`} fill={st.accent} opacity={0.14} />
        </g>
        <circle cx={probeX} cy={probeY} r={4.6} fill={st.accent} opacity={0.35 + 0.5 * tip} />
      </Svg>
    </>
  );
};

/** 墙上的标准插座：MCP */
export const SocketItem: React.FC<ItemProps> = ({N, cur, dim}) => {
  const st = itemState(N, AT.socket, cur, dim);
  if (st.t < 0) return null;
  return (
    <>
      <GlowBlob cx={G12.socket.x} cy={G12.socket.y} r={98} N={N} k={st.cur} alpha={0.22} />
      <SpotRing cx={G12.socket.x} cy={G12.socket.y} rx={88} ry={70} opacity={0.8 * st.cur} phase={-N * 0.9} />
      <div style={{position: 'absolute', inset: 0, opacity: st.op, transform: `scale(${st.scale.toFixed(3)})`, transformOrigin: `${G12.socket.x}px ${G12.socket.y}px`}}>
        <SocketIcon cx={G12.socket.x} cy={G12.socket.y} size={G12.socket.size} color={st.stroke} accent={st.accent} />
      </div>
    </>
  );
};

/** 地上的整只木箱：Plugin */
export const CrateItem: React.FC<ItemProps> = ({N, cur, dim}) => {
  const st = itemState(N, AT.crate, cur, dim);
  if (st.t < 0) return null;
  return (
    <>
      <GlowBlob cx={G12.crate.x} cy={G12.crate.y - 10} r={110} N={N} k={st.cur} alpha={0.2} />
      <SpotRing cx={G12.crate.x} cy={G12.crate.y - 8} rx={88} ry={72} opacity={0.78 * st.cur} phase={-N * 0.9} />
      <div style={{position: 'absolute', inset: 0, opacity: st.op, transform: `scale(${st.scale.toFixed(3)})`, transformOrigin: `${G12.crate.x}px ${G12.crate.y}px`}}>
        <CrateIcon cx={G12.crate.x} cy={G12.crate.y} size={G12.crate.size} color={st.stroke} accent={st.accent} />
      </div>
    </>
  );
};

// ---------------------------------------------------------------- 标签表
/** 十枚标签（含 Agent 胶囊时为十枚；SC56 的「九枚」指除胶囊外的九个概念名） */
export const LABELS: Record<string, CalloutSpec> = {
  // 顶部三枚标签要抬离墙带顶线 y210，否则下划线与白虚线重叠（LLM 190→178 / MCP 187→172 / Hook 190→178）
  llm: {text: 'LLM', x: 555, y: 178, size: 40, w: 84, pts: [[648, 205], [601, 186]]},
  prompt: {text: '系统提示词', x: 535, y: 352, size: 26, w: 130, chinese: true, pts: [[679, 352], [604, 352]]},
  tool: {text: 'Tool', x: 890, y: 312, size: 34, w: 82, pts: [[784, 397], [836, 354], [852, 328]]},
  skill: {text: 'Skill', x: 480, y: 545, size: 34, w: 80, pts: [[402, 468], [446, 516], [454, 530]]},
  memory: {text: 'Memory', x: 172, y: 596, size: 32, w: 140, pts: [[140, 488], [150, 552], [158, 576]]},
  command: {text: 'Command', x: 902, y: 535, size: 30, w: 160, pts: [[930, 470], [922, 500], [914, 518]]},
  hook: {text: 'Hook', x: 1065, y: 178, size: 34, w: 88, pts: [[1065, 224], [1065, 197]]},
  mcp: {text: 'MCP', x: 360, y: 172, size: 36, w: 84, pts: [[360, 241], [360, 192]]},
  plugin: {text: 'Plugin', x: 940, y: 588, size: 32, w: 110, pts: [[1040, 566], [1028, 574], [1000, 580]]},
};
