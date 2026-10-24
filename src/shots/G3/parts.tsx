import React from 'react';
import {CText, GREY, GREY_LIGHT, GREY_LINE, PURPLE_LIGHT, WHITE, abs, glowPurple} from '../../ui';
import {FONT_HEAVY, clamp01} from '../../common';

/**
 * G3（SC10–SC14）共用小零件。
 * 约定与 icons.tsx 相同：100×100 viewBox、黑填充 + 3px 描边、size 等比缩放；缺的器具在这里补。
 * 本组新增：岗位说明纸（可逐行 wipe / 打字 / 打勾 / 盖章）、锅 / 勺 / 夹子 / 铲、五件数字工具、
 *           双向箭头、缺席的手、虚线空圈、贝塞尔取点。
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

// ---------- 岗位说明纸 ----------
/** 纸面一行：lineP 横线 wipe 进度、chars 打字机已写字数、check 勾的 draw-on 进度 */
export type SheetRow = {
  text?: string;
  chars?: number;
  cursor?: boolean;
  lineP?: number;
  lineColor?: string;
  check?: number;
  checkColor?: string;
  textColor?: string;
};

/** 22px 勾（draw-on）：纸内局部坐标，别用 ui 的 Check（那个吃全画布坐标） */
const Tick: React.FC<{cx: number; cy: number; p?: number; color: string; size?: number; sw?: number}> = ({cx, cy, p = 0, color, size = 22, sw = 3}) => {
  const pts: Array<[number, number]> = [[-9, -1], [-2, 6], [8, -7]];
  const k = size / 22;
  const o = size / 2 + 4; // 小 SVG 内部原点，勾点必须用局部坐标
  const L = (Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]) + Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1])) * k;
  if (p <= 0) return null;
  return (
    <svg width={size + 8} height={size + 8} style={{position: 'absolute', left: cx - size / 2 - 4, top: cy - size / 2 - 4, overflow: 'visible'}}>
      <polyline
        points={pts.map(([x, y]) => `${o + x * k},${o + y * k}`).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={sw * k}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={L}
        strokeDashoffset={L * (1 - clamp01(p))}
      />
    </svg>
  );
};

/** 纸张内布局：宽度 260（SC10）与 320（SC11）各一套；11 字长行在 320 宽纸内留 2px 余量 */
export const SHEET_LAYOUT = {pad: 26, textX: 50, titleY: 32, dividerY: 66};

