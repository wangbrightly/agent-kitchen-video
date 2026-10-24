import React from 'react';
import {PURPLE_LIGHT, WHITE, abs} from '../../ui';
import {clamp01} from '../../common';

/**
 * G8（SC34–SC38，第 4 章「命令与钩子」后半）共用小零件。
 * 约定与 icons.tsx / G1·G3·G5 的 parts 相同：100×100 viewBox、黑填充 + 3px 描边、size 等比缩放。
 * 本组新增：按压的手、探针延长线（带扫描端点）、二次贝塞尔取点/路径、示波条（"说的是"的持续动作）、
 *           闪烁光标、信封、目标环、沿路径跑的光点。
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

// ---------- 手 ----------
/**
 * 按压的手：小臂从上方垂下来、食指朝下按。
 * 图元内食指指尖在局部 (52,82)，即屏幕 cy + 0.32·size —— 调用方按这个偏移对准铃铛按钮。
 */
export const PressHand: React.FC<{
  cx: number;
  cy: number;
  size?: number;
  color?: string;
  opacity?: number;
  dashed?: boolean;
  /** 小臂上端的局部 y（可为负，SVG overflow 可见）；默认 2。手小的时候往下调，别把手伸到内容区外面 */
  armTop?: number;
}> = ({cx, cy, size = 100, color = WHITE, opacity = 1, dashed = false, armTop = 2}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} strokeDasharray={dashed ? '6 6' : undefined}>
      {/* 手掌（黑填充：盖住小臂线头，也盖住背后的装置线） */}
      <path d="M30 26h32a8 8 0 0 1 8 8v13a11 11 0 0 1-11 11H33a11 11 0 0 1-11-11V34a8 8 0 0 1 8-8Z" fill="#000" />
      {/* 小臂（上端开口，读作"从画面外伸进来"） */}
      <path d={`M38 ${armTop}V28M62 ${armTop}V28`} />
      {/* 食指（按下，指尖在局部 y≈80） */}
      <path d="M43 57v18a5 5 0 0 0 10 0V57" fill="#000" />
      {/* 中指收拢 */}
      <path d="M55 57v9a4.5 4.5 0 0 0 9 0V56" />
      {/* 拇指 */}
      <path d="M22 40c-7 4-8 13-1 17" />
    </g>
  </Frame>
);

// ---------- 探针 ----------
/** 二次贝塞尔取点（三段控制点，t ∈ [0,1]） */
export const qPoint = (x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, t: number): [number, number] => {
  const u = 1 - t;
  return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1];
};

/** 二次贝塞尔路径字符串 */
export const quadPath = (x0: number, y0: number, cx: number, cy: number, x1: number, y1: number) => `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`;

/**
 * 探针延长线：从装置底部垂下、末端弯向扫描点（控制点放在正下方，出线是竖直的）。
 * 虚线段持续行进（dashOffset 由调用方给 N 算），这是本组"持续观察"的动词动作。
 */
export const ProbeLine: React.FC<{
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  opacity?: number;
  color?: string;
  sw?: number;
  dashOffset?: number;
  dash?: string;
  glow?: boolean;
}> = ({x0, y0, x1, y1, opacity = 1, color = WHITE, sw = 2, dashOffset = 0, dash = '7 7', glow = false}) => {
  if (opacity <= 0) return null;
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity}}>
      <path
        d={quadPath(x0, y0, x0, y1, x1, y1)}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={dash}
        strokeDashoffset={dashOffset}
        style={glow ? {filter: 'drop-shadow(0 0 5px rgba(102,45,248,.8))'} : undefined}
      />
    </svg>
  );
};

/** 探针端点小球：白点 + 可选紫晕（扫到阈值时亮） */
export const ProbeTip: React.FC<{x: number; y: number; k?: number; opacity?: number}> = ({x, y, k = 0, opacity = 1}) => {
  const r = 6 + 2 * clamp01(k);
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: WHITE, opacity, boxShadow: `0 0 ${10 + 16 * clamp01(k)}px ${2 + 5 * clamp01(k)}px rgba(102,45,248,${(0.25 + 0.45 * clamp01(k)).toFixed(3)})`}} />
  );
};

/** 目标环：探针扫到阈值时从端点扩散一圈（p 0→1 扩散淡出） */
export const TargetRing: React.FC<{x: number; y: number; p: number; r?: number; color?: string}> = ({x, y, p, r = 26, color = PURPLE_LIGHT}) => {
  if (p <= 0 || p >= 1) return null;
  const rr = r * (0.5 + 1.3 * clamp01(p));
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <circle cx={x} cy={y} r={rr} fill="none" stroke={color} strokeWidth={2.4} opacity={0.95 * (1 - clamp01(p))} style={{filter: 'drop-shadow(0 0 6px rgba(102,45,248,.85))'}} />
    </svg>
  );
};

