import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {BrainIcon, ChefIcon} from '../../icons';
import {PURPLE, PURPLE_LIGHT, RED_DEEP, WHITE, exitOp, glowOffK, mixHex, scaleIn, softOp, CText, Pill} from '../../ui';
import {FONT_TECH, clamp01, powOutRemain} from '../../common';
import {DashRing} from './parts';

/**
 * SC02 两个不是一回事｜304–488｜「大脑是 LLM，厨师是 Agent。这两个不是一回事。」
 * 主角：脑 / 厨师两枚 190（本镜头是并置对比，两枚都按主角尺寸；讲到哪个亮哪个，非当前降到 0.35）。
 * 配角：两枚 Pill（LLM / Agent，黑底白边）+ 脑落位的虚线圈。
 * 持续动作：脑自左滑入、厨师自右滑入；≠ 落位后每 30 帧一次 1→1.06→1 轻脉冲。
 * 说明：分镜行里两处 Pill「glitch」与全局闪烁白名单（不含 SC02）及"每镜头至多一处"冲突，
 *       本实现两枚 Pill 均用 SoftIn，≠ 用缩放弹出 + 4 帧红闪代替。
 */
const F0 = 304;
const TO = 488;

export const SC02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 脑：308 起自左滑入 260px / 22 帧
  const bN = N - 308;
  const bDx = -260 * powOutRemain(bN, 22, 2.5);
  const bOp = softOp(bN, 8);
  // 厨师：370 起自右滑入 260px / 22 帧，同时 1.15→1
  const cN = N - 370;
  const cDx = 260 * powOutRemain(cN, 22, 2.5);
  const cS = 1 + 0.15 * powOutRemain(cN, 22, 2.5);
  const cOp = softOp(cN, 8);

  // 讲到谁谁亮：脑 312 起亮、370 起降到 0.35；厨师 372 起亮、425 起降到 0.35
  const brainGlow = clamp01((N - 312) / 10) * (1 - 0.65 * clamp01((N - 370) / 11)) * off;
  const chefGlow = clamp01((N - 372) / 10) * (1 - 0.65 * clamp01((N - 425) / 11)) * off;

  // ≠：425 缩放弹出（0.6→1，带一点过冲），4 帧深红短闪后转紫
  const nqN = N - 425;
  const nqS = 0.6 + 0.4 * scaleIn(nqN, 12);
  const flash = nqN >= 0 && nqN < 4 ? [1, 0.75, 0.5, 0.25][nqN] : 0;
  const purpleK = clamp01((N - 429) / 11);
  // 注意：mixHex 只吃 #RRGGBB，不能嵌套（内层会返回 rgb(...)，外层解析成 NaN → 黑色）。
  // 红闪与转紫在时间上不重叠，直接二选一。
  const nqCol = flash > 0 ? mixHex(WHITE, RED_DEEP, flash) : mixHex(WHITE, PURPLE_LIGHT, purpleK);
  // 说明：≠ 落位后不再加每 30 帧的脉冲——末拍稳定期需 ≥30 帧，持续脉冲会把 hold 打碎；
  //       分镜行里的「每 30 帧 emphasisPulse」在此放弃，宁可静止也要保住落位停留。

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 脑落位的虚线圈：306 淡入，脑落定后 352 前撤掉 */}
      <DashRing cx={400} cy={340} rx={112} opacity={softOp(N - 306, 10) * (1 - clamp01((N - 338) / 14)) * 0.9} phase={-N * 0.7} />

      {/* 左：大脑 */}
      {bN >= 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: bOp, transform: `translateX(${bDx.toFixed(2)}px)`}}>
          <GlowBlob cx={400} cy={340} r={148} N={N} k={brainGlow} alpha={0.3} />
          <BrainIcon cx={400} cy={340} size={190} color={WHITE} accent={PURPLE} />
          {/* LLM 标签随脑一起滑入（S04 块首 312 的 −6…+3 内出现） */}
          <Pill x={325} y={470} w={150} h={46} text="LLM" fontSize={30} family={FONT_TECH} letterSpacing={1.5} fill="#000" stroke={WHITE} sw={2} />
        </div>
      )}

      {/* 右：厨师 */}
      {cN >= 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: cOp, transform: `translateX(${cDx.toFixed(2)}px) scale(${cS.toFixed(3)})`, transformOrigin: '880px 340px'}}>
          <GlowBlob cx={880} cy={340} r={148} N={N} k={chefGlow} alpha={0.3} />
          <ChefIcon cx={880} cy={340} size={190} color={WHITE} accent={PURPLE} />
          {/* Agent 标签随厨师一起滑入（S05 块首 370 的 −6…+3 内出现） */}
          <Pill x={805} y={470} w={150} h={46} text="Agent" fontSize={30} family={FONT_TECH} letterSpacing={0.5} fill="#000" stroke={WHITE} sw={2} />
        </div>
      )}

      {/* 中间：≠（本镜头核心词） */}
      {N >= 425 && (
        <CText
          cx={640}
          cy={340}
          size={124}
          weight={900}
          color={nqCol}
          opacity={clamp01(nqN / 4)}
          shadow={flash > 0 ? '0 0 34px rgba(236,8,31,.95)' : purpleK > 0 ? '0 0 34px rgba(102,45,248,.85), 0 0 90px rgba(102,45,248,.5)' : undefined}
          style={{transform: `translate(-50%,-50%) scale(${nqS.toFixed(3)})`}}
        >
          ≠
        </CText>
      )}
    </div>
  );
};