export const JobSheet: React.FC<{
  cx: number;
  cy: number;
  w: number;
  h: number;
  color?: string;
  opacity?: number;
  glowK?: number;
  title: string;
  titleOp?: number;
  titleUnderline?: number;
  rows: SheetRow[];
  rowY?: number[];
  footerY?: number;
  footer?: {text: string; op: number; color?: string};
  stamp?: {s?: number; op?: number; color?: string};
}> = ({cx, cy, w, h, color = PURPLE_LIGHT, opacity = 1, glowK = 0, title, titleOp = 1, titleUnderline = 0, rows, rowY, footerY, footer, stamp}) => {
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;
  const pad = w >= 300 ? 26 : 22;
  const textX = w >= 300 ? 50 : 46;
  const titleY = w >= 300 ? 32 : 28;
  const dividerY = w >= 300 ? 66 : 58;
  const ys = rowY ?? [112, 180, 248, 316];
  const fy = footerY ?? Math.round(h - 44);
  const innerW = w - textX - pad;
  const stampS = w >= 300 ? 42 : 36;
  const sp = stamp?.s ?? 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x0,
        top: y0,
        width: w,
        height: h,
        boxSizing: 'border-box',
        borderRadius: 9,
        background: '#000',
        border: `3px solid ${color}`,
        boxShadow: glowK > 0.005 ? glowPurple(glowK) : undefined,
        opacity,
        overflow: 'hidden',
      }}
    >
      {/* 标题 + 页眉分隔线 */}
      <div style={{position: 'absolute', left: pad, top: titleY - 11, fontFamily: FONT_HEAVY, fontSize: 22, fontWeight: 800, letterSpacing: 2, lineHeight: 1, color: WHITE, opacity: titleOp, whiteSpace: 'nowrap'}}>{title}</div>
      <div style={{position: 'absolute', left: pad, top: titleY + 12, width: 88, height: 3, background: PURPLE_LIGHT, opacity: titleUnderline, transformOrigin: '0 50%', transform: `scaleX(${clamp01(titleUnderline)})`}} />
      <div style={{position: 'absolute', left: pad, top: dividerY, width: w - pad * 2, height: 1.5, background: GREY_LINE, opacity: 0.9}} />

      {/* 印章：右上角，微旋 −8°；s<1 是压下去的一瞬 */}
      {stamp ? (
        <div
          style={{
            position: 'absolute',
            left: w - pad - stampS,
            top: 14,
            width: stampS,
            height: stampS,
            boxSizing: 'border-box',
            border: `2.5px solid ${stamp.color ?? PURPLE_LIGHT}`,
            borderRadius: 6,
            transform: `rotate(-8deg) scale(${sp})`,
            transformOrigin: '50% 50%',
            opacity: stamp.op ?? 1,
          }}
        >
          <div style={{position: 'absolute', inset: 3, border: `1px solid ${stamp.color ?? PURPLE_LIGHT}`, borderRadius: 3, opacity: 0.55}} />
          <svg width={stampS} height={stampS} viewBox="0 0 42 42" style={{position: 'absolute', inset: 0}}>
            <polyline points="11,21 18,28 31,13" fill="none" stroke={stamp.color ?? PURPLE_LIGHT} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : null}

      {/* 四行：划线 wipe → 打字 → 勾 */}
      {ys.map((ry, i) => {
        const r = rows[i] ?? {};
        const p = clamp01(r.lineP ?? 0);
        const txt = r.text ?? '';
        const chars = Math.floor(r.chars ?? 0);
        const shown = txt.slice(0, Math.max(0, chars));
        const typing = chars < txt.length;
        return (
          <React.Fragment key={i}>
            {/* 横线：自左向右 wipe；正在写的行带一颗紫色笔尖 */}
            {p > 0 ? (
              <>
                <div style={{position: 'absolute', left: textX, top: ry + 15, width: innerW * p, height: 2, background: r.lineColor ?? GREY_LINE, opacity: 0.95}} />
                {p < 1 ? (
                  <>
                    {/* 笔尖外晕：让「正在写」在缩略画面上也读得出来 */}
                    <div style={{position: 'absolute', left: textX + innerW * p - 23, top: ry - 8, width: 46, height: 46, borderRadius: 23, background: 'radial-gradient(circle, rgba(161,117,241,.5) 0%, rgba(102,45,248,.16) 46%, rgba(102,45,248,0) 72%)'}} />
                    <div style={{position: 'absolute', left: textX + innerW * p - 4, top: ry + 11, width: 8, height: 8, borderRadius: 4, background: PURPLE_LIGHT, boxShadow: '0 0 10px 4px rgba(102,45,248,.85)'}} />
                  </>
                ) : null}
              </>
            ) : null}
            {/* 打字机文字 */}
            {shown ? (
              <div style={{position: 'absolute', left: textX, top: ry - 11, fontFamily: FONT_HEAVY, fontSize: 22, fontWeight: 600, lineHeight: 1, letterSpacing: 0, color: r.textColor ?? WHITE, whiteSpace: 'nowrap'}}>
                {shown}
                {typing || r.cursor ? (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 3,
                      height: 22,
                      marginLeft: 2,
                      verticalAlign: 'top',
                      background: typing ? PURPLE_LIGHT : GREY,
                      opacity: typing ? 0.95 : 0.5,
                      boxShadow: typing ? '0 0 6px 2px rgba(102,45,248,.7)' : undefined,
                    }}
                  />
                ) : null}
              </div>
            ) : r.cursor ? (
              // 还没开始写的行：浅灰光标闪
              <div style={{position: 'absolute', left: textX, top: ry - 11, width: 3, height: 22, background: GREY, opacity: 0.45, boxShadow: undefined}} />
            ) : null}
            {/* 左侧紫勾 */}
            {r.check ? <Tick cx={pad + 7} cy={ry} p={r.check} color={r.checkColor ?? PURPLE_LIGHT} size={22} sw={3.2} /> : null}
          </React.Fragment>
        );
      })}

      {/* 页脚：系统提示词（SC11 才出现） */}
      {footer && footer.op > 0.001 ? (
        <div style={{position: 'absolute', left: textX, top: fy - 11, fontFamily: FONT_HEAVY, fontSize: 22, fontWeight: 700, letterSpacing: 2, lineHeight: 1, color: footer.color ?? PURPLE_LIGHT, opacity: footer.op, whiteSpace: 'nowrap'}}>
          {footer.text}
        </div>
      ) : null}
    </div>
  );
};

