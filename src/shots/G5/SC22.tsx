import React from 'react';
import {useCurrentFrame} from 'remotion';
import {HeroGlow} from '../../fx';
import {Box, GREY_LIGHT, GREY_LINE, LineArrow, Pill, Svg, WHITE, exitOp, glowOffK, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, easeInOutPow} from '../../common';
import {MiniRecipe, UtensilIcon, type UtensilKind} from './parts';

/**
 * SC22 工具是手，技能是做法｜5272–5604（本章论点型高光，≥90 帧）
 * 左侧五件器具挤成一堆（无序、无光）；右侧同样五件在面板里按时间线排好并连上箭头（有序、紫柔光）。
 * 中间两枚 Pill「工具 / 技能」分别落在两组上方。
 * 节拍：5280 左堆 + 工具 Pill / 5317 抖动两下 / 5379 右面板 + 技能 Pill /
 *       5415 五件依次滑到时间线 / 5490 底部菜谱卡扇形摊开 / 5499 收拢成叠。
 * 主角：右侧 360×190 面板（紫柔光）；左侧一律无光。
 */
const F0 = 5272;
const TO = 5604;

const KINDS: UtensilKind[] = ['knife', 'pot', 'spoon', 'tongs', 'spatula'];

// 左堆：五件叠在一起，角度各不相同
const PILE = [
  {kind: 'pot' as const, x: 332, y: 344, rot: 7, z: 0},
  {kind: 'tongs' as const, x: 348, y: 398, rot: -16, z: 1},
  {kind: 'spoon' as const, x: 284, y: 396, rot: 27, z: 2},
  {kind: 'knife' as const, x: 268, y: 330, rot: -25, z: 3},
  {kind: 'spatula' as const, x: 314, y: 364, rot: 11, z: 4},
];

// 右侧时间线：最终位置
const RX = [860, 925, 990, 1055, 1120];
const RY = 365;
const START = {x: 930, y: 390};

const FAN = [
  {x: 490, rot: -9},
  {x: 600, rot: -3},
  {x: 710, rot: 4},
  {x: 820, rot: 11},
];