// ---------- 沿路径跑的光点 ----------
/** 沿二次贝塞尔跑的光点（t 由调用方按 N 算） */
export const PathDot: React.FC<{x0: number; y0: number; cx: number; cy: number; x1: number; y1: number; t: number; opacity?: number; color?: string; r?: number}> = ({
  x0,
  y0,
  cx,
  cy,
  x1,
  y1,
  t,
  opacity = 1,
  color = WHITE,
  r = 5,
}) => {
  if (opacity <= 0) return null;
  const [x, y] = qPoint(x0, y0, cx, cy, x1, y1, clamp01(t));
  return <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: color, opacity, boxShadow: '0 0 12px 4px rgba(102,45,248,.85)'}} />;
};

// ---------- 示波条 ----------
/**
 * "说的是"的示波条：一排竖条，高度按 N 的正弦起伏（每帧都在变，不是呼吸）。
 * 中间高两边低（envelope），左对齐；相邻条相位错开，读起来像一句话在被说出来。
 */
export const WaveBars: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  n?: number;
  color?: string;
  N: number;
  phase?: number;
  opacity?: number;
  speed?: number;
}> = ({x, y, w, h = 38, n = 24, color = WHITE, N, phase = 0, opacity = 1, speed = 0.22}) => {
  const bw = w / n;
  return (
    <div style={{...abs(x, y, w, h), opacity}}>
      {Array.from({length: n}, (_, i) => {
        const env = 0.42 + 0.58 * Math.sin((Math.PI * (i + 0.5)) / n); // 中间高
        const k = 0.28 + 0.72 * (0.5 + 0.5 * Math.sin(N * speed + i * 0.72 + phase));
        const bh = Math.max(3, h * env * k);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: i * bw,
              bottom: 0,
              width: Math.max(2, bw - 3),
              height: bh,
              borderRadius: 1.5,
              background: color,
              opacity: 0.45 + 0.55 * env,
            }}
          />
        );
      })}
    </div>
  );
};

/** 闪烁光标：亮 16 帧 / 灭 8 帧；n<0 不渲染 */
export const BlinkCursor: React.FC<{x: number; y: number; h?: number; w?: number; color?: string; n: number; opacity?: number}> = ({
  x,
  y,
  h = 64,
  w = 5,
  color = WHITE,
  n,
  opacity = 1,
}) => {
  if (n < 0) return null;
  const on = n % 24 < 16;
  return <div style={{position: 'absolute', left: x, top: y - h / 2, width: w, height: h, background: color, opacity: opacity * (on ? 0.9 : 0)}} />;
};

// ---------- 信封 / 附件 ----------
/** 信封：SC36 顶部右侧「收到新邮件时」的事件图标（78px 左右，配角） */
export const EnvelopeIcon: React.FC<{cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({
  cx,
  cy,
  size = 76,
  color = WHITE,
  accent = PURPLE_LIGHT,
  opacity = 1,
}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <rect x="12" y="28" width="76" height="46" rx="4" {...S(color, 3, '#000')} />
    <path d="M12 31 50 57 88 31" {...S(color, 2.6)} />
    <path d="M12 72 37 51M88 72 63 51" {...S(color, 2)} opacity={0.75} />
    <circle cx="50" cy="57" r="3.2" fill={accent} />
  </Frame>
);

/** 附件小卡：黑底白边 + 折角 + 两行字（≈70×46，配角） */
export const AttachCard: React.FC<{x: number; y: number; w?: number; h?: number; color?: string; accent?: string; opacity?: number}> = ({
  x,
  y,
  w = 72,
  h = 48,
  color = WHITE,
  accent = PURPLE_LIGHT,
  opacity = 1,
}) => (
  <div style={{...abs(x, y, w, h), opacity}}>
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={`M1.5 1.5 H${w - 14} L${w - 1.5} ${14} V${h - 1.5} H1.5 Z`} fill="#000" stroke={color} strokeWidth={2.4} strokeLinejoin="round" />
      <path d={`M${w - 14} 1.5 V14 H${w - 1.5}`} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" />
      <rect x="9" y={h - 19} width={w - 28} height="2.6" fill={accent} />
      <rect x="9" y={h - 11} width={w - 40} height="2.2" fill={color} opacity={0.75} />
    </svg>
  </div>
);

/** 短横托架（附件落下的托盘） */
export const Tray: React.FC<{cx: number; y: number; w?: number; color?: string; opacity?: number}> = ({cx, y, w = 104, color = '#A0A0A1', opacity = 1}) => (
  <div style={{...abs(cx - w / 2, y, w, 2.4), background: color, opacity}} />
);