// ---------- 厨房器具（SC12 / SC13）----------
/** 锅：锅身 + 双耳 + 锅盖 + 蒸汽 */
export const PotIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 120, color = WHITE, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M22 44H78" {...S(color, 3)} />
    <path d="M26 44V68C26 79 34 86 44 86H56C66 86 74 79 74 68V44" {...S(color, 3, '#000')} />
    <path d="M14 51H26M74 51H86" {...S(color, 3)} />
    <path d="M28 44C32 35 68 35 72 44" {...S(color, 2.8, '#000')} />
    <rect x="45" y="27" width="10" height="7" rx="3" {...S(color, 2.4, '#000')} />
    <path d="M38 22C34 17 41 14 38 8M60 23C56 18 63 15 60 9" {...S(accent, 2.2)} />
  </Frame>
);

/** 勺：长柄 + 勺斗 */
export const SpoonIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 120, color = WHITE, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M50 56V18" {...S(color, 3)} />
    <circle cx="50" cy="14" r="5.5" {...S(color, 2.6, '#000')} />
    <path d="M31 62C31 78 69 78 69 62C69 55 31 55 31 62Z" {...S(color, 3, '#000')} />
    <path d="M40 63C43 69 57 69 60 63" {...S(accent, 2.2)} />
    <path d="M50 24V50" {...S(color, 1.8)} opacity={0.55} />
  </Frame>
);

/** 夹子：两条长臂合在一处 + 转轴 */
export const TongsIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 120, color = WHITE, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M30 84C30 46 38 28 50 16C62 28 70 46 70 84" {...S(color, 3, '#000')} />
    <path d="M41 84C41 56 45 40 50 32C55 40 59 56 59 84" {...S(color, 2.2)} />
    <path d="M30 84H39M61 84H70" {...S(color, 3)} />
    <circle cx="50" cy="42" r="3.4" fill={accent} />
  </Frame>
);

/** 铲：带孔平铲 + 手柄 */
export const SpatulaIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 120, color = WHITE, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M30 12H60L66 40C67 47 60 52 50 52C40 52 33 47 34 40Z" {...S(color, 3, '#000')} />
    <path d="M41 22V36M50 20V38M59 22V36" {...S(accent, 2.2)} />
    <path d="M50 52V88" {...S(color, 3)} />
    <path d="M44 80H56" {...S(color, 2.6)} />
  </Frame>
);

// ---------- 数字工具（SC13 / SC14）----------
export type DigitalKind = 'file' | 'web' | 'terminal' | 'db' | 'mail';

