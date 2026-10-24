import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GlowBlob, type CamKey} from '../../fx';
import {CText, PURPLE, PURPLE_LIGHT, WHITE, exitOp, glowOffK, mixHex, scaleIn, softOp} from '../../ui';
import {FONT_WIDE, GlitchIn, clamp01, easeInOutPow, emphasisPulse} from '../../common';
import {RING_SLOTS, RoleIcon, ringPos, type RoleKey} from './parts';

/**
 * SC61 完整系统｜15062–15361（300 帧）——全片收尾 payoff（≥90 帧）
 * 中央聚合成「系统环」：五个图标沿圆环落位 → 环 24 帧 draw-on → 环心 Agent（本组唯一 GlitchIn）21 帧 scaleIn。
 * 节拍：15070 而是大脑 / 15090 工具 / 15101 技能 / 15111 记忆 /
 *       15119 规则和运行机制共同组成的完整系统（环开始画）/ 15232 大脑决定它会不会想 / 15285 工具决定它能不能做
 * 运镜：15062–15092 拉远 1.12→1.0（30 帧），五图标在拉远中依次落位。
 * 持续：15166 起环上三枚光点循环（72 帧一圈），直到离场。
 * 停留：15310 → 15353 离场（43 帧）。环直径 420，环心 Agent 96px。
 */
const F0 = 15062;
const TO = 15361;

const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1.12},
  {f: 15092, x: 640, y: 360, s: 1},
  {f: TO, x: 640, y: 360, s: 1},
];

const CX = 640;
const CY = 360;
const R = 210;
const ICON = 68;
const RING_C = 2 * Math.PI * R;

// 五个概念的落位节拍（与字幕严格同步）
const LANDS: Record<RoleKey, number> = {brain: 15070, tool: 15090, skill: 15101, memory: 15111, role: 15119};
const NEXT: Record<RoleKey, number> = {brain: 15090, tool: 15101, skill: 15111, memory: 15119, role: 15145};

const ease = easeInOutPow(2);

/** 一圈扩散的光环（15232 / 15285 两拍） */
const halo = (n: number) => {
  if (n < 0) return null;
  const t = clamp01(n / 26);
  return {r: 40 + 34 * t, op: (1 - t) * 0.9};
};

export const SC61: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);
  const guideOp = softOp(N - 15064, 10);

  // 五图标：沿环滑入 + 当前概念亮紫（15232 / 15285 两拍再亮一次）
  const lit = (k: RoleKey) => {
    const first = clamp01((N - LANDS[k]) / 8) * (1 - clamp01((N - NEXT[k]) / 10));
    const again =
      k === 'brain'
        ? clamp01((N - 15232) / 8) * (1 - clamp01((N - 15285) / 12))
        : k === 'tool'
          ? clamp01((N - 15285) / 8) * (1 - clamp01((N - 15298) / 12))
          : 0;
    return Math.max(first, again) * off;
  };

  // 环：15119 起 24 帧 draw-on
  const ringP = clamp01((N - 15119) / 24);

  // 环心 Agent：本组唯一 GlitchIn + 21 帧 scaleIn + 一次强调脉动
  const agentN = N - 15145;
  const agentS = scaleIn(agentN, 21);
  const agentPulse = emphasisPulse(N - 15170, {peak: 1.04, up: 10, hold: 5, down: 12});
  const agentGlow = clamp01(agentN / 12) * off;

  // 三枚循环光点
  const orbitN = N - 15166;
  const orbits = [0, 1 / 3, 2 / 3].map((ph) => (orbitN < 0 ? -1 : (orbitN / 72 + ph) % 1));

  const brainHalo = halo(N - 15232);
  const toolHalo = halo(N - 15285);
  const [bx, by] = ringPos(CX, CY, R, 144);
  const [tx, ty] = ringPos(CX, CY, R, 72);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        {/* 落位前的引导环（虚线，随紫环画出而退场） */}
        {guideOp > 0.01 ? (
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: guideOp * 0.5 * (1 - ringP)}}>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#5A5A5A" strokeWidth={1.4} strokeDasharray="4 12" />
            {RING_SLOTS.map((s) => {
              const [x, y] = ringPos(CX, CY, R, s.angle);
              return <circle key={s.kind} cx={x} cy={y} r={3} fill="#6A6A6A" />;
            })}
          </svg>
        ) : null}

        {/* 紫环：24 帧 draw-on，带紫光 */}
        {ringP > 0 ? (
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={PURPLE_LIGHT}
              strokeWidth={3.2}
              strokeLinecap="round"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - ringP)}
              transform={`rotate(-90 ${CX} ${CY})`}
              style={{filter: 'drop-shadow(0 0 8px rgba(102,45,248,.85))'}}
            />
          </svg>
        ) : null}

        {/* 环心柔光 */}
        <GlowBlob cx={CX} cy={CY} r={168} k={agentGlow} alpha={0.16} />
        <GlowBlob cx={CX} cy={CY} r={108} k={agentGlow} alpha={0.14} />

        {/* 五图标沿环落位 */}
        {RING_SLOTS.map((s) => {
          const at = LANDS[s.kind];
          const n = N - at;
          if (n < 0) return null;
          const p = ease(clamp01(n / 18));
          const [x, y] = ringPos(CX, CY, R, s.angle + 22 * (1 - p));
          const k = lit(s.kind);
          const c = mixHex(WHITE, PURPLE_LIGHT, k);
          return <RoleIcon key={s.kind} kind={s.kind} cx={x} cy={y} size={ICON * (0.82 + 0.18 * p) * (1 + 0.1 * k)} color={c} accent={c} opacity={softOp(n, 7)} />;
        })}

        {/* 两拍强调光环：会不会想 / 能不能做 */}
        {brainHalo || toolHalo ? (
          <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            {brainHalo ? <circle cx={bx} cy={by} r={brainHalo.r} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2} opacity={brainHalo.op * 0.8} style={{filter: 'drop-shadow(0 0 8px rgba(102,45,248,.8))'}} /> : null}
            {toolHalo ? <circle cx={tx} cy={ty} r={toolHalo.r} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2} opacity={toolHalo.op * 0.8} style={{filter: 'drop-shadow(0 0 8px rgba(102,45,248,.8))'}} /> : null}
          </svg>
        ) : null}

        {/* 环上循环光点（整段持续） */}
        {orbits.map((t, i) =>
          t < 0 ? null : (
            <React.Fragment key={i}>
              <div
                style={{
                  position: 'absolute',
                  left: CX + R * Math.cos((-90 + 360 * t) * (Math.PI / 180)) - 4.5,
                  top: CY + R * Math.sin((-90 + 360 * t) * (Math.PI / 180)) - 4.5,
                  width: 9,
                  height: 9,
                  borderRadius: 5,
                  background: WHITE,
                  boxShadow: '0 0 12px 4px rgba(102,45,248,.85)',
                }}
              />
            </React.Fragment>
          ),
        )}

        {/* 环心 Agent */}
        <GlitchIn N={N} f0={15145} rgbSplit={4} slices={4} seed={61}>
          <CText
            cx={CX}
            cy={CY}
            size={96}
            family={FONT_WIDE}
            weight={400}
            color={WHITE}
            letterSpacing={2}
            shadow={`3px 3px 0 ${PURPLE}, 0 0 28px rgba(102,45,248,.55)`}
            style={{transform: `translate(-50%,-50%) scale(${((0.82 + 0.18 * agentS) * agentPulse).toFixed(4)})`, transformOrigin: '50% 50%'}}
          >
            Agent
          </CText>
        </GlitchIn>
      </CameraRig>
    </div>
  );
};
