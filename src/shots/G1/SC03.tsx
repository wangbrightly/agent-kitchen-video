import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {BrainIcon} from '../../icons';
import {
  Box,
  CText,
  LineArrow,
  PURPLE,
  PURPLE_DEEP,
  PURPLE_LIGHT,
  GREY,
  GREY_LIGHT,
  WHITE,
  Svg,
  SoftIn,
  abs,
  exitOp,
  glowOffK,
  mixHex,
  scaleIn,
  softOp,
} from '../../ui';
import {FONT_WIDE, GlitchIn, clamp01, powOutRemain} from '../../common';
import {linePoint} from './parts';

/**
 * SC03 颅顶打开的 LLM｜489–840｜「掀开颅顶，里面是个 LLM——大语言模型。它能理解要求、分析问题、做判断，最后想出下一步怎么做。」
 * 主角：脑 BrainIcon 300（唯一大体积主体，双层紫柔光）；608 起由灰转白，accent 转紫。
 * 配角：剖切弧 155r、三枚动作标签（160×46 黑底白边）+ 引线 + 40 帧循环光点、右下「下一步」紫箭头。
 * 唯一 GlitchIn：LLM（608，白字 + 6px 紫硬投影）。无 LightSweep / StageLine / GhostText。
 * 持续动作：三根引线各有光点循环（每 40 帧一趟）；箭头 771 起 16 帧画完。
 */
const F0 = 489;
const TO = 840;

const LABELS = [
  {text: '理解要求', cx: 330, cy: 390, f0: 695},
  {text: '分析问题', cx: 960, cy: 300, f0: 736},
  {text: '做判断', cx: 960, cy: 480, f0: 754},
];

// 引线：脑缘 152 → 标签中心前 84（落在盒边）
const linkOf = (cx: number, cy: number) => {
  const dx = cx - 640;
  const dy = cy - 390;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L;
  const uy = dy / L;
  return {sx: 640 + ux * 152, sy: 390 + uy * 152, ex: cx - ux * 84, ey: cy - uy * 84};
};

export const SC03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const bN = N - 492;
  const bS = scaleIn(bN, 21);
  // 546「灰色的大脑」：从 408 升到 390，14 帧
  const rise = 18 * powOutRemain(N - 546, 14, 2.5);
  // 608 LLM：脑由灰转白、accent 转紫，11 帧
  const llmK = clamp01((N - 608) / 11);
  const brainColor = mixHex(GREY_LIGHT, WHITE, llmK);
  const brainAccent = mixHex(GREY, PURPLE, llmK);

  const off = glowOffK(N, TO, 6, 8);
  const glowK = clamp01(bN / 10) * (0.62 + 0.38 * llmK) * off;

  // 颅顶剖切弧：497 起 14 帧 draw-on（r=155，200°→340° 顶部弧，弧长 ≈379）
  const arcP = clamp01((N - 497) / 14);
  const arcOp = softOp(N - 497, 6) * (1 - 0.55 * clamp01((N - 608) / 18));
  const ARC_LEN = 379;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 剖切弧 */}
      <Svg opacity={arcOp}>
        <path
          d="M494.4 337 A155 155 0 0 1 785.6 337"
          fill="none"
          stroke={WHITE}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={ARC_LEN}
          strokeDashoffset={ARC_LEN * (1 - arcP)}
        />
      </Svg>

      {/* 主角：脑（300，双层紫柔光） */}
      {bN >= 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: clamp01(0.15 + 1.4 * bS),
            transform: `translateY(${rise.toFixed(2)}px) scale(${bS.toFixed(3)})`,
            transformOrigin: '640px 390px',
          }}
        >
          <GlowBlob cx={640} cy={390} r={252} N={N} k={glowK} alpha={0.2} />
          <GlowBlob cx={640} cy={390} r={152} N={N} k={glowK} alpha={0.28} />
          <BrainIcon cx={640} cy={390} size={300} color={brainColor} accent={brainAccent} />
        </div>
      )}

      {/* 三根引线（draw-on 16 帧） */}
      <Svg bloom={false}>
        {LABELS.map((L) => {
          const {sx, sy, ex, ey} = linkOf(L.cx, L.cy);
          const p = clamp01((N - L.f0) / 16);
          return p > 0 ? <line key={L.text} x1={sx} y1={sy} x2={sx + (ex - sx) * p} y2={sy + (ey - sy) * p} stroke={GREY_LIGHT} strokeWidth={1.5} opacity={0.72} /> : null;
        })}
      </Svg>

      {/* 引线光点：每 40 帧一趟；标签落定后出现 */}
      {LABELS.map((L) => {
        const {sx, sy, ex, ey} = linkOf(L.cx, L.cy);
        const t0 = L.f0 + 16;
        if (N < t0) return null;
        const t = ((N - t0) % 40) / 40;
        const [dx, dy] = linePoint(sx, sy, ex, ey, t);
        return (
          <React.Fragment key={L.text}>
            {/* 标签端 6px 紫点 */}
            <div style={{...abs(ex - 3, ey - 3, 6, 6), borderRadius: 3, background: PURPLE_LIGHT, opacity: 0.9}} />
            {/* 沿引线跑的光点 */}
            <div style={{...abs(dx - 2.4, dy - 2.4, 4.8, 4.8), borderRadius: 3, background: '#FFFFFF', boxShadow: '0 0 8px 2px rgba(102,45,248,.8)'}} />
          </React.Fragment>
        );
      })}

      {/* 三枚动作标签：各自对齐字幕块起始帧，slideUp 16 帧 */}
      {LABELS.map((L) => (
        <SoftIn key={L.text} N={N} f0={L.f0} len={16} dy={40}>
          <Box x={L.cx - 80} y={L.cy - 23} w={160} h={46} r={8} fill="#000" stroke={WHITE} sw={2} />
          <CText cx={L.cx} cy={L.cy} size={26} weight={600} color={WHITE} letterSpacing={1}>
            {L.text}
          </CText>
        </SoftIn>
      ))}

      {/* 顶部：唯一 GlitchIn —— LLM */}
      <GlitchIn N={N} f0={608} rgbSplit={5} slices={6} seed={7}>
        <CText cx={620} cy={168} size={120} family={FONT_WIDE} weight={400} color={WHITE} letterSpacing={2} shadow={`6px 6px 0 ${PURPLE_DEEP}, 0 0 26px rgba(102,45,248,.45)`}>
          LLM
        </CText>
      </GlitchIn>
      {/* 缩写展开：英文小字挂在大字右上方，不重复字幕已说的「大语言模型」 */}
      <SoftIn N={N} f0={653} len={10} dy={10}>
        <CText cx={946} cy={172} size={20} weight={500} color={GREY} letterSpacing={1}>
          Large Language Model
        </CText>
      </SoftIn>

      {/* 右下「下一步」箭头：771 起 16 帧画完（787 落位，留 30+ 帧稳定期） */}
      <Svg bloom={false}>
        <LineArrow x0={760} y0={565} x1={880} y1={565} p={clamp01((N - 771) / 16)} rodW={3} headL={18} headW={22} color={PURPLE_LIGHT} />
      </Svg>
    </div>
  );
};
