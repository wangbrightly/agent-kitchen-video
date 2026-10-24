import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {CText, PURPLE, PURPLE_LIGHT, GREY_LINE, WHITE, abs, exitOp, glowOffK, softOp, slideUp} from '../../ui';
import {GlitchIn, FONT_HEAVY, clamp01} from '../../common';
import {GrowLine} from './parts';

/**
 * SC18 工具解决什么｜4242–4352｜「所以工具解决的是 / 这个智能体能做什么？」
 * 章末短镜头：清场，中央大字「能做什么」96px（白字紫描边 + 柔光），上方一枚小 Pill「Tool」，
 * 左右各一条从远处指向字的细线，光点沿线向字心汇聚（持续动作）。
 * 唯一 GlitchIn：大字（4252，rgbSplit 5）。Pill 在 4306 slideUp（S54 块首 4312 的 −6），4314 落位后停 30 帧离场。
 */
const F0 = 4242;
const TO = 4352;

const TXT = {cx: 640, cy: 390, size: 96};
const LINE_Y = 390;
const L0 = 200; // 左线外端
const L1 = 436; // 左线内端（贴大字左侧）
const R0 = 1080; // 右线外端
const R1 = 844; // 右线内端

// 汇聚光点：每侧两枚、周期 30 帧错开半周期
const DOT_PERIOD = 30;

const Converge: React.FC<{N: number; from: number; to: number; phase: number}> = ({N, from, to, phase}) => {
  const t = (((N - 4266) / DOT_PERIOD + phase) % 1 + 1) % 1;
  if (N < 4266) return null;
  const x = from + (to - from) * t;
  const op = Math.sin(Math.PI * t) * 0.9;
  return <div style={{...abs(x - 3.5, LINE_Y - 3.5, 7, 7), borderRadius: 4, background: WHITE, opacity: op, boxShadow: '0 0 10px 3px rgba(102,45,248,.8)'}} />;
};

export const SC18: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);
  const lineP = clamp01((N - 4250) / 16);
  const glowIn = clamp01((N - 4252) / 14); // 柔光跟着大字一起亮，清场帧不留紫雾
  const pillN = N - 4306;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 大字柔光（主角光） */}
      <GlowBlob cx={TXT.cx} cy={TXT.cy} r={250} N={N} k={0.75 * glowIn * off} alpha={0.16} />
      <GlowBlob cx={TXT.cx} cy={TXT.cy} r={150} N={N} k={0.9 * glowIn * off} alpha={0.2} />

      {/* 左右两条细线（4250 起 16 帧 draw-on） */}
      <GrowLine x0={L0} y0={LINE_Y} x1={L1} y1={LINE_Y} p={lineP} color={GREY_LINE} width={1.5} />
      <GrowLine x0={R0} y0={LINE_Y} x1={R1} y1={LINE_Y} p={lineP} color={GREY_LINE} width={1.5} />

      {/* 汇聚光点 */}
      <Converge N={N} from={L0} to={L1} phase={0} />
      <Converge N={N} from={L0} to={L1} phase={0.5} />
      <Converge N={N} from={R0} to={R1} phase={0} />
      <Converge N={N} from={R0} to={R1} phase={0.5} />

      {/* 唯一 GlitchIn：大字「能做什么」 */}
      <GlitchIn N={N} f0={4252} rgbSplit={5} slices={4} seed={9}>
        <CText
          cx={TXT.cx}
          cy={TXT.cy}
          size={TXT.size}
          weight={900}
          family={FONT_HEAVY}
          color={WHITE}
          letterSpacing={2}
          shadow="0 0 30px rgba(102,45,248,.55)"
          style={{WebkitTextStroke: `2px ${PURPLE}`, paintOrder: 'stroke fill'}}
        >
          能做什么
        </CText>
      </GlitchIn>

      {/* 上方小 Pill「Tool」：4306 slideUp，4314 落位 */}
      {pillN >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(pillN, 6), transform: `translateY(${slideUp(pillN, 26, 8).toFixed(2)}px)`}}>
          <div
            style={{
              ...abs(TXT.cx - 65, 233, 130, 44),
              boxSizing: 'border-box',
              borderRadius: 22,
              border: `2px solid ${PURPLE_LIGHT}`,
              background: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT_HEAVY,
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 1,
              color: WHITE,
              boxShadow: '0 0 18px 4px rgba(102,45,248,.35)',
            }}
          >
            Tool
          </div>
        </div>
      ) : null}
    </div>
  );
};
