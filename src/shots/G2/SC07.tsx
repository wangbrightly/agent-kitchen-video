import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {BrainIcon, ChefIcon, KnifeIcon, SheetIcon, SocketIcon} from '../../icons';
import {PURPLE, PURPLE_LIGHT, WHITE, GREY, GREY_LIGHT, SoftIn, Svg, TechText, exitOp, firstOp, glowOffK, mixHex, scaleIn, softOp} from '../../ui';
import {clamp01} from '../../common';
import {ChefGhost, FlowDot, linePoint} from './parts';

/**
 * SC07 同一个大脑｜1625–1892｜「同一个大脑，装进不同的厨师身体，接上不同的工具和规则，
 * 就可能成为完全不同的智能体。」
 * 主角：脑 BrainIcon 180 @ (640,285)，紫柔光。
 * 配角：三条分支线（draw-on）+ 三个 110px 虚线厨师轮廓 + 三枚 60px 小工具（刀 / 岗位说明 / 插座）+ 24px Agent 小标。
 * 节拍：1625 脑首帧即在（首个字幕块 1633）；1661 三分支与虚线身体；1722 三枚工具接上；1795 三枚 Agent 落名，随后逐个由虚线变实心。
 * 持续动作：三条分支上的光点循环流动（周期 44 帧，错峰 14 帧）。
 */
const F0 = 1625;
const TO = 1892;

const COLS = [
  {x: 300, branch: 1657, ghost: 1657, tool: 1721, label: 1794, solid: 1798, kind: 'knife' as const},
  {x: 640, branch: 1659, ghost: 1659, tool: 1722, label: 1795, solid: 1814, kind: 'sheet' as const},
  {x: 980, branch: 1661, ghost: 1661, tool: 1723, label: 1796, solid: 1830, kind: 'socket' as const},
];

const BRAIN = {cx: 640, cy: 285, size: 180};
const BRANCH_TOP = {x: 640, y: 378};
const NODE_Y = 452;

export const SC07: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 首帧即有脑（firstOp ≈57%），避免镜头切换后空 2 帧
  const bN = N - F0;
  const bS = 0.94 + 0.06 * scaleIn(bN, 21);
  const bOp = firstOp(bN, 8);
  const brainGlow = clamp01(bN / 10) * off;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 分支线（先画，压在图标下方） */}
      <Svg bloom={false}>
        {COLS.map((c) => {
          const p = clamp01((N - c.branch) / 12);
          if (p <= 0) return null;
          return (
            <g key={c.x}>
              <path
                d={`M${BRANCH_TOP.x} ${BRANCH_TOP.y}L${c.x} ${NODE_Y}`}
                fill="none"
                stroke={GREY_LIGHT}
                strokeWidth={1.5}
                opacity={0.72}
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - p}
              />
              {p > 0.82 && <circle cx={c.x} cy={NODE_Y} r={3.4} fill={PURPLE_LIGHT} opacity={0.9} />}
            </g>
          );
        })}
      </Svg>
      {/* 分支上的循环光点 */}
      {N >= 1673 &&
        COLS.map((c, i) => {
          const t = ((((N - 1673 + i * 14) % 44) + 44) % 44) / 44;
          const [dx, dy] = linePoint(BRANCH_TOP.x, BRANCH_TOP.y, c.x, NODE_Y, t);
          return <FlowDot key={`dot-${c.x}`} cx={dx} cy={dy} r={2.6} />;
        })}

      {/* 主角：脑 180 */}
      {bN >= 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: bOp, transform: `scale(${bS.toFixed(3)})`, transformOrigin: `${BRAIN.cx}px ${BRAIN.cy}px`}}>
          <GlowBlob cx={BRAIN.cx} cy={BRAIN.cy} r={168} N={N} k={brainGlow} alpha={0.22} />
          <GlowBlob cx={BRAIN.cx} cy={BRAIN.cy} r={108} N={N} k={brainGlow} alpha={0.28} />
          <BrainIcon cx={BRAIN.cx} cy={BRAIN.cy} size={BRAIN.size} color={WHITE} accent={PURPLE} />
        </div>
      )}

      {/* 三个身体：虚线 → 实心（1798 / 1814 / 1830 起，各 14 帧） */}
      {COLS.map((c) => {
        const gn = N - c.ghost;
        if (gn < 0) return null;
        const ghostOp = softOp(gn, 10);
        const solidK = clamp01((N - c.solid) / 14);
        const toolN = N - c.tool;
        return (
          <React.Fragment key={c.x}>
            {/* 虚线厨师轮廓 */}
            <ChefGhost cx={c.x} cy={530} size={110} color={GREY} opacity={ghostOp * (1 - solidK)} />
            {/* 实心厨师（变实后仍不发光） */}
            {solidK > 0 && (
              <div style={{position: 'absolute', inset: 0, opacity: solidK}}>
                <ChefIcon cx={c.x} cy={530} size={110} color={mixHex(GREY_LIGHT, WHITE, solidK)} accent={GREY_LIGHT} />
              </div>
            )}

            {/* 小工具：1722 起 2 帧错峰接上 */}
            {toolN >= 0 && (
              <div style={{position: 'absolute', inset: 0, opacity: softOp(toolN, 8), transform: `scale(${(0.82 + 0.18 * scaleIn(toolN, 12)).toFixed(3)})`, transformOrigin: `${c.x + 68}px 520px`}}>
                <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: 0.8}}>
                  <path d={`M${c.x + 30} ${545}L${c.x + 46} ${530}`} stroke={GREY_LIGHT} strokeWidth={1.2} strokeDasharray="3 4" fill="none" />
                </svg>
                {c.kind === 'knife' && <KnifeIcon cx={c.x + 68} cy={520} size={60} color={WHITE} accent={GREY_LIGHT} />}
                {c.kind === 'sheet' && <SheetIcon cx={c.x + 68} cy={520} size={60} color={WHITE} accent={GREY_LIGHT} />}
                {c.kind === 'socket' && <SocketIcon cx={c.x + 68} cy={520} size={60} color={WHITE} accent={GREY_LIGHT} />}
              </div>
            )}

            {/* 1795：落名 Agent；1798/1814/1830：由虚线变实心 */}
            <SoftIn N={N} f0={c.label} len={8} dy={8}>
              <TechText cx={c.x} cy={606} text="Agent" fontSize={24} color={mixHex(GREY, WHITE, clamp01((N - c.label) / 10))} glow={false} scaleX={0.9} letterSpacing={1} />
            </SoftIn>
          </React.Fragment>
        );
      })}
    </div>
  );
};
