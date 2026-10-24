import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GREY_LINE, PURPLE_LIGHT, exitOp, glowOffK, mixHex, softOp} from '../../ui';
import {clamp01, powOutRemain} from '../../common';
import {JobSheet} from './parts';

/**
 * SC10 一张岗位说明｜2288–2609｜「每个岗位都有一张岗位说明：你是谁、你负责什么、应该遵守哪些规则、
 * 遇到问题时优先怎么处理。」
 * 主角：一张 340×390 的岗位说明纸（紫描边 + 柔光），自下升起。
 * 配角：标题下划线、右上角印章（每 45 帧轻压一次）、四条待填的空横线（逐条 wipe）+ 浅灰光标。
 * 持续动作：纸内笔尖随划线走；无运镜、无扫光 / 舞台线 / 预示字。
 * 出现帧：2290 纸（首块 2296 的 −6）/ 2339 标题线 + 首次盖章 / 2399 光标 / 2415·2438·2476·2521 四条线。
 */
const F0 = 2288;
const TO = 2609;

// 四条横线的 wipe 起始帧（对齐「你是谁 / 你负责什么 / 应该遵守哪些规则 / 遇到问题时」）
const LINE_AT = [2415, 2438, 2476, 2521];
// 光标出现在对应横线 wipe 之前的窗口
const CURSOR_WIN: Array<[number, number]> = [
  [2399, 2415],
  [2415, 2438],
  [2438, 2476],
  [2476, 2521],
];
// 印章轻压：2339 起每 45 帧一次
const STAMPS = [2339, 2384, 2429, 2474, 2519];

export const SC10: React.FC = () => {
  const N = useCurrentFrame() + F0;

  const enterN = N - 2290;
  const dy = 90 * powOutRemain(enterN, 22, 2.5);
  const op = softOp(enterN, 12);
  const glowK = clamp01(enterN / 12) * glowOffK(N, TO, 6, 8);

  // 标题下划线：2339 起 12 帧画完
  const titleLine = clamp01((N - 2339) / 12);

  // 盖章：按下 3 帧、回弹 7 帧
  const pressAt = STAMPS.reduce((acc, at) => {
    const d = N - at;
    if (d < 0) return acc;
    const k = d < 3 ? d / 3 : Math.max(0, 1 - (d - 3) / 7);
    return Math.max(acc, k);
  }, 0);
  const stampS = 1 - 0.16 * pressAt;
  const stampOp = clamp01((enterN - 4) / 8);
  // 纸的“受印”下沉：印章压下时整张纸跟着下沉一点，回弹时复位（物理反应，不是常驻呼吸）
  const dip = 7 * pressAt;

  // 第四条线 2553 起转紫（「优先怎么处理」的落点）
  const lastPurple = clamp01((N - 2553) / 11);

  const rows = LINE_AT.map((at, i) => {
    const [c0, c1] = CURSOR_WIN[i];
    const blinkOn = N >= c0 && N < c1 && (N - c0) % 12 < 7;
    return {
      lineP: clamp01((N - at) / (i === 3 ? 14 : 6)),
      lineColor: i === 3 ? mixHex(GREY_LINE, PURPLE_LIGHT, lastPurple) : GREY_LINE,
      cursor: blinkOn,
    };
  });

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <div style={{position: 'absolute', inset: 0, opacity: op, transform: `translateY(${(dy + dip).toFixed(2)}px)`}}>
        <JobSheet
          cx={640}
          cy={350}
          w={260}
          h={360}
          glowK={glowK}
          opacity={1}
          title="岗位说明"
          titleOp={1}
          titleUnderline={titleLine}
          rows={rows}
          rowY={[116, 186, 256, 326]}
          stamp={{s: stampS, op: stampOp}}
        />
      </div>

      {/* 纸下的淡淡投影线，让纸“放”在台面上（静态，不呼吸） */}
      <div
        style={{
          position: 'absolute',
          left: 640 - 130,
          top: 536,
          width: 260,
          height: 2,
          background: '#2A2A2A',
          opacity: 0.55 * op,
          transform: `translateY(${(dy + dip).toFixed(2)}px)`,
        }}
      />
    </div>
  );
};
