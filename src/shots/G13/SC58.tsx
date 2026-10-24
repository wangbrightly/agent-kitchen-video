import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ChefIcon} from '../../icons';
import {Box, GREY_LIGHT, GREY_LINE, PURPLE_LIGHT, WHITE, abs, exitOp, glowOffK, mixHex, slideUp, softOp} from '../../ui';
import {clamp01, easeInOutPow, FONT_HEAVY} from '../../common';
import {FIVE, RoleRow, RoleSlot, ROLES} from './parts';

/**
 * SC58 各行职责｜14255–14524（270 帧）
 * 承接 G12-SC57：左侧厨师缩略 150 @ (330,375) + 「Agent」胶囊；右侧五行清单首行「大脑 · 负责思考」已在场。
 * 后四行按字幕节拍补上（工具/技能/记忆/岗位），每行左侧图标 8 帧亮起；
 * 五行左侧一条竖线自上而下生长，最后接到第五行（14260 → 14433）。
 * 节拍：14263 工具 / 14275 负责行动 / 14310 技能 / 14317 负责遵循流程 /
 *       14362 记忆 / 14371 负责保留信息 / 14413 岗位 / 14441 负责规定身份和边界
 * 停留：末行 14435 落位、末句 14450 写完 → 14516 起离场（66 帧）。
 */
const F0 = 14255;
const TO = 14524;

const ROW_BEATS = [0, 14263, 14310, 14362, 14413]; // 第一行承接上一镜，无入场
const CLAUSE_BEATS = [0, 14275, 14317, 14371, 14441];

const ease = easeInOutPow(1.7);

export const SC58: React.FC = () => {
  const N = useCurrentFrame() + F0;
  // 灭光提前到 14502–14508：留出末尾纯停帧（14508 之后只剩 8 帧 exitOp，末拍才量得到停留）
  const off = glowOffK(N, TO, 6, 16);

  // 当前行：本行出现时 8 帧亮紫，下一行出现前 8 帧退回白（一帧只有一处紫）
  const lit = (i: number) => {
    if (i === 0) return (1 - clamp01((N - 14263) / 8)) * off;
    const next = ROW_BEATS[i + 1] ?? 99999;
    return clamp01((N - ROW_BEATS[i]) / 8) * (1 - clamp01((N - next) / 8)) * off;
  };

  // 竖线：自上而下生长，14433 接到最后一行
  const grow = ease(clamp01((N - 14260) / 173));
  const endY = FIVE.spineTop + (FIVE.spineBottom - FIVE.spineTop) * grow;
  const lineC = mixHex(GREY_LINE, PURPLE_LIGHT, 0.35 + 0.4 * (1 - clamp01((N - 14441) / 40)));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 左：厨师缩略 + Agent 胶囊（SC57 的落点，作为「一位厨师」的锚） */}
      <ChefIcon cx={330} cy={375} size={150} color={WHITE} accent={GREY_LIGHT} />
      <Box x={330 - 60} y={448} w={120} h={40} r={20} fill="rgba(0,0,0,0.7)" stroke={GREY_LINE} sw={1.6} />
      <div style={{...abs(270, 457, 120, 26), textAlign: 'center', fontFamily: FONT_HEAVY, fontWeight: 700, fontSize: 26, lineHeight: '26px', letterSpacing: 1, color: GREY_LIGHT}}>Agent</div>

      {/* 五行之间的竖向连接线（在行框左侧，逐行接上） */}
      {N >= 14260 ? (
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <line x1={FIVE.spineX} y1={FIVE.spineTop} x2={FIVE.spineX} y2={endY} stroke={lineC} strokeWidth={2.2} strokeLinecap="round" />
          {FIVE.rows.map((top, i) =>
            N >= ROW_BEATS[i] ? <line key={i} x1={FIVE.spineX} y1={top} x2={FIVE.spineX + 18} y2={top} stroke={lineC} strokeWidth={1.8} opacity={0.85} /> : null,
          )}
          {grow < 0.998 ? <circle cx={FIVE.spineX} cy={endY} r={4.2} fill={PURPLE_LIGHT} style={{filter: 'drop-shadow(0 0 6px rgba(102,45,248,.9))'}} /> : null}
        </svg>
      ) : null}

      {/* 尚未填上的四行：SC57 的灰色虚线占位条，行出现后 8 帧退掉 */}
      {[1, 2, 3, 4].map((i) => {
        const op = 1 - clamp01((N - ROW_BEATS[i]) / 8);
        return op > 0.01 ? <RoleSlot key={i} top={FIVE.rows[i]} opacity={op} /> : null;
      })}

      {/* 五行 */}
      {ROLES.map((r, i) => {
        if (i > 0 && N < ROW_BEATS[i]) return null;
        const n = i === 0 ? 999 : N - ROW_BEATS[i];
        const clauseN = N - CLAUSE_BEATS[i];
        return (
          <RoleRow
            key={r.key}
            kind={r.key}
            top={FIVE.rows[i]}
            lit={lit(i)}
            opacity={i === 0 ? 1 : softOp(n, 8)}
            clauseOp={i === 0 ? 1 : softOp(clauseN, 9)}
            offsetY={i === 0 ? 0 : slideUp(n, 26, 14)}
          />
        );
      })}
    </div>
  );
};
