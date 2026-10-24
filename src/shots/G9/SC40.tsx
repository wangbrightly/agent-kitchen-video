import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GlowBlob, type CamKey} from '../../fx';
import {KnifeIcon, SocketIcon} from '../../icons';
import {CText, GLOW_PURPLE, GREY, GREY_LIGHT, GREY_LINE, GREY_MID, PURPLE, PURPLE_DEEP, PURPLE_LIGHT, RED_DEEP, WHITE, exitOp, firstOp, glowOffK, mixHex, scaleIn, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, easeInOutPow} from '../../common';
import {HandIcon} from '../G1/parts';
import {PlugIcon, SpecFrame} from './parts';

/**
 * SC40 MCP 是统一规格，不是刀、也不是手｜9827–10119｜本章论点型高光（293 帧）
 * 左：刀、手两枚图标各被一道红叉否掉；右：插座与虚线规格框（四角螺孔高光）。
 * 节拍：9835 刀（+9835 插座登场）/ 9873 手 / 9916 规格框 draw-on + 四角高光 /
 *       9994 灰方块自右撞上来被弹开 / 10037 标准插头推进 → 10066 插入 + 白闪 4 帧 → 循环脉冲。
 * 主角：插座 240 + 规格框 360×264（紫柔光、四角高光）；左列全程灰、无光。
 * 运镜：9831 起 30 帧 1.0→1.10 后停住。
 */
const F0 = 9827;
const TO = 10119;

const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 9831, x: 640, y: 360, s: 1},
  {f: 9861, x: 640, y: 360, s: 1.1},
  {f: TO, x: 640, y: 360, s: 1.1},
];

const SOCK = {cx: 890, cy: 345, size: 240};
const SPEC = {x: 710, y: 213, w: 360, h: 264};
const KNIFE = {cx: 250, cy: 288, size: 168};
const HAND = {cx: 250, cy: 462, size: 168};
// 插座右缘：viewBox x=88 → 890 + 0.38*240
const EDGE = SOCK.cx + 0.38 * SOCK.size;

const ease = easeInOutPow(2.2);

/** 一道红叉的自绘（两笔先后画出） */
const Strike: React.FC<{cx: number; cy: number; size: number; p: number; color?: string}> = ({cx, cy, size, p, color = RED_DEEP}) => {
  const L = size * 1.414;
  const d = (x: number) => `${L * clamp01(x)}`;
  const q1 = clamp01(p / 0.55);
  const q2 = clamp01((p - 0.35) / 0.65);
  return (
    <svg width={1280} height={720} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <line x1={cx - size / 2} y1={cy - size / 2} x2={cx + size / 2} y2={cy + size / 2} stroke={color} strokeWidth={7} strokeLinecap="round" strokeDasharray={d(q1)} opacity={0.95} />
      <line x1={cx + size / 2} y1={cy - size / 2} x2={cx - size / 2} y2={cy + size / 2} stroke={color} strokeWidth={7} strokeLinecap="round" strokeDasharray={d(q2)} opacity={0.95} />
    </svg>
  );
};

