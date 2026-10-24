import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {AlarmIcon, BellIcon} from '../../icons';
import {GREY, GREY_LIGHT, GREY_LINE, Pill, PURPLE_LIGHT, TechSub, WHITE, exitOp, glowOffK, mix, mixHex, scaleIn, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, easeInOutPow} from '../../common';
import {AttachCard, EnvelopeIcon, PressHand, ProbeLine, ProbeTip} from './parts';

/**
 * SC36 两个铃并排｜8857–9151（分水岭镜头，295 帧）
 * 字幕：8865 收到新邮件时 / 8905 自动处理附件 / 8952 所以 / 8969 人按铃 / 8987 是 Command /
 *       9032 机器根据条件自动触发 / 9086 是 Hook
 *
 * 左：BellIcon 190 + 一只手（每次按下才响一下，间歇）；
 * 右：AlarmIcon 190 + 垂下的探针（全程连续扫）。
 * 中间一条竖虚线，上方两 Pill「人按」「自动」，讲完这边亮那边。
 * 开场的邮件是"自动"那一侧的实例：信封里滑出一张附件小卡，落进托架，8946 后让位给对比。
 * 运镜：8926–8952 整组平移 0→40（26 帧），期间不错峰入场、不 glitch。
 * 主角：两枚 190 图标（讲到哪边，哪边挂紫柔光）。
 */
const F0 = 8857;
const TO = 9151;

const L = {cx: 340, cy: 360, size: 190};
const R = {cx: 940, cy: 360, size: 190};
const BTN = {cx: L.cx, cy: L.cy - L.size / 2 + 0.19 * L.size}; // 铃按钮（局部 50,19）
const LBASE = {cx: L.cx, cy: L.cy - L.size / 2 + 0.74 * L.size}; // 底座中心，震动原点

const PAN = {from: 8926, to: 8952, d: 40};

// 手：hover → 按下 11px；每 46 帧按一次
const PRESS_AT = [8963, 9009, 9055, 9101];
const HAND_HOVER = 252;
const HAND_DOWN = 264;

const ease = easeInOutPow(2.2);
const seg = (N: number, a: number, b: number, fi: number, fo: number) => softOp(N - a, fi) * (1 - softOp(N - b, fo));

/** 一次按压的形状：0 悬停 → 1 按到底 → 0（下 6 帧、接触、回 7 帧） */
const pressK = (n: number) => {
  if (n < 0 || n > 14) return 0;
  if (n < 6) return ease(clamp01(n / 6));
  return 1 - ease(clamp01((n - 6) / 8));
};

/** 接触后的铃震：7 帧衰减，绕底座 ±2.2° */
const ringDeg = (n: number) => (n >= 6 && n < 14 ? 2.2 * Math.sin((n - 6) * 1.7) * Math.pow(1 - (n - 6) / 8, 1.3) : 0);