export const SC22: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 左堆抖动：5317 起 20 帧，两个来回，幅度衰减
  const jn = N - 5317;
  const jitter = jn >= 0 && jn < 20 ? Math.sin((jn / 20) * Math.PI * 4) * 5 * (1 - clamp01(jn / 20)) : 0;

  // 右面板：5379 弹入；紫柔光
  const panelN = N - 5379;
  const panelS = 0.88 + 0.12 * softOp(panelN, 18);
  const panelGlow = clamp01(panelN / 12) * off;

  // 时间线箭头 5415–5435
  const lineP = clamp01((N - 5415) / 20);
  // 光点：5460 后每 70 帧一趟
  const dotN = N - 5460;
  const dotX = dotN < 0 ? 845 : 845 + 290 * ((dotN % 70) / 70);

  // 左堆在 5490 后降为背景
  const pileDim = 1 - 0.68 * clamp01((N - 5490) / 14);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 台面线：把左右两组与底部菜谱放在同一个台面上 */}
      <div style={{position: 'absolute', left: 80, top: 470, width: 1120, height: 1.4, background: GREY_LINE, opacity: 0.28}} />

      {/* ---- 左：五件器械挤成一堆（无序） ---- */}
      <div style={{position: 'absolute', inset: 0, opacity: pileDim, transform: `translateX(${jitter.toFixed(2)}px) rotate(${(jitter * 0.25).toFixed(2)}deg)`, transformOrigin: '300px 360px'}}>
        {PILE.map((p, i) => {
          const n = N - 5280 - i * 2;
          if (n < 0) return null;
          const s = 0.78 + 0.22 * softOp(n, 12);
          return (
            <div key={p.kind} style={{position: 'absolute', inset: 0, opacity: softOp(n, 8), transform: `scale(${s.toFixed(3)})`, transformOrigin: `${p.x}px ${p.y}px`, zIndex: p.z}}>
              <UtensilIcon kind={p.kind} cx={p.x} cy={p.y} size={86} color={WHITE} accent={GREY_LIGHT} rotate={p.rot} />
            </div>
          );
        })}
      </div>

      {/* 工具 Pill */}
      <SoftPill N={N} f0={5280} x={225} y={206} text="工具" />

      {/* ---- 右：同一组器具排上时间线（有序） ---- */}
      {panelN >= 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(panelN, 10)}}>
          <HeroGlow x={800} y={275} w={360} h={190} r={16} N={N} k={panelGlow} />
          <div style={{position: 'absolute', inset: 0, transform: `scale(${panelS.toFixed(3)})`, transformOrigin: '980px 370px'}}>
            <Box x={800} y={275} w={360} h={190} r={16} fill="rgba(0,0,0,0.55)" stroke={GREY_LINE} sw={1.6} />

            {/* 五件器具：先从左侧小堆里依次滑到时间线节点 */}
            {RX.map((fx, i) => {
              const p = easeInOutPow(2.5)(clamp01((N - (5415 + i * 4)) / 8));
              const x = START.x + (fx - START.x) * p;
              const y = START.y + (RY - START.y) * p;
              const rot = (i % 2 === 0 ? -18 : 14) * (1 - p);
              return (
                <div key={fx} style={{position: 'absolute', inset: 0, opacity: 0.6 + 0.4 * p}}>
                  <UtensilIcon kind={KINDS[i]} cx={x} cy={y} size={56} color={WHITE} accent={GREY_LIGHT} rotate={rot} />
                </div>
              );
            })}

            {/* 时间线：一条箭头 + 五个刻度（LineArrow 是 <g>，必须放在 Svg 里） */}
            {N >= 5415 && (
              <>
                <Svg bloom={false}>
                  <LineArrow x0={845} y0={434} x1={1135} y1={434} p={lineP} rodW={2} headL={16} headW={18} color={WHITE} opacity={0.9} />
                </Svg>
                {RX.map((x) => (
                  <div key={x} style={{position: 'absolute', left: x - 0.8, top: 398, width: 1.6, height: 36 * lineP, background: GREY_LIGHT, opacity: 0.9}} />
                ))}
              </>
            )}

            {/* 时间线上循环跑的光点 */}
            {N >= 5460 && (
              <div style={{position: 'absolute', left: dotX - 3, top: 431, width: 6, height: 6, borderRadius: 3, background: WHITE, boxShadow: '0 0 10px 3px rgba(102,45,248,.8)'}} />
            )}
          </div>
        </div>
      )}

      {/* 技能 Pill */}
      <SoftPill N={N} f0={5379} x={905} y={206} text="技能" />

      {/* ---- 底部：菜谱卡扇形摊开 → 收拢成一叠（不需要全摊在桌上） ---- */}
      {N >= 5490 && (
        <div style={{position: 'absolute', inset: 0}}>
          {[3, 2, 1, 0].map((i) => {
            const c = FAN[i];
            const n = N - 5490;
            const op = softOp(n, 8);
            const startCollapse = 5499 + (3 - i) * 8;
            const cp = easeInOutPow(2.4)(clamp01((N - startCollapse) / 20));
            const tx = 640 + (3 - i) * 4;
            const ty = 545 + (3 - i) * 4;
            const x = c.x + (tx - c.x) * cp;
            const rot = c.rot * (1 - cp);
            const s = (0.86 + 0.14 * softOp(n, 10)) * (1 - 0.04 * cp);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x - 75,
                  top: ty - 55,
                  width: 150,
                  height: 110,
                  opacity: op,
                  transform: `rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(3)})`,
                  transformOrigin: '50% 50%',
                  zIndex: 10 + (4 - i),
                }}
              >
                <MiniRecipe w={150} h={110} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/** 两枚 Pill 的入场（组内小组件，避免重复写 SoftIn 包裹） */
const SoftPill: React.FC<{N: number; f0: number; x: number; y: number; text: string}> = ({N, f0, x, y, text}) => {
  const n = N - f0;
  if (n < 0) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: softOp(n, 8), transform: `translateY(${(10 * (1 - softOp(n, 10))).toFixed(2)}px)`}}>
      <Pill x={x} y={y} w={150} h={48} text={text} fontSize={30} family={FONT_HEAVY} letterSpacing={4} fill="#000" stroke={WHITE} sw={2} />
    </div>
  );
};
