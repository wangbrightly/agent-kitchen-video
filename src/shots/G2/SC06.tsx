import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {BrainIcon, ChefIcon} from '../../icons';
import {Box, CText, LineArrow, PURPLE, PURPLE_LIGHT, WHITE, GREY, GREY_MID, GREY_LIGHT, GREY_LINE, Svg, SoftIn, TechText, exitOp, firstOp, glowOffK, mixHex, scaleIn, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, powOutRemain} from '../../common';
import {FlowDot, PulseRing, linePoint} from './parts';

/**
 * SC06 想与做｜1427–1624｜「Agent 是完整的厨师。大模型负责想，智能体负责把事情做完。」
 * 主角：厨师 ChefIcon 200 @ (900,350)，紫柔光。
 * 承接：开场保留 SC05 末帧的厨师（640,370 / 280），1429 起 26 帧移到右侧并缩到 200；
 *       脑 160 同时自左滑入；箭头 1461 起 18 帧 draw-on。
 * 焦点：讲到「大模型负责想」时紫光移到脑（1500），讲到「智能体负责……」时回到厨师（1545）。
 *       同一时刻只有一处强紫光，另一处余亮 0.18。
 * 持续动作：箭头光点每 36 帧从脑跑到厨师。
 */
const F0 = 1427;
const TO = 1624;

const ARROW = {x0: 480, y0: 350, x1: 790, y1: 350};

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 承接 SC05：厨师从画面中心 280 移到右侧 200
  const mk = clamp01((N - 1429) / 26);
  const me = 1 - Math.pow(1 - mk, 2.5);
  const chefX = 640 + (900 - 640) * me;
  const chefY = 370 + (350 - 370) * me;
  const chefSize = 280 + (200 - 280) * me;

  // 脑：1429 起自左滑入 280px / 22 帧
  const bN = N - 1429;
  const bDx = -280 * powOutRemain(bN, 22, 2.5);
  const bOp = softOp(bN, 8);
  const bS = 0.92 + 0.08 * scaleIn(bN, 21);

  // 焦点：1435–1499 厨师；1500–1544 脑；1545 起回到厨师
  const chefK = N < 1500 ? 1 : N < 1545 ? 1 - 0.82 * clamp01((N - 1500) / 11) : 0.18 + 0.82 * clamp01((N - 1545) / 11);
  const brainK = N < 1500 ? 0.12 : N < 1545 ? 0.12 + 0.88 * clamp01((N - 1500) / 11) : 0.88 * (1 - clamp01((N - 1545) / 11)) + 0.12;

  const arrowP = clamp01((N - 1461) / 18);
  const dotN = N - 1481;
  const [dotX, dotY] = linePoint(ARROW.x0, ARROW.y0, ARROW.x1, ARROW.y1, ((dotN % 36) + 36) % 36 / 36);

  const brainLabelK = N < 1500 ? 0 : N < 1545 ? 1 : 1 - clamp01((N - 1545) / 11);
  const chefLabelK = clamp01((N - 1545) / 11);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 连接箭头：脑 → 厨师（配角，白灰线；紫色只给沿线的光点） */}
      <Svg bloom={false}>
        <LineArrow x0={ARROW.x0} y0={ARROW.y0} x1={ARROW.x1} y1={ARROW.y1} p={arrowP} rodW={3} headL={18} headW={22} color={GREY_LIGHT} />
      </Svg>
      {N >= 1481 && <FlowDot cx={dotX} cy={dotY} />}

      {/* 脑：160（配角尺寸，但讲到「大模型负责想」时成为焦点） */}
      {bN >= 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: bOp, transform: `translateX(${bDx.toFixed(2)}px)`}}>
          <GlowBlob cx={380} cy={340} r={126} N={N} k={brainK * 0.9 * off} alpha={0.26} />
          <div style={{position: 'absolute', inset: 0, transform: `scale(${bS.toFixed(3)})`, transformOrigin: '380px 340px'}}>
            <BrainIcon cx={380} cy={340} size={160} color={WHITE} accent={PURPLE} />
          </div>
        </div>
      )}

      {/* 厨师：承接 SC05，移到右侧后成为主角 */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - F0, 8)}}>
        <GlowBlob cx={chefX} cy={chefY} r={chefSize * 0.7} N={N} k={chefK * off} alpha={0.25} />
        <GlowBlob cx={chefX} cy={chefY} r={chefSize * 0.48} N={N} k={chefK * off} alpha={0.3} />
        <ChefIcon cx={chefX} cy={chefY} size={chefSize} color={WHITE} accent={PURPLE} />
      </div>

      {/* 焦点切换的一次圈脉冲 */}
      <PulseRing cx={380} cy={340} p={(N - 1500) / 14} r={78} opacity={1} />
      <PulseRing cx={900} cy={350} p={(N - 1545) / 14} r={96} opacity={1} />

      {/* LLM / 负责想（S17 块首 1500） */}
      <SoftIn N={N} f0={1500} len={10} dy={8}>
        <TechText cx={380} cy={236} text="LLM" fontSize={32} color={mixHex(GREY_MID, PURPLE_LIGHT, brainLabelK)} glow={false} scaleX={0.9} letterSpacing={1} />
      </SoftIn>
      <SoftIn N={N} f0={1500} len={12} dy={16}>
        <Box x={300} y={440} w={160} h={44} r={8} fill="#000" stroke={mixHex(GREY_LINE, WHITE, brainLabelK)} sw={2} />
        <CText cx={380} cy={462} size={26} weight={600} family={FONT_HEAVY} color={mixHex(GREY, WHITE, brainLabelK)} letterSpacing={1}>
          负责想
        </CText>
      </SoftIn>

      {/* 把事情做完（S18 块首 1545）；26 帧上浮让末拍落位更晚，留出 45 帧停留 */}
      <SoftIn N={N} f0={1545} len={26} dy={20}>
        <Box x={795} y={464} w={210} h={44} r={8} fill="#000" stroke={mixHex(GREY_LINE, WHITE, chefLabelK)} sw={2} />
        <CText cx={900} cy={486} size={26} weight={600} family={FONT_HEAVY} color={mixHex(GREY, WHITE, chefLabelK)} letterSpacing={1}>
          把事情做完
        </CText>
      </SoftIn>

    </div>
  );
};