export const SC40: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // ---- 右：插座 ----
  const sockN = N - 9829;
  const sockS = scaleIn(sockN, 21);
  const sockOp = sockN < 0 ? 0 : clamp01(0.12 + 1.7 * sockS);
  const glowK = clamp01(sockN / 14) * (0.55 + 0.45 * clamp01((N - 10064) / 8)) * off;

  // ---- 规格框 ----
  const frameP = clamp01((N - 9913) / 22);
  const cornerP = clamp01((N - 9925) / 22);
  const lit = [0, 1, 2, 3].map((i) => clamp01((N - (9952 + i * 9)) / 8));

  // ---- 左：刀 / 手 ----
  const knifeN = N - 9832;
  const handN = N - 9870;
  const knifeOp = softOp(knifeN, 8) * (1 - 0.35 * clamp01((N - 10040) / 10));
  const handOp = softOp(handN, 8) * (1 - 0.35 * clamp01((N - 10040) / 10));
  const strikeKnife = clamp01((N - 9843) / 14);
  const strikeHand = clamp01((N - 9881) / 14);

  // ---- 灰方块：9997 进场 → 10013 撞上 → 8 帧弹开 ----
  const blockIn = N >= 9994;
  const appr = ease(clamp01((N - 9997) / 16));
  const bounce = clamp01((N - 10013) / 8);
  const bx = N < 10013 ? 1150 - 114 * appr : 1036 + 74 * easeInOutPow(2.6)(bounce);
  const brot = N >= 10013 ? -9 * (1 - easeInOutPow(2)(bounce)) : 0;
  const blockOp = blockIn ? softOp(N - 9994, 7) * (1 - clamp01((N - 10026) / 10)) : 0;
  const blockK = N >= 10013 && N < 10029 ? 1 - clamp01((N - 10013) / 16) : 0;

  // ---- 标准插头：10039 出现 → 10045 起推进 → 10066 插到位 ----
  const plugIn = clamp01((N - 10045) / 21);
  const plugX = 1200 - 165 * ease(plugIn);
  const plugOp = softOp(N - 10039, 7);
  // 白闪：4 帧
  const fN = N - 10066;
  const flash = fN >= 0 && fN < 4 ? [0.9, 0.62, 0.36, 0.16][fN] : 0;
  // 插好后的循环脉冲
  const loopN = N - 10070;
  const loopP = loopN < 0 ? -1 : (loopN % 40) / 40;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 全屏白闪单独放屏幕坐标，避免被相机缩放 */}
      {flash > 0 && <div style={{position: 'absolute', inset: 0, background: WHITE, opacity: flash * 0.16}} />}

      <CameraRig N={N} keys={CAM}>
        {/* 左右分栏的基线（静态、极淡） */}
        <div style={{position: 'absolute', left: 470, top: 214, width: 1.4, height: 372, background: GREY_LINE, opacity: 0.3 * firstOp(N - 9830, 12)}} />

        {/* ---- 左列：否定 ---- */}
        {knifeN >= 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: knifeOp, transform: `translateX(${(-26 * (1 - softOp(knifeN, 12))).toFixed(1)}px)`}}>
            <KnifeIcon cx={KNIFE.cx} cy={KNIFE.cy} size={KNIFE.size} color={GREY_MID} accent={GREY} />
          </div>
        )}
        {handN >= 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: handOp, transform: `translateX(${(-26 * (1 - softOp(handN, 12))).toFixed(1)}px)`}}>
            <HandIcon cx={HAND.cx} cy={HAND.cy} size={HAND.size} color={GREY_MID} dashed opacity={1} />
          </div>
        )}
        {strikeKnife > 0 && <Strike cx={KNIFE.cx} cy={KNIFE.cy} size={132 * (0.9 + 0.1 * softOp(N - 9843, 6))} p={strikeKnife} />}
        {strikeHand > 0 && <Strike cx={HAND.cx} cy={HAND.cy} size={132 * (0.9 + 0.1 * softOp(N - 9881, 6))} p={strikeHand} />}

        {/* ---- 右：插座 + 规格框 ---- */}
        <GlowBlob cx={SOCK.cx} cy={SOCK.cy} r={215} N={N} k={glowK} alpha={0.17} />
        <GlowBlob cx={SOCK.cx} cy={SOCK.cy} r={150} N={N} k={glowK} alpha={0.2} />
        {/* 主角光晕：规格框外框（半透明白/紫，给「主角」一个面） */}
        <div style={{position: 'absolute', left: SPEC.x - 8, top: SPEC.y - 8, width: SPEC.w + 16, height: SPEC.h + 16, borderRadius: 12, boxShadow: GLOW_PURPLE, opacity: 0.5 * clamp01((N - 9916) / 14) * off}} />

        {frameP > 0 && <SpecFrame x={SPEC.x} y={SPEC.y} w={SPEC.w} h={SPEC.h} p={frameP} cornerP={cornerP} lit={lit} />}

        {sockN >= 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: sockOp, transform: `scale(${sockS.toFixed(3)})`, transformOrigin: `${SOCK.cx}px ${SOCK.cy}px`}}>
            <SocketIcon cx={SOCK.cx} cy={SOCK.cy} size={SOCK.size} color={WHITE} accent={PURPLE_LIGHT} />
          </div>
        )}

        {/* 规格名：贴在框上方 */}
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - 9831, 9)}}>
          <CText cx={SPEC.x + SPEC.w / 2} cy={178} size={40} family={FONT_HEAVY} weight={700} color={GREY_LIGHT} letterSpacing={6}>
            MCP
          </CText>
        </div>

        {/* 灰方块：形状不对 → 撞上 → 弹开 */}
        {blockOp > 0.01 && (
          <div style={{position: 'absolute', inset: 0, opacity: blockOp, transform: `translateX(${(bx - 1036).toFixed(1)}px) rotate(${brot.toFixed(2)}deg)`, transformOrigin: '1036px 345px'}}>
            <div style={{position: 'absolute', left: 1036 - 55, top: 345 - 55, width: 110, height: 110, borderRadius: 8, background: 'rgba(46,46,50,0.94)', border: `2px solid ${GREY_MID}`, boxShadow: '0 0 0 6px rgba(0,0,0,0.3)'}} />
            <div style={{position: 'absolute', left: 1036 - 12, top: 345 - 22, width: 24, height: 44, borderRadius: 4, background: GREY, opacity: 0.65}} />
          </div>
        )}
        {blockK > 0 && (
          <svg width={1280} height={720} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: blockK}}>
            <line x1={EDGE - 16} y1={345 - 16} x2={EDGE + 16} y2={345 + 16} stroke={RED_DEEP} strokeWidth={6} strokeLinecap="round" />
            <line x1={EDGE + 16} y1={345 - 16} x2={EDGE - 16} y2={345 + 16} stroke={RED_DEEP} strokeWidth={6} strokeLinecap="round" />
          </svg>
        )}

        {/* 标准插头 */}
        {plugOp > 0.01 && (
          <div style={{position: 'absolute', inset: 0, opacity: plugOp, transform: `translateX(${(plugX - 1035).toFixed(1)}px)`}}>
            <PlugIcon cx={1035} cy={345} size={170} color={WHITE} accent={PURPLE_LIGHT} />
          </div>
        )}

        {/* 接口处的白光 + 循环脉冲环 */}
        {flash > 0 && (
          <div style={{position: 'absolute', left: EDGE - 150, top: 345 - 150, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(161,117,241,0.45) 38%, rgba(0,0,0,0) 70%)', opacity: flash * 0.8}} />
        )}
        {loopP >= 0 && (
          <svg width={1280} height={720} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <circle cx={EDGE} cy={345} r={24 + 36 * loopP} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.6} opacity={0.75 * (1 - loopP)} />
            <circle cx={EDGE} cy={345} r={7} fill={PURPLE_LIGHT} opacity={0.9} />
            <circle cx={EDGE} cy={345} r={16} fill="none" stroke={PURPLE_LIGHT} strokeWidth={1.6} opacity={0.35} />
          </svg>
        )}

      </CameraRig>
    </div>
  );
};
