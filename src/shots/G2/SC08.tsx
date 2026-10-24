import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {ChefIcon} from '../../icons';
import {PURPLE, PURPLE_LIGHT, WHITE, GREY_MID, GREY_LINE, Pill, SoftIn, Svg, exitOp, glowOffK, mixHex, softOp} from '../../ui';
import {FONT_HEAVY, GlitchIn, clamp01, powOutRemain} from '../../common';
import {BarChartIcon, BraceProp, EnvelopeIcon, FlowDot} from './parts';

/**
 * SC08 三种厨师｜1893–2078｜「有的厨师负责写代码，有的厨师负责分析数据，有的厨师负责处理邮件。」
 * 主角：三个 180px 厨师（横排 300/640/980）——一组三胞胎，紫光只跟着当前被讲到的那一个移动。
 * 配角：顶部道具（花括号 / 柱状图 / 信封）、脚下 Pill、272px 宽的横向虚线 + 循环光点。
 * 节拍：1901/1953/2010 依次点亮；三枚 Pill 与道具随各自的句子落下。
 * 唯一 GlitchIn：1901「写代码」（白名单内；另两枚用 SoftIn，遵守「每镜头至多一处」）。
 * 持续动作：横向光点每 90 帧从左跑到右；紫光在 1949–1961、2006–2018 两段平移到下一个厨师。
 */
const F0 = 1893;
const TO = 2078;

const CHEFS = [
  {x: 300, entry: 1895, pill: 1901, prop: 1901, label: '写代码'},
  {x: 640, entry: 1897, pill: 1953, prop: 1953, label: '分析数据'},
  {x: 980, entry: 1899, pill: 2010, prop: 2010, label: '处理邮件'},
];

const ROW_Y = 360;
const DASH_Y = 472;
// 每个厨师被讲到的瞬间，各给一次 10 帧短紫闪（紫只叠在当前重点上）
const FOCUS_F = [1901, 1953, 2010];

export const SC08: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 紫光焦点：300 → 640 → 980（两段 12 帧平移）
  const glowX = N < 1949 ? 300 : N < 1961 ? 300 + 340 * clamp01((N - 1949) / 12) : N < 2006 ? 640 : N < 2018 ? 640 + 340 * clamp01((N - 2006) / 12) : 980;
  const glowK = clamp01((N - 1900) / 10) * off;

  const f1 = 1 - clamp01((N - 1949) / 11);
  const f2 = clamp01((N - 1949) / 11) * (1 - clamp01((N - 2006) / 11));
  const f3 = clamp01((N - 2006) / 11);
  const focus = [f1, f2, f3];

  // 虚线从 1891 起笔：镜头首帧 1893 已有约 86px 可见，避免空场
  const lineP = clamp01((N - 1891) / 20);
  const dotT = ((((N - 1917) % 90) + 90) % 90) / 90;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 横向虚线（先画，压在厨师与 Pill 下方） */}
      <Svg bloom={false}>
        {lineP > 0 && (
          <>
            <line x1={210} y1={DASH_Y} x2={210 + 860 * lineP} y2={DASH_Y} stroke={GREY_LINE} strokeWidth={1.3} strokeDasharray="7 9" />
            {lineP > 0.92 && (
              <>
                <path d={`M210 ${DASH_Y - 6}V${DASH_Y + 6}`} stroke={GREY_LINE} strokeWidth={1.6} />
                <path d={`M1070 ${DASH_Y - 6}V${DASH_Y + 6}`} stroke={GREY_LINE} strokeWidth={1.6} />
              </>
            )}
          </>
        )}
      </Svg>
      {N >= 1917 && <FlowDot cx={210 + 860 * dotT} cy={DASH_Y} r={2.8} />}

      {/* 主角：当前厨师身上的一处紫柔光（平移），三枚厨师本体不各自发光 */}
      <GlowBlob cx={glowX} cy={ROW_Y} r={158} N={N} k={glowK} alpha={0.26} />

      {/* 三个厨师 */}
      {CHEFS.map((c, i) => {
        const n = N - c.entry;
        if (n < 0) return null;
        const s = 0.85 + 0.15 * clamp01(n / 21);
        const op = softOp(n, 10);
        const k = focus[i];
        const color = mixHex(GREY_MID, WHITE, k);
        const accent = mixHex(GREY_MID, PURPLE, k);
        // 短紫闪（分镜「各配短紫闪」）：在该厨师被讲到的 10 帧内叠一层紫描边，紫不落到配角身上
        const flashN = N - FOCUS_F[i];
        const flash = flashN >= 0 && flashN < 10 ? Math.sin((flashN / 10) * Math.PI) : 0;
        return (
          <div key={c.x} style={{position: 'absolute', inset: 0, opacity: op, transform: `scale(${s.toFixed(3)})`, transformOrigin: `${c.x}px ${ROW_Y}px`}}>
            <ChefIcon cx={c.x} cy={ROW_Y} size={180} color={color} accent={accent} />
            {flash > 0 && <ChefIcon cx={c.x} cy={ROW_Y} size={180} color={PURPLE_LIGHT} accent={WHITE} opacity={flash * 0.75} />}
          </div>
        );
      })}

      {/* 顶部道具：{ } / 柱状图 / 信封 */}
      {CHEFS.map((c, i) => {
        const n = N - c.prop;
        if (n < 0) return null;
        const dy = 34 * powOutRemain(n, 16, 2.5);
        return (
          <div key={`prop-${c.x}`} style={{position: 'absolute', inset: 0, opacity: softOp(n, 8), transform: `translateY(${dy.toFixed(2)}px)`}}>
            {i === 0 && <BraceProp cx={c.x} cy={210} size={62} color={WHITE} />}
            {i === 1 && <BarChartIcon cx={c.x} cy={210} size={60} color={WHITE} accent={GREY_MID} />}
            {i === 2 && <EnvelopeIcon cx={c.x} cy={210} size={60} color={WHITE} accent={GREY_MID} />}
          </div>
        );
      })}

      {/* 脚下 Pill：第一枚用唯一 GlitchIn，另两枚 SoftIn */}
      {CHEFS.map((c, i) => {
        if (i === 0) {
          return (
            <GlitchIn key="pill-0" N={N} f0={c.pill} rgbSplit={5} slices={6} seed={3}>
              <Pill x={c.x - 80} y={482} w={160} h={46} text={c.label} fontSize={26} weight={700} family={FONT_HEAVY} fill="#000" stroke={WHITE} sw={2} letterSpacing={1} />
            </GlitchIn>
          );
        }
        return (
          <SoftIn key={`pill-${i}`} N={N} f0={c.pill} len={12} dy={20}>
            <Pill x={c.x - 80} y={482} w={160} h={46} text={c.label} fontSize={26} weight={700} family={FONT_HEAVY} fill="#000" stroke={WHITE} sw={2} letterSpacing={1} />
          </SoftIn>
        );
      })}
    </div>
  );
};