/** 数字工具图标：文件 / 网页 / 终端 / 数据库 / 邮件 */
export const DigitalIcon: React.FC<{cx: number; cy: number; size?: number; kind: DigitalKind; color?: string; accent?: string; opacity?: number}> = ({cx, cy, size = 84, kind, color = WHITE, accent = PURPLE_LIGHT, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    {kind === 'file' ? (
      <>
        <path d="M30 10H60L72 22V90H30Z" {...S(color, 3, '#000')} />
        <path d="M60 10V22H72" {...S(color, 2.6)} />
        <path d="M38 42H64M38 54H64M38 66H56" {...S(color, 2.2)} />
        <path d="M38 42H56" {...S(accent, 2.6)} />
      </>
    ) : null}
    {kind === 'web' ? (
      <>
        <rect x="12" y="16" width="76" height="68" rx="4" {...S(color, 3, '#000')} />
        <path d="M12 34H88" {...S(color, 2.4)} />
        <circle cx="21" cy="25" r="2" fill={color} />
        <circle cx="28" cy="25" r="2" fill={color} />
        <circle cx="35" cy="25" r="2" fill={color} />
        <circle cx="55" cy="58" r="13" {...S(accent, 3, '#000')} />
        <path d="M65 68L76 79" {...S(color, 3.4)} />
        <path d="M45 55C50 61 60 61 65 55" {...S(accent, 1.8)} />
      </>
    ) : null}
    {kind === 'terminal' ? (
      <>
        <rect x="10" y="16" width="80" height="68" rx="4" {...S(color, 3, '#000')} />
        <path d="M10 34H90" {...S(color, 2.4)} />
        <circle cx="19" cy="25" r="2" fill={color} />
        <circle cx="26" cy="25" r="2" fill={color} />
        <path d="M24 46L34 55L24 64" {...S(color, 3)} />
        <rect x="42" y="58" width="20" height="7" rx="1" fill={accent} opacity={0.9} />
        <path d="M42 50H70" {...S(color, 2)} opacity={0.6} />
      </>
    ) : null}
    {kind === 'db' ? (
      <>
        <path d="M24 22V76C24 85 76 85 76 76V22" {...S(color, 3, '#000')} />
        <ellipse cx="50" cy="22" rx="26" ry="9" {...S(color, 3, '#000')} />
        <ellipse cx="50" cy="22" rx="18" ry="5" fill={accent} opacity={0.22} />
        <path d="M24 44C24 53 76 53 76 44M24 62C24 71 76 71 76 62" {...S(color, 2.2)} />
      </>
    ) : null}
    {kind === 'mail' ? (
      <>
        <rect x="12" y="26" width="76" height="52" rx="4" {...S(color, 3, '#000')} />
        <path d="M12 30L50 58L88 30" {...S(color, 2.6)} />
        <path d="M14 74L38 54M86 74L62 54" {...S(color, 1.8)} opacity={0.55} />
        <circle cx="78" cy="30" r="6" fill={accent} />
      </>
    ) : null}
  </Frame>
);

// ---------- 线条 / 图形 ----------
/** 双向箭头：自中心向两端 draw-on（p 0→1），两端各一枚箭头 */
export const BiArrow: React.FC<{x0: number; x1: number; y: number; p?: number; color?: string; opacity?: number; rodW?: number; headL?: number; headW?: number}> = ({x0, x1, y, p = 1, color = GREY_LIGHT, opacity = 1, rodW = 2.4, headL = 16, headW = 20}) => {
  if (p <= 0) return null;
  const cx = (x0 + x1) / 2;
  const half = ((x1 - x0) / 2) * clamp01(p);
  const hl = headL * clamp01(p * 2.4);
  const hw = (headW / 2) * clamp01(p * 2.4);
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity}}>
      <line x1={cx - half} y1={y} x2={cx + half} y2={y} stroke={color} strokeWidth={rodW} strokeLinecap="round" />
      <polygon points={`${cx - half},${y} ${cx - half + hl},${y - hw} ${cx - half + hl},${y + hw}`} fill={color} />
      <polygon points={`${cx + half},${y} ${cx + half - hl},${y - hw} ${cx + half - hl},${y + hw}`} fill={color} />
    </svg>
  );
};

/** 虚线圆（空虚线圈 / 右手待插的圈） */
export const DashCircle: React.FC<{cx: number; cy: number; r: number; color?: string; opacity?: number; sw?: number; phase?: number; dash?: string; glow?: boolean}> = ({cx, cy, r, color = GREY_LIGHT, opacity = 1, sw = 2, phase = 0, dash = '7 6', glow = false}) => (
  <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity}}>
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeDasharray={dash}
      strokeDashoffset={phase}
      style={glow ? {filter: 'drop-shadow(0 0 8px rgba(102,45,248,.85))'} : undefined}
    />
  </svg>
);

/** 缺席的手（虚线）：手掌 + 四指 + 手腕；手腕处再套一枚空虚线圆 */
export const GhostHand: React.FC<{cx: number; cy: number; size?: number; color?: string; opacity?: number}> = ({cx, cy, size = 120, color = GREY, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <g {...S(color, 2.6)} strokeDasharray="6 6">
      <path d="M34 52V24a5 5 0 0 1 10 0v28" />
      <path d="M46 52V18a5 5 0 0 1 10 0v34" />
      <path d="M58 52V22a5 5 0 0 1 10 0v30" />
      <path d="M70 52V34a5 5 0 0 1 10 0v18" />
      <path d="M34 54c-9-4-13 3-8 9l10 11h32V52" />
      <path d="M44 84v6M64 84v6" />
    </g>
  </Frame>
);

/** 二次贝塞尔取点（SC12 器具抛物线飞入） */
export const qPoint = (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, t: number): [number, number] => {
  const u = 1 - t;
  return [u * u * x0 + 2 * u * t * x1 + t * t * x2, u * u * y0 + 2 * u * t * y1 + t * t * y2];
};

/** 22px 小标签（图标下方 / 旁侧） */
export const SmallLabel: React.FC<{cx: number; cy: number; text: string; color?: string; size?: number; opacity?: number; weight?: number}> = ({cx, cy, text, color = GREY, size = 22, opacity = 1, weight = 600}) => (
  <CText cx={cx} cy={cy} size={size} weight={weight} family={FONT_HEAVY} color={color} opacity={opacity} dy={-2}>
    {text}
  </CText>
);
