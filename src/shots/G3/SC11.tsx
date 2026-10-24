import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, type CamKey} from '../../fx';
import {GREY, GREY_LIGHT, GREY_LINE, GREY_MID, PURPLE_LIGHT, WHITE, exitOp, glowOffK, mixHex, softOp} from '../../ui';
import {clamp01} from '../../common';
import {GhostHand, JobSheet} from './parts';

/**
 * SC11 纸上写着什么｜2610–2910｜「这相当于智能体的系统提示词。它决定了厨师的身份、目标和工作边界。
 * 但只有岗位说明，厨师仍然做不了多少事。」
 * 主角：同一张岗位说明纸，推到 320 宽 + 30 帧推近 1.0→1.12；2695/2739 两拍各再贴近一档，尾段 1.20。
 * 配角：页脚「系统提示词」、四行 12 帧错峰打字机（3 帧/字）+ 每行左侧紫勾、未写到的行浅灰光标闪、
 *       纸右侧一只虚线的手（2835，想拿却拿不到）。
 * 持续动作：打字机贯穿 2621–2691；2798 整纸转灰 + 后退半档；无第二个 GlitchIn / 无扫光。
 */
const F0 = 2610;
const TO = 2910;

const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 2640, x: 640, y: 360, s: 1.12},
  {f: 2695, x: 640, y: 360, s: 1.12},
  {f: 2711, x: 640, y: 360, s: 1.16}, // 「身份」：再贴近一档
  {f: 2739, x: 640, y: 360, s: 1.16},
  {f: 2755, x: 640, y: 360, s: 1.2}, // 「目标和工作边界」：再贴近一档
  {f: TO, x: 640, y: 360, s: 1.2},
];

// 四行内容：与分镜表逐字一致（第 4 行为 11 字，320 宽纸内单行可容）
const ROWS = ['你是谁', '你负责什么', '应该遵守哪些规则', '遇到问题时优先怎么处理'];
const TYPE_AT = [2621, 2640, 2652, 2664]; // 首行贴块首（2618 +3），其余 12 帧错峰
const CH_F = 3; // 每字 3 帧
const CHECK_AT = TYPE_AT.map((t, i) => t + ROWS[i].length * CH_F + 5);

export const SC11: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // 纸的柔光：入场亮起，2798 转灰时压暗，离场前熄灭
  const dim = clamp01((N - 2798) / 11);
  const glowK = clamp01((N - F0) / 12) * (1 - 0.85 * dim) * glowOffK(N, TO, 6, 8);

  // 页脚「系统提示词」：对齐首块 2618
  const footOp = softOp(N - 2618, 10);

  // 行高亮：2695 第 1 行 / 2739 第 2、3 行（紫线画出，到下一点亮时退回灰）
  const h0 = clamp01((N - 2695) / 11) * (1 - clamp01((N - 2739) / 11));
  const hMid = clamp01((N - 2739) / 11) * (1 - clamp01((N - 2798) / 11));

  const rows = ROWS.map((text, i) => {
    const start = TYPE_AT[i];
    const chars = clamp01((N - start) / (text.length * CH_F)) * text.length;
    const notStarted = N < start;
    const blink = notStarted && (N - 2618) % 12 < 7 && N >= 2618;
    const hl = i === 0 ? h0 : i === 1 || i === 2 ? hMid : 0;
    const lineColor = mixHex(GREY_LINE, PURPLE_LIGHT, hl * (1 - dim));
    return {
      text,
      chars,
      cursor: blink,
      lineP: 1,
      lineColor,
      check: N >= CHECK_AT[i] ? clamp01((N - CHECK_AT[i]) / 8) : 0,
      checkColor: mixHex(PURPLE_LIGHT, GREY_MID, dim),
      textColor: mixHex(WHITE, GREY, dim),
    };
  });

  // 虚线的手：2835 起 14 帧淡入并上浮到纸边
  const handN = N - 2835;
  const handOp = softOp(handN, 12) * (1 - 0.25 * clamp01((N - 2860) / 40));
  const handDy = 16 * (1 - clamp01(handN / 14));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        {/* 2798「但只有岗位说明」：整纸后退半档（下沉 6px + 缩小 4% + 压暗），把画面让给下一拍的虚线手 */}
        <div style={{position: 'absolute', inset: 0, opacity: 1 - 0.42 * dim, transform: `translateY(${(6 * dim).toFixed(2)}px) scale(${(1 - 0.04 * dim).toFixed(4)})`, transformOrigin: '640px 365px'}}>
          <JobSheet
            cx={640}
            cy={365}
            w={320}
            h={400}
            color={mixHex(PURPLE_LIGHT, GREY_LIGHT, dim)}
            glowK={glowK}
            title="岗位说明"
            titleOp={1}
            titleUnderline={1}
            rows={rows}
            rowY={[104, 174, 244, 314]}
            footerY={372}
            footer={{text: '系统提示词', op: footOp, color: mixHex(PURPLE_LIGHT, GREY, dim)}}
            stamp={{s: 1, op: 1, color: mixHex(PURPLE_LIGHT, GREY_MID, dim)}}
          />
        </div>

        {/* 只在纸右侧：虚线的手（拿到之前，先停在这里） */}
        {handN >= 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: handOp, transform: `translateY(${handDy.toFixed(2)}px)`}}>
            <GhostHand cx={905} cy={430} size={120} color={GREY} />
          </div>
        )}
      </CameraRig>
    </div>
  );
};
