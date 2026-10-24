import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {BrainIcon, ChefIcon} from '../../icons';
import {CText, GLOW_PURPLE, GREY_LIGHT, GREY_LINE, GREY_MID, PURPLE, PURPLE_LIGHT, Svg, WHITE, exitOp, softOp, slideUp} from '../../ui';
import {FONT_HEAVY, clamp01, easeInOutPow} from '../../common';
import {AgentPill, accentMix} from './parts';

/**
 * SC57 里面包含｜14085–14254（170 帧）
 * 切到分解图：左侧厨师缩略（210 → 150，14093 起 21 帧移到 (330,375)）+「Agent」胶囊；
 * 中间一道花括号；右侧五行清单，14197 首行「大脑 · 负责思考」slideUp（620 宽，紫）。
 * 14164 花括号 + 五行占位条先出现，14197 首行紫框滑入顶掉第一行占位；
 * 14207「负责思考」落下；其余四行只有灰色占位条在闪（持续动作）。
 * 最后 14246 起 8 帧淡出。
 */
const F0 = 14085;
const TO = 14254;

const ROW = {x: 590, w: 620, h: 64, gap: 76, y0: 250};
const ROWS_Y = [0, 1, 2, 3, 4].map((i) => ROW.y0 + i * ROW.gap);
const F_CHEF = 14093;
const F_PILL = 14112;
const F_LIST = 14164;
const F_ROW1 = 14197;
const F_REASON = 14207;

const ease = easeInOutPow(2.4);

/** 花括号（自左向右开口，指着清单）：从 y218 长到 y586 */
const Brace: React.FC<{p: number; opacity: number}> = ({p, opacity}) => {
  const L = 384;
  const d = 'M566 220 C550 220 556 300 556 372 L540 402 L556 432 C556 504 550 584 566 584';
  return (
    <Svg bloom={false} opacity={opacity}>
      <path d={d} fill="none" stroke={GREY_LIGHT} strokeWidth={1.8} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - clamp01(p))} />
    </Svg>
  );
};

export const SC57: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // 左图：210 @ (700,355) → 150 @ (330,375)
  const e = ease(clamp01((N - F_CHEF) / 21));
  const chefX = 700 + (330 - 700) * e;
  const chefY = 355 + (375 - 355) * e;
  const chefSize = 210 + (150 - 210) * e;
  const chefOp = N < F_CHEF ? 0 : clamp01(0.2 + 1.4 * e);

  // 清单
  const braceP = clamp01((N - F_LIST) / 16);
  const row1N = N - F_ROW1;
  const row1Op = softOp(row1N, 11);
  const row1Rise = slideUp(row1N, 26, 11);
  const iconLit = clamp01((N - F_ROW1 - 4) / 11);
  const reasonOp = softOp(N - F_REASON, 8);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 左：厨师缩略 + Agent 胶囊 */}
      <GlowBlob cx={chefX} cy={chefY - 10} r={chefSize * 0.8} N={N} k={0.55 * chefOp} alpha={0.14} />
      {N >= F_CHEF && (
        <div style={{position: 'absolute', inset: 0, opacity: chefOp}}>
          <ChefIcon cx={chefX} cy={chefY} size={chefSize} color={WHITE} accent={PURPLE_LIGHT} />
        </div>
      )}
      <AgentPill N={N} f={F_PILL} dim={0} x={330} y={468} w={120} h={40} size={26} />

      {/* 中间花括号 */}
      {N >= F_LIST && <Brace p={braceP} opacity={0.75 * clamp01((N - F_LIST) / 8)} />}

      {/* 五行占位条：首行先以占位出现，14197 首行紫框滑入时把它顶掉；
          其余四行错相闪烁，只作为「还有别的」的持续动作 */}
      {[0, 1, 2, 3, 4].map((i) => {
        const f = F_LIST + i * 2;
        const n = N - f;
        if (n < 0) return null;
        const blink = 0.28 + 0.14 * (0.5 + 0.5 * Math.sin((2 * Math.PI * n) / 62 + i * 1.7));
        // 首行占位在首行滑入时让位（交叉 11 帧）
        const yieldToRow1 = i === 0 ? 1 - softOp(N - (F_ROW1 - 3), 5) : 1;
        const y = ROWS_Y[i] - ROW.h / 2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: ROW.x,
              top: y,
              width: ROW.w,
              height: ROW.h,
              boxSizing: 'border-box',
              border: `1px dashed ${GREY_MID}`,
              borderRadius: 10,
              opacity: blink * softOp(n, 8) * yieldToRow1,
            }}
          >
            <div style={{position: 'absolute', left: 22, top: 6, width: 52, height: 52, boxSizing: 'border-box', border: `1px dashed ${GREY_MID}`, borderRadius: 6}} />
            <div style={{position: 'absolute', left: 96, top: 28, width: 180, height: 8, borderRadius: 4, background: GREY_LINE}} />
          </div>
        );
      })}

      {/* 首行：大脑 · 负责思考（620 宽，紫） */}
      {row1N >= 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: row1Op, transform: `translateY(${row1Rise.toFixed(2)}px)`}}>
          {/* 行框 */}
          <div
            style={{
              position: 'absolute',
              left: ROW.x,
              top: ROWS_Y[0] - ROW.h / 2,
              width: ROW.w,
              height: ROW.h,
              boxSizing: 'border-box',
              borderRadius: 10,
              background: 'rgba(48,22,110,.55)',
              border: `1.6px solid ${PURPLE_LIGHT}`,
              boxShadow: GLOW_PURPLE,
            }}
          />
          {/* 内容全部用页面坐标，避免相对行框二次偏移 */}
          <div style={{position: 'absolute', left: ROW.x + 14, top: ROWS_Y[0] - 20, width: 4, height: 40, borderRadius: 2, background: PURPLE}} />
          <BrainIcon cx={ROW.x + 50} cy={ROWS_Y[0]} size={70} color={WHITE} accent={accentMix(iconLit, iconLit)} />
          <CText cx={ROW.x + 130} cy={ROWS_Y[0]} size={42} weight={800} family={FONT_HEAVY} color={WHITE} letterSpacing={2}>
            大脑
          </CText>
          <div style={{position: 'absolute', left: ROW.x + 190, top: ROWS_Y[0] - 3, width: 6, height: 6, borderRadius: 3, background: PURPLE_LIGHT, opacity: 0.85}} />
          <CText cx={ROW.x + 260} cy={ROWS_Y[0]} size={30} weight={600} family={FONT_HEAVY} color={GREY_LIGHT} letterSpacing={2} opacity={reasonOp}>
            负责思考
          </CText>
        </div>
      )}
    </div>
  );
};
