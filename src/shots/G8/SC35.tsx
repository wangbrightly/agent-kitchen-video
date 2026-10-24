import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {ArrowH, Box, GREY, GREY_LIGHT, GREY_LINE, PURPLE_DEEP, PURPLE_LIGHT, WHITE, exitOp, glowOffK, mixHex, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, easeInOutPow} from '../../common';

/**
 * SC35 四个自动｜8571–8856（286 帧）
 * 字幕：8579 比如 / 8608 文件保存时 / 8645 自动备份 / 8682 代码提交时 / 8716 自动测试 /
 *       8756 温度过高时 / 8790 自动报警
 *
 * 四行「条件 → 动作」竖排：左边灰条件、右边紫动作，中间箭头 draw-on。
 * 四行 2 帧错峰 slideUp（8576 起）；之后按字幕节拍逐行点亮：条件行亮 → 箭头长出来 → 动作格变紫。
 * 第四行（新邮件 → 附件）没有专属字幕块，作为收尾的第四个例子在 8793（"自动报警"后 3 帧）补上，正好接 SC36 的邮件开场。
 * 持续动作：每条已画出的箭头上都有一颗光点循环跑（周期 40 帧、相位错开）——"每次条件发生就有一条命令跑过去"。
 * 主角：四行组 620 宽；光：当前动作格的紫柔光（同时只亮一处）。
 */
const F0 = 8571;
const TO = 8856;

const ROWS = [
  {cond: '文件保存', act: '备份', y: 260, condAt: 8608, arrowAt: 8612, actAt: 8645},
  {cond: '代码提交', act: '测试', y: 340, condAt: 8682, arrowAt: 8686, actAt: 8716},
  {cond: '温度过高', act: '报警', y: 420, condAt: 8756, arrowAt: 8760, actAt: 8790},
  {cond: '新邮件', act: '附件', y: 500, condAt: 8793, arrowAt: 8797, actAt: 8813},
];

const H = 62; // 行高
const COND = {x: 330, w: 320};
const ACT = {x: 800, w: 150};
const ARROW = {x: 662, w: 128};
const ROW_IN = 8576; // 四行入场起点（2 帧错峰）

/** 行内左对齐文字（CText 是居中排版，表格里要左对齐，所以单独写一个） */
const LeftText: React.FC<{x: number; cy: number; size: number; color: string; opacity?: number; children: React.ReactNode}> = ({x, cy, size, color, opacity = 1, children}) => (
  <div style={{position: 'absolute', left: x, top: cy - size * 0.62, height: size * 1.3, lineHeight: `${(size * 1.3).toFixed(1)}px`, whiteSpace: 'nowrap', fontFamily: FONT_HEAVY, fontWeight: 700, fontSize: size, color, opacity, letterSpacing: 2}}>{children}</div>
);

export const SC35: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);
  const headOp = softOp(N - ROW_IN, 10);

  // 当前行：最后一个已点亮的动作
  const lastAct = ROWS.reduce((acc, r, i) => (N >= r.actAt ? i : acc), -1);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* ===== 列头 ===== */}
      {headOp > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: headOp}}>
          <LeftText x={COND.x + 22} cy={190} size={24} color={GREY}>
            条件
          </LeftText>
          <LeftText x={ACT.x + 16} cy={190} size={24} color={GREY}>
            动作
          </LeftText>
          <div style={{position: 'absolute', left: 330, top: 214, width: 620 * easeInOutPow(2)(clamp01((N - ROW_IN) / 18)), height: 1.6, background: GREY_LINE, opacity: 0.6}} />
        </div>
      )}

      {/* ===== 四行 ===== */}
      {ROWS.map((r, i) => {
        const inN = N - (ROW_IN + i * 2);
        if (inN < 0) return null;
        const op = softOp(inN, 10);
        const dy = 18 * (1 - op);

        const condOn = softOp(N - r.condAt, 9);
        const arrowP = clamp01((N - r.arrowAt) / 14);
        // 后一行点亮之后，前一行退到 0.55（仍然亮着，但不再是当前重点）
        const nextAct = i + 1 < ROWS.length ? ROWS[i + 1].actAt : 99999;
        const actK = softOp(N - r.actAt, 6) * (1 - 0.45 * softOp(N - nextAct, 14));
        const isLast = lastAct === i;

        const cy = r.y + H / 2;

        return (
          <div key={r.cond} style={{position: 'absolute', inset: 0, opacity: op, transform: `translateY(${dy.toFixed(2)}px)`}}>
            {/* 条件（灰） */}
            <Box x={COND.x} y={r.y} w={COND.w} h={H} r={8} fill="rgba(0,0,0,0.5)" stroke={mixHex(GREY_LINE, GREY_LIGHT, condOn)} sw={1.6} />
            <LeftText x={COND.x + 22} cy={cy} size={28} color={mixHex(GREY, GREY_LIGHT, condOn)}>
              {r.cond}
            </LeftText>

            {/* 箭头 */}
            {arrowP > 0 && <ArrowH x={ARROW.x} y={cy - 13} w={ARROW.w} h={27} p={arrowP} color={mixHex(GREY_LIGHT, PURPLE_LIGHT, actK)} shaft={2.6} />}

            {/* 动作（紫） */}
            <Box x={ACT.x} y={r.y} w={ACT.w} h={H} r={8} fill={actK > 0.4 ? 'rgba(38,16,86,0.7)' : 'rgba(0,0,0,0.5)'} stroke={mixHex(PURPLE_DEEP, PURPLE_LIGHT, actK)} sw={1.8} glow={actK > 0.15 ? `0 0 18px 3px rgba(102,45,248,${(0.45 * actK).toFixed(2)})` : undefined} />
            <LeftText x={ACT.x + 16} cy={cy} size={28} color={mixHex(GREY_LIGHT, PURPLE_LIGHT, actK)}>
              {r.act}
            </LeftText>

            {/* 当前行的动作格柔光（一帧只有这一处重点光） */}
            {isLast && <GlowBlob cx={ACT.x + 62} cy={cy} r={98} k={actK * off} alpha={0.3} />}

            {/* 箭头上循环跑的光点：条件发生 → 动作执行 */}
            {arrowP >= 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: ARROW.x + 4 + 118 * (((N - r.arrowAt) % 40) / 40),
                  top: cy - 3,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  background: WHITE,
                  opacity: 0.55 + 0.45 * actK,
                  boxShadow: '0 0 10px 3px rgba(102,45,248,.8)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
