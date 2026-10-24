import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {AlarmIcon, ChefIcon, KnifeIcon} from '../../icons';
import {GREY_LIGHT, PURPLE_LIGHT, Svg, TechSub, WHITE, exitOp, glowOffK, mixHex, scaleIn, softOp} from '../../ui';
import {clamp01, emphasisPulse} from '../../common';
import {PathDot, quadPath} from './parts';

/**
 * SC38 两种唤起｜9398–9562（章末，165 帧）
 * 字幕：9406 有些 Hook 可以直接启动工具 / 9480 有些 Hook / 9504 也可以进一步唤起智能体
 *
 * 正上方一枚 AlarmIcon 200（章末主角，紫柔光），探针末端分出两条分支：
 *   左 → 刀（Tool，直接启动）；右 → 厨师（Agent，再唤起一层）。
 * 分支 16 帧 draw-on（9406 / 9480 两拍分别长），末端图标 11 帧 scaleIn（9412 / 9504）。
 * 持续动作：两条分支上的光点交替跑（周期 70 帧、反相）——"条件一来，命令就沿分支跑下去"。
 * 停留 40 帧（章末落定后再离场）。
 */
const F0 = 9398;
const TO = 9562;

const DEV = {cx: 640, cy: 268, size: 200};
const ORIGIN = {x: 640, y: 352}; // 探针末端（局部 50,92）

const LBR = {cx: 480, cy: 405, x1: 300, y1: 420};
const RBR = {cx: 800, cy: 405, x1: 980, y1: 420};

const KNIFE = {cx: 300, cy: 480, size: 116};
const CHEF = {cx: 980, cy: 480, size: 120};

const L_AT = 9406;
const R_AT = 9480;

export const SC38: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  const devIn = clamp01((N - F0) / 10);
  const devGlow = devIn * off;
  const devPulse = emphasisPulse(N - 9440, {peak: 1.055, up: 6, hold: 2, down: 10});

  const lp = clamp01((N - L_AT) / 16);
  const rp = clamp01((N - R_AT) / 16);
  const sKnife = scaleIn(N - 9412, 11);
  const sChef = scaleIn(N - 9504, 11);

  // 右分支一起来，左侧退为配角（仍然亮，但不再是重点）
  const lDim = 1 - 0.28 * clamp01((N - R_AT) / 12);

  // 光点：两条分支交替（反相）
  const lDotOp = lp >= 1 ? lDim : 0;
  const rDotOp = rp >= 1 ? 1 : 0;
  const lT = ((N - L_AT) % 70) / 70;
  const rT = ((N - R_AT + 35) % 70) / 70;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 装置紫柔光 */}
      <GlowBlob cx={DEV.cx} cy={DEV.cy} r={215} k={devGlow} alpha={0.24} />
      <GlowBlob cx={DEV.cx} cy={DEV.cy} r={130} k={devGlow} alpha={0.22} />

      {/* ===== 两条分支 ===== */}
      <Svg bloom={false}>
        {lp > 0 && <path d={quadPath(ORIGIN.x, ORIGIN.y, LBR.cx, LBR.cy, LBR.x1, LBR.y1)} fill="none" stroke={mixHex(GREY_LIGHT, PURPLE_LIGHT, lDim)} strokeWidth={2.6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lp} opacity={0.9} style={{filter: 'drop-shadow(0 0 6px rgba(102,45,248,.8))'}} />}
        {rp > 0 && <path d={quadPath(ORIGIN.x, ORIGIN.y, RBR.cx, RBR.cy, RBR.x1, RBR.y1)} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - rp} opacity={0.95} style={{filter: 'drop-shadow(0 0 6px rgba(102,45,248,.8))'}} />}
      </Svg>

      {/* 分支起点：一小段出线（从装置底部垂下来再接分支） */}
      <div style={{position: 'absolute', left: ORIGIN.x - 1, top: 336, width: 2, height: 18, background: PURPLE_LIGHT, opacity: 0.55 * devIn * off}} />

      {/* ===== 装置 ===== */}
      {/* 9440：左分支的命令跑到底，装置自身顶一下（一次性事件，不是呼吸） */}
      <div style={{position: 'absolute', inset: 0, opacity: devIn, transform: `scale(${devPulse.toFixed(4)})`, transformOrigin: `${DEV.cx}px ${DEV.cy}px`}}>
        <AlarmIcon cx={DEV.cx} cy={DEV.cy} size={DEV.size} color={WHITE} accent={PURPLE_LIGHT} />
      </div>

      {/* ===== 左：Tool（直接启动）===== */}
      {sKnife > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: sKnife, transform: `scale(${(0.72 + 0.28 * sKnife).toFixed(3)})`, transformOrigin: `${KNIFE.cx}px ${KNIFE.cy}px`}}>
          <KnifeIcon cx={KNIFE.cx} cy={KNIFE.cy} size={KNIFE.size} color={mixHex(WHITE, GREY_LIGHT, lDim)} accent={PURPLE_LIGHT} />
        </div>
      )}
      {sKnife > 0.5 && <GlowBlob cx={KNIFE.cx} cy={KNIFE.cy} r={104} k={0.55 * lDim * off} alpha={0.22} />}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - 9422, 9) * lDim}}>
        <TechSub cx={KNIFE.cx} cy={572} text="Tool" size={24} color={mixHex(GREY_LIGHT, PURPLE_LIGHT, 0.25)} />
      </div>

      {/* ===== 右：Agent（再唤起一层）===== */}
      {sChef > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: sChef, transform: `scale(${(0.72 + 0.28 * sChef).toFixed(3)})`, transformOrigin: `${CHEF.cx}px ${CHEF.cy}px`}}>
          <ChefIcon cx={CHEF.cx} cy={CHEF.cy} size={CHEF.size} color={WHITE} accent={PURPLE_LIGHT} />
        </div>
      )}
      {sChef > 0.5 && <GlowBlob cx={CHEF.cx} cy={CHEF.cy} r={112} k={0.75 * off} alpha={0.26} />}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - 9514, 9)}}>
        <TechSub cx={CHEF.cx} cy={574} text="Agent" size={24} color={PURPLE_LIGHT} />
      </div>

      {/* ===== 交替跑的光点 ===== */}
      <PathDot x0={ORIGIN.x} y0={ORIGIN.y} cx={LBR.cx} cy={LBR.cy} x1={LBR.x1} y1={LBR.y1} t={lT} opacity={lDotOp} color={WHITE} r={4.5} />
      <PathDot x0={ORIGIN.x} y0={ORIGIN.y} cx={RBR.cx} cy={RBR.cy} x1={RBR.x1} y1={RBR.y1} t={rT} opacity={rDotOp} color={WHITE} r={4.5} />
    </div>
  );
};
