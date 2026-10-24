import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {AlarmIcon, BellIcon} from '../../icons';
import {GREY_LIGHT, PURPLE_LIGHT, WHITE, exitOp, glowOffK, scaleIn, softOp} from '../../ui';
import {FONT_HEAVY, clamp01} from '../../common';
import {BlinkCursor} from './parts';

/**
 * SC37 两句话｜9152–9397（246 帧）
 * 字幕：9160 Command 说的是 / 9202 “现在开始做这件事” / 9268 Hook 说的是 / 9295 “只要这件事发生 / 9332 就自动执行那个动作”
 *
 * 上：白字「现在开始做这件事」+ 左铃铛（人按）；下：紫字两句「只要这件事发生，/ 就自动执行那个动作」+ 左装置（自动）。
 * 上先出现（8608 起的淡入 + 上浮），下后出现：两句各自从左往右打出来，带紫描边（紫辉光）。
 * 两行之间一条竖向虚线，9268 起 draw-on。
 * 持续动作：上行右端、下行末句右端各有一条 24 帧周期的闪烁光标。
 * 主角：下行两句（大字 96，紫光）。分镜写的是 64px，与全局"大字主角 ≥96px"冲突，取 96px。
 */
const F0 = 9152;
const TO = 9397;

const SIZE = 96;
const TEXT_X = 250;

const UP = '现在开始做这件事';
const LOW1 = '只要这件事发生，';
const LOW2 = '就自动执行那个动作';

const ICON_X = 172;
const UP_Y = 190;
const LOW_Y1 = 340;
const LOW_Y2 = 470;
const LOW_CY = (LOW_Y1 + LOW_Y2) / 2;

/** 单行大字：绝对定位 + 收缩宽度 + clipPath 从左往右揭开（打字感） */
const BigLine: React.FC<{x: number; cy: number; text: string; color: string; p?: number; shadow?: string; opacity?: number; dy?: number}> = ({
  x,
  cy,
  text,
  color,
  p = 1,
  shadow,
  opacity = 1,
  dy = 0,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: cy - SIZE * 0.62 + dy,
      height: SIZE * 1.24,
      lineHeight: `${(SIZE * 1.24).toFixed(1)}px`,
      fontFamily: FONT_HEAVY,
      fontWeight: 900,
      fontSize: SIZE,
      color,
      whiteSpace: 'nowrap',
      opacity,
      textShadow: shadow,
      clipPath: `inset(-28px ${((1 - clamp01(p)) * 100).toFixed(2)}% -28px 0)`,
    }}
  >
    {text}
  </div>
);

export const SC37: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  const upIn = softOp(N - 9202, 10);
  const low1P = clamp01((N - 9295) / 21);
  const low2P = clamp01((N - 9332) / 20);
  const lowOn = clamp01((N - 9268) / 14);

  const sUp = scaleIn(N - 9160, 12);
  const sLow = scaleIn(N - 9268, 12);

  // 竖向虚线（两行之间）
  const dashP = clamp01((N - 9268) / 18);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 下行紫柔光：整块只有这一处光 */}
      <GlowBlob cx={700} cy={LOW_CY} r={390} k={lowOn * off} alpha={0.13} />

      {/* ===== 上：Command 说的是 ===== */}
      <div style={{position: 'absolute', inset: 0, opacity: sUp, transform: `scale(${(0.84 + 0.16 * sUp).toFixed(3)})`, transformOrigin: `${ICON_X}px ${UP_Y}px`}}>
        <BellIcon cx={ICON_X} cy={UP_Y} size={92} color={WHITE} accent={GREY_LIGHT} />
      </div>
      {upIn > 0.01 && (
        <BigLine x={TEXT_X} cy={UP_Y} text={UP} color={WHITE} opacity={upIn} dy={14 * (1 - upIn)} shadow="0 0 22px rgba(255,255,255,.18)" />
      )}
      <BlinkCursor x={TEXT_X + UP.length * SIZE + 12} y={UP_Y} h={SIZE * 0.92} w={5} color={WHITE} n={N - 9214} opacity={0.85 * upIn} />

      {/* ===== 两行之间的竖向虚线 ===== */}
      {dashP > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 640 - 1,
            top: 246,
            width: 2,
            height: 46 * dashP,
            backgroundImage: `linear-gradient(180deg, ${PURPLE_LIGHT} 0 6px, transparent 6px 13px)`,
            backgroundSize: '2px 13px',
            opacity: 0.75,
          }}
        />
      )}

      {/* ===== 下：Hook 说的是（两句，紫）===== */}
      <div style={{position: 'absolute', inset: 0, opacity: sLow, transform: `scale(${(0.84 + 0.16 * sLow).toFixed(3)})`, transformOrigin: `${ICON_X}px ${LOW_CY}px`}}>
        <AlarmIcon cx={ICON_X} cy={LOW_CY} size={92} color={PURPLE_LIGHT} accent={PURPLE_LIGHT} />
      </div>

      {low1P > 0 && <BigLine x={TEXT_X} cy={LOW_Y1} text={LOW1} color={PURPLE_LIGHT} p={low1P} shadow="0 0 26px rgba(102,45,248,.75), 0 0 7px rgba(161,117,241,.95)" />}
      {low2P > 0 && <BigLine x={TEXT_X} cy={LOW_Y2} text={LOW2} color={PURPLE_LIGHT} p={low2P} shadow="0 0 26px rgba(102,45,248,.75), 0 0 7px rgba(161,117,241,.95)" />}

      <BlinkCursor x={TEXT_X + LOW2.length * SIZE + 12} y={LOW_Y2} h={SIZE * 0.92} w={5} color={PURPLE_LIGHT} n={N - 9334} opacity={0.85 * clamp01((N - 9334) / 4)} />
    </div>
  );
};
