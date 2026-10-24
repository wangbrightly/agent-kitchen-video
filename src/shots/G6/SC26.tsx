import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GlowBlob, type CamKey} from '../../fx';
import {GREY_LINE, PURPLE, PURPLE_LIGHT, exitOp, glowOffK, softOp} from '../../ui';
import {clamp01, easeInOutPow} from '../../common';
import {AxisNote, TickLabel, WarnTriangle} from './parts';

/**
 * SC26 跨时间｜6355–6624｜「记忆保存的是 / 跨时间仍然有用的信息 / 今天知道的事 / 明天还能继续使用 / 但记忆也可能出错」
 * 横向时间轴 y382（今天→明天→后天），四张小纸贴在轴上保持不动；橙只给右端警示三角。
 * 主角：时间轴（720 宽）+ 推进中的光标；紫光跟着光标当前读到的那张便签（开始时停在今天这一端）。
 * 节拍：6363 轴 draw-on 20 帧，四张小纸随轴画到各自位置依次落下（6366/6370/6375/6379）；
 *       6395 运镜右移 60；6475/6510/6559 光标推进到明天/后天；6559 警示三角 11 帧弹出 + 短橙闪
 *       （本镜头唯一负面时刻，橙色只给三角）。
 * 持续动作：光标一路推进并在轴尽头停住，经过的便签依次点亮。
 * 无 GlitchIn；无 LightSweep / StageLine / GhostText。
 */
const F0 = 6355;
const TO = 6624;

const AX = {x0: 290, x1: 1010, y: 382};
const TICKS = [
  {x: 350, text: '今天'},
  {x: 650, text: '明天'},
  {x: 950, text: '后天'},
];
const NOTE_CX = [400, 560, 720, 880];

// 6395→6425：内容整体右移 60（相机 x 640→580），运镜不进末拍
const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 6395, x: 640, y: 360, s: 1},
  {f: 6425, x: 580, y: 360, s: 1},
  {f: TO, x: 580, y: 360, s: 1},
];

const EASE = easeInOutPow(2.2);

export const SC26: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  const axisP = clamp01((N - 6363) / 20);
  const axisW = (AX.x1 - AX.x0) * axisP;

  // 光标：今天 350 等到 6475 → 明天 650（6510）→ 后天 950（6559）→ 轴尽头 1010（6580）停住
  const moveTo = (a: number, b: number, f0: number, f1: number) => a + (b - a) * EASE(clamp01((N - f0) / (f1 - f0)));
  let px = 350;
  if (N >= 6580) px = 1010;
  else if (N >= 6559) px = moveTo(950, 1010, 6559, 6580);
  else if (N >= 6510) px = moveTo(650, 950, 6510, 6559);
  else if (N >= 6475) px = moveTo(350, 650, 6475, 6510);

  const triP = clamp01((N - 6559) / 11);
  const triFlash = N < 6559 ? 0 : N < 6565 ? (N - 6559) / 6 : Math.max(0, 1 - (N - 6565) / 14);

  // 三个刻度的点亮时刻：今天随轴亮，明天 6510，后天 6559
  const litAt = [6363, 6510, 6559];

  // 光标读到哪里，哪张便签整张转紫（±86 的范围、约 3 帧完成切换）；
  // 紫光跟着当前便签走，所以「紫只给当前重点」这条不变
  const noteLit = NOTE_CX.map((cx) => clamp01((86 - Math.abs(cx - px)) / 26));
  const litSum = noteLit.reduce((a, b) => a + b, 0);
  const focusX = litSum > 0.001 ? noteLit.reduce((a, k, i) => a + k * NOTE_CX[i], 0) / litSum : 420;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        {/* 紫光跟着被读到的便签；光标走完、没有便签被读到时光自然熄灭，把画面让给右端的橙色警示 */}
        <GlowBlob cx={focusX} cy={326} r={190} N={N} k={0.7 * Math.min(1, litSum) * clamp01((N - 6363) / 14) * off} alpha={0.17} />

        {/* 时间轴主体 */}
        <div style={{position: 'absolute', left: AX.x0, top: AX.y - 1.5, width: axisW, height: 3, background: GREY_LINE, opacity: 0.9}} />
        {/* 左段紫（今天这一端） */}
        <div style={{position: 'absolute', left: AX.x0, top: AX.y - 1.5, width: Math.min(axisW, 180), height: 3, background: PURPLE, opacity: 0.85}} />
        {/* 轴右端封口 */}
        <div style={{position: 'absolute', left: AX.x1 - 1, top: AX.y - 9 * triP, width: 2, height: 18 * triP, background: GREY_LINE, opacity: 0.75}} />

        {/* 三个刻度 + 标签 */}
        {TICKS.map((t, i) => {
          const p = clamp01((axisP * (AX.x1 - AX.x0) - (t.x - AX.x0)) / 28);
          const lit = clamp01((N - litAt[i]) / 10);
          return <TickLabel key={t.text} x={t.x} y={AX.y} text={t.text} p={p} lit={lit} />;
        })}

        {/* 四张小纸：轴画到哪就落到哪（跟着 draw-on 走），落位后不动 */}
        {NOTE_CX.map((cx, i) => {
          const t = N - (6363 + ((cx - AX.x0) / (AX.x1 - AX.x0)) * 20);
          if (t < 0) return null;
          const p = 1 - Math.pow(1 - clamp01(t / 11), 3);
          return (
            <div key={cx} style={{position: 'absolute', inset: 0, opacity: softOp(t, 5), transform: `translateY(${(-24 * (1 - p)).toFixed(2)}px) scale(${(0.86 + 0.14 * p).toFixed(3)})`, transformOrigin: `${cx}px ${AX.y}px`}}>
              <AxisNote cx={cx} cy={AX.y - 63} lit={noteLit[i]} glowK={0.5 * noteLit[i] * off} />
            </div>
          );
        })}

        {/* 推进光标：轴下方的三角 + 短竖线（持续动作，落到尽头停住） */}
        <div style={{position: 'absolute', left: px - 7, top: AX.y - 1, opacity: axisP > 0 ? 1 : 0}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: `9px solid ${PURPLE_LIGHT}`, filter: 'drop-shadow(0 0 6px rgba(161,117,241,.9))'}} />
          <div style={{position: 'absolute', left: 6, top: 10, width: 2, height: 12, background: PURPLE_LIGHT, opacity: 0.9}} />
        </div>

        {/* 橙：警示三角（本镜头唯一橙色） */}
        <div style={{position: 'absolute', left: 1035 - 150, top: 340 - 150, width: 300, height: 300, borderRadius: 150, background: 'radial-gradient(circle, rgba(240,95,65,.42) 0%, rgba(240,95,65,0) 70%)', opacity: triFlash}} />
        <WarnTriangle cx={1035} cy={340} size={58} p={triP} glowK={triFlash} opacity={1} />
      </CameraRig>
    </div>
  );
};