export const SC36: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 整组平移
  const panX = PAN.d * ease(clamp01((N - PAN.from) / (PAN.to - PAN.from)));

  // 两侧入场（21 帧 scaleIn，2 帧错峰）
  const ls = scaleIn(N - 8865, 21);
  const rs = scaleIn(N - 8867, 21);

  // 讲到哪边亮哪边
  const mailK = seg(N, 8872, 8946, 10, 10);
  const leftK = seg(N, 8952, 9032, 10, 10);
  const rightK = Math.max(mailK, seg(N, 9032, 9120, 12, 8)) * (N < 8872 ? 0 : 1);
  const bothK = seg(N, 9118, 9199, 14, 1) * 0.45; // 末拍两侧一起收

  // 手：8946 淡入，9095 后随按压结束淡出
  const handIn = softOp(N - 8946, 10);
  const handOutK = 1 - clamp01((N - 9112) / 12);
  // 当前这次按压（取最近一次）
  const pressN = (() => {
    for (let i = PRESS_AT.length - 1; i >= 0; i--) if (N >= PRESS_AT[i]) return N - PRESS_AT[i];
    return -999;
  })();
  const pK = pressK(pressN);
  const handY = mix(HAND_HOVER, HAND_DOWN, pK);
  const shake = ringDeg(pressN);
  const hitN = pressN - 6;
  const hitFlash = hitN >= 0 && hitN < 10 ? (hitN < 2 ? hitN / 2 : Math.max(0, 1 - (hitN - 2) / 8)) : 0;

  // 右侧探针：40 帧一个来回，全程不停
  const tipX = R.cx + 72 * Math.cos((2 * Math.PI * (N - 8870)) / 40);
  const tipY = 575;
  const anchorY = R.cy - R.size / 2 + 0.92 * R.size;

  // 邮件支线：信封 8865 进，附件卡 8899–8913 滑出（对齐 8905「自动处理附件」），8946 后淡出
  const mailOut = 1 - clamp01((N - 8946) / 14);
  const envOp = softOp(N - 8865, 9) * mailOut;
  const attP = easeInOutPow(2.4)(clamp01((N - 8901) / 14));
  const attOp = softOp(N - 8899, 6) * mailOut;
  const attX = 1082;
  const attY = 300 + (352 - 300) * attP;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${panX.toFixed(2)}px)`}}>
        {/* ===== 中间竖虚线（分隔，draw-on 8865–8889）===== */}
        <div style={{position: 'absolute', left: 640 - 1, top: 225, width: 2, height: 335 * easeInOutPow(2)(clamp01((N - 8865) / 24)), backgroundImage: `linear-gradient(180deg, ${GREY_LINE} 0 10px, transparent 10px 20px)`, backgroundSize: '2px 20px', opacity: 0.85}} />

        {/* ===== 左：人按（间歇）===== */}
        <GlowBlob cx={L.cx} cy={L.cy} r={200} k={(leftK + bothK) * off} alpha={0.26} />
        <div style={{position: 'absolute', inset: 0, opacity: ls, transform: `scale(${(0.82 + 0.18 * ls).toFixed(3)})`, transformOrigin: `${L.cx}px ${L.cy}px`}}>
          <div style={{position: 'absolute', inset: 0, transform: `rotate(${shake.toFixed(3)}deg)`, transformOrigin: `${LBASE.cx}px ${LBASE.cy}px`}}>
            <BellIcon cx={L.cx} cy={L.cy} size={L.size} color={WHITE} accent={hitFlash > 0.02 ? PURPLE_LIGHT : mixHex(GREY_LIGHT, PURPLE_LIGHT, leftK * 0.7)} />
          </div>
        </div>
        {/* 铃响：接触的瞬间一圈紫 + 一点白 */}
        {hitFlash > 0.02 && (
          <>
            <div style={{position: 'absolute', left: BTN.cx - 16, top: BTN.cy - 16, width: 32, height: 32, borderRadius: 16, background: 'rgba(255,255,255,0.75)', filter: 'blur(4px)', opacity: hitFlash}} />
            <div style={{position: 'absolute', left: BTN.cx - 22 - 14 * (1 - hitFlash), top: BTN.cy - 22 - 14 * (1 - hitFlash), width: 44 + 28 * (1 - hitFlash), height: 44 + 28 * (1 - hitFlash), borderRadius: 999, border: `2.4px solid ${PURPLE_LIGHT}`, opacity: 0.9 * hitFlash, boxShadow: '0 0 14px 4px rgba(102,45,248,.7)'}} />
          </>
        )}

        {/* 手：每次按下时下来一次，其余时间悬在上方 */}
        {/* armTop 按"悬停时"算：小臂上端贴住 Pill 下沿（y≈169），按下时随手下移，不留悬空断口 */}
        {N >= 8946 && handOutK > 0.01 && <PressHand cx={BTN.cx} cy={handY} size={118} color={WHITE} opacity={0.9 * handIn * handOutK} armTop={-20} />}

        {/* ===== 右：自动（连续）===== */}
        <GlowBlob cx={R.cx} cy={R.cy} r={200} k={(rightK + bothK) * off} alpha={0.26} />
        <div style={{position: 'absolute', inset: 0, opacity: rs, transform: `scale(${(0.82 + 0.18 * rs).toFixed(3)})`, transformOrigin: `${R.cx}px ${R.cy}px`}}>
          <AlarmIcon cx={R.cx} cy={R.cy} size={R.size} color={WHITE} accent={mixHex(GREY_LIGHT, PURPLE_LIGHT, rightK * 0.75)} />
        </div>
        <ProbeLine x0={R.cx} y0={anchorY} x1={tipX} y1={tipY} color={mixHex(GREY_LIGHT, PURPLE_LIGHT, rightK * 0.8)} opacity={0.7} sw={2} dashOffset={-N * 1.5} glow={rightK > 0.3} />
        <ProbeTip x={tipX} y={tipY} k={rightK * 0.6} opacity={0.95} />

        {/* ===== 邮件：自动的一个实例 ===== */}
        {envOp > 0.01 && (
          <>
            <EnvelopeIcon cx={1118} cy={262} size={74} color={mixHex(WHITE, PURPLE_LIGHT, rightK * 0.5)} opacity={envOp} />
            <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: envOp * 0.6}}>
              <path d="M1086 286 Q1058 300 1042 318" fill="none" stroke={GREY_LIGHT} strokeWidth={1.6} strokeDasharray="5 5" strokeLinecap="round" strokeDashoffset={-N * 1.2} />
            </svg>
          </>
        )}
        {attOp > 0.01 && <AttachCard x={attX} y={attY} w={70} h={46} color={mixHex(WHITE, PURPLE_LIGHT, rightK * 0.6)} opacity={attOp} />}
        {attOp > 0.01 && <div style={{position: 'absolute', left: 1066, top: 398, width: 102, height: 2.4, background: GREY, opacity: 0.7 * attOp}} />}

        {/* ===== 两枚 Pill ===== */}
        <SidePill N={N} f0={8969} cx={L.cx} text="人按" active={leftK + bothK} />
        <SidePill N={N} f0={9032} cx={R.cx} text="自动" active={rightK + bothK} />
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - 8987, 8)}}>
          <TechSub cx={252} cy={198} text="Command" size={24} />
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - 9086, 8)}}>
          <TechSub cx={1030} cy={198} text="Hook" size={24} />
        </div>
      </div>
    </div>
  );
};

/** 上方的侧标 Pill：落到指定一侧的正上方 */
const SidePill: React.FC<{N: number; f0: number; cx: number; text: string; active: number}> = ({N, f0, cx, text, active}) => {
  const n = N - f0;
  if (n < 0) return null;
  const op = softOp(n, 8);
  const w = 168;
  const h = 46;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op, transform: `translateY(${(12 * (1 - op)).toFixed(2)}px)`}}>
      <Pill x={cx - w / 2} y={121} w={w} h={h} text={text} fontSize={28} family={FONT_HEAVY} letterSpacing={6} fill={active > 0.5 ? 'rgba(30,12,70,0.85)' : '#000'} stroke={mixHex(GREY_LIGHT, PURPLE_LIGHT, active)} sw={2} glow={active > 0.2 ? `0 0 20px 4px rgba(102,45,248,${(0.5 * active).toFixed(2)})` : undefined} />
    </div>
  );
};
