import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {Box, CText, GREY_LIGHT, PURPLE_DEEP, PURPLE_LIGHT, Svg, WHITE, exitOp, glowOffK, glowPurpleS, mix, mixHex, softOp} from '../../ui';
import {FONT_WIDE, GlitchIn, clamp01, easeInOutPow, emphasisPulse} from '../../common';
import {KitchenLineArt} from '../G1/parts';
import {AlarmDevice, DashPolyline, GlowDot} from '../G7/parts';
import {PressHand, TargetRing, quadPath, qPoint} from './parts';

/**
 * SC34 这就是 Hook｜8333–8570（第 4 章章论点型高光，238 帧）
 * 字幕：「这就是 Hook｜钩子」/「它不需要人每次按铃」/「只要某个条件发生｜就自动触发动作」
 *
 * 承接 SC33（同一套图元与姿态，不清场重画）：G7 的 AlarmDevice 320 @ (640,340)、stub=false、
 *   背后的厨房线稿 0.32、底部扫描线 y602、以及那条从机身底部垂下的**直虚线探针**（GlowDot 端点）。
 *   8333 起 25 帧左移到 260 @ (330,340)：厨房线稿与扫描线 22 帧淡出，探针的摆幅/高度在同一个
 *   40 帧周期里从 SC33 的形态平滑长成本镜头的工作形态（见下），指针继续按 SC33 的 95 帧节奏摆。
 *
 * 主角：「Hook」Audiowide 120（本组唯一 GlitchIn + 紫硬投影 + 一次 emphasisPulse）。
 * 因果链：探针扫到最右端（8470）→ 条件卡已亮（8460–8471 由灰转紫）→ 一条紫线从卡片长到铃铛
 *   （8472–8492）→ 光点跑完全程（8494–8514）→ 铃铛震（8516 起 7 帧衰减）。
 * 持续动作：探针整场不停（也是末拍停留期唯一的动）。
 * 紫：装置 accent 全程紫（SC33 就是紫表盘），条件卡亮起的那十几帧让位给卡片。
 */
const F0 = 8333;
const TO = 8570;

// SC33 末帧的姿态：同一图元、同一尺寸、同一个 stub
const ICON_FROM = {cx: 640, cy: 340, size: 320};
const ICON_TO = {cx: 330, cy: 340, size: 260}; // 分镜：260 左移
const MOVE_END = 8358; // 25 帧走完

// 铃铛中心：图元局部 (64,17) → 落位后屏幕 (366,254)
const BELL = {cx: 366, cy: 254};
// 探针端点落位后的高度（不碰字幕带 y637）
const TIP_Y = 575;

// 厨房线稿 / 扫描线的淡出时长
const SCENE_OUT = 22;

/**
 * 探针摆动：SC33 是 26° 的 40 帧单摆（峰值在 8230+40k）。
 * 这里改成"以机身底部为原点的水平摆"——周期和相位都跟 SC33 对齐，所以在接缝那一帧
 * 端点的位置和速度都连续（8333 帧：横向 −80.2px、y 585；SC33 同一帧是 −80.2 / 585.1）。
 * 峰值 8470 = 8230 + 6×40，正好落在"只要某个条件发生"(8457) 那一拍的后半。
 */
const SWING_R0 = 90; // 承接期的摆幅（SC33 末帧端点横向偏移 ≈ 80）
const SWING_R = 150; // 落位后的摆幅
const SWING_PEAK = 8470;
const TIP_Y0 = 585; // SC33 末帧端点高度

// 条件卡
const CARD = {x: 720, y: 430, w: 400, h: 90};
const CARD_CX = CARD.x + CARD.w / 2;
const CARD_CY = CARD.y + CARD.h / 2;

// 触发线：卡片左缘 → 铃铛底
const TRIG = {x0: CARD.x, y0: CARD_CY, cx: 560, cy: 380, x1: BELL.cx + 2, y1: BELL.cy - 18};

export const SC34: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // ---- 装置左移（首帧 = SC33 末帧的姿态与位置）----
  const moveP = easeInOutPow(2.2)(clamp01((N - F0) / (MOVE_END - F0)));
  const icx = mix(ICON_FROM.cx, ICON_TO.cx, moveP);
  const icy = mix(ICON_FROM.cy, ICON_TO.cy, moveP);
  const isz = mix(ICON_FROM.size, ICON_TO.size, moveP);

  // ---- 厨房线稿 / 底部扫描线：22 帧淡出 ----
  const sceneK = 1 - clamp01((N - F0) / SCENE_OUT);

  // ---- 探针：与 SC33 同一条直虚线，周期 40 帧同相位 ----
  const cosA = Math.cos((2 * Math.PI * (N - SWING_PEAK)) / 40);
  const swingR = mix(SWING_R0, SWING_R, moveP);
  const tipX = icx + swingR * cosA;
  const tipY = mix(TIP_Y0, TIP_Y, moveP);
  const anchorX = icx;
  const anchorY = icy + 0.18 * isz; // AlarmDevice 机身底边 = 局部 y68

  // 扫到最右端那一下：端点亮 + 一圈紫涟漪
  const peakN = N - SWING_PEAK;
  const peakK = peakN < 0 ? 0 : peakN < 4 ? peakN / 4 : Math.max(0, 1 - (peakN - 4) / 16);
  const rippleP = peakN < 0 ? -1 : clamp01(peakN / 11);

  // ---- 不需要人按：手试探着下来，还没按到就变虚、退回 ----
  const handN = N - 8394;
  const handOut = 1 - clamp01((N - 8430) / 12);
  const handY = handN < 12 ? mix(207, 217, easeInOutPow(2)(clamp01(handN / 12))) : N < 8424 ? 217 : mix(217, 205, easeInOutPow(2.2)(clamp01((N - 8424) / 8)));
  const handDashed = N >= 8412;

  // ---- 条件卡：8454 出框，8460–8471 十一帧由灰转紫 ----
  const cardN = N - 8454;
  const cardIn = softOp(cardN, 8);
  const cardLit = clamp01((N - 8460) / 11);
  const cardGlowK = cardLit * (N < 8495 ? 1 : Math.max(0.22, 1 - (N - 8495) / 14));
  const cardStroke = mixHex(WHITE, PURPLE_LIGHT, cardLit);
  const cardText = mixHex(WHITE, PURPLE_LIGHT, cardLit);

  // ---- 触发线：8472–8492 长出来，8494–8514 光点跑完全程 ----
  const drawP = clamp01((N - 8472) / 20);
  const dotN = N - 8494;
  const dotT = dotN < 0 ? 0 : clamp01(dotN / 20);
  const dotOn = dotN >= 0 && dotN <= 22;

  // ---- 铃铛震：8516 起 7 帧衰减 ----
  const shakeN = N - 8516;
  const shakeDeg = shakeN >= 0 && shakeN < 8 ? 2.6 * Math.sin(shakeN * 1.75) * Math.pow(1 - shakeN / 8, 1.4) : 0;
  const flashN = N - 8516;
  const bellFlash = flashN >= 0 && flashN < 12 ? (flashN < 3 ? flashN / 3 : Math.max(0, 1 - (flashN - 3) / 9)) : 0;

  // 铃铛余温：接 SC33 的 bellK=0.45，18 帧退回；之后只剩"响一下"的白闪
  const bellWarm = 0.45 * (1 - clamp01((N - F0) / 18));
  const bellK = Math.max(bellWarm, bellFlash);

  // 指针：直接沿用 SC33 的公式（95 帧一个来回），接缝处角度一致
  const needle = 20 * Math.sin(((N - 8078) / 95) * Math.PI * 2);

  // 装置 accent：默认紫（SC33 同款）；条件卡成为重点的十几帧退成灰
  const devDim = clamp01((N - 8458) / 10) * (1 - clamp01((N - 8496) / 12));
  const accent = mixHex(PURPLE_LIGHT, GREY_LIGHT, 0.6 * devDim);

  // 紫柔光：从 SC33 的"装置中心 230/150"过渡到本镜头的"铃位 150/86"
  const gcx = mix(ICON_FROM.cx, BELL.cx, moveP);
  const gcy = mix(ICON_FROM.cy, BELL.cy, moveP);
  const glowK = off * (0.2 + 0.8 * clamp01((N - 8495) / 14));
  // 外圈 / 内圈的强度：moveP=0 时正好是 SC33 的 0.8 / 0.85
  const glow1K = mix(off * 0.8, glowK, moveP);
  const glow2K = mix(off * 0.85, glowK, moveP);

  const hookPulse = emphasisPulse(N - 8358, {peak: 1.07, up: 10, hold: 3, down: 12});

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* ===== 承接 SC33 的厨房（22 帧淡出）===== */}
      {sceneK > 0.01 && <KitchenLineArt N={N} opacity={0.32 * sceneK} />}
      {sceneK > 0.01 && <DashPolyline pts={[[300, 602], [980, 602]]} p={1} color={GREY_LIGHT} sw={1.8} dash={'6 10'} opacity={0.55 * sceneK} />}

      {/* ===== 装置 + 探针：同一层旋转，铃响时一起震 ===== */}
      <div style={{position: 'absolute', inset: 0, transform: `rotate(${shakeDeg.toFixed(3)}deg)`, transformOrigin: `${BELL.cx}px ${BELL.cy}px`}}>
        {/* 探针：从机身底部垂下的紫色直虚线（与 SC33 同一条），末端圆点 */}
        <DashPolyline pts={[[anchorX, anchorY], [tipX, tipY]]} p={1} color={PURPLE_LIGHT} sw={2.4} dash={'9 8'} opacity={0.9 * off} />
        {/* 紫柔光：位置/半径/强度在左移过程中从 SC33 的形态过渡过来 */}
        <GlowBlob cx={gcx} cy={gcy} r={mix(230, 150, moveP)} k={glow1K} alpha={mix(0.18, 0.3, moveP)} />
        <GlowBlob cx={gcx} cy={gcy} r={mix(150, 86, moveP)} k={glow2K} alpha={mix(0.22, 0.26, moveP)} />

        <AlarmDevice cx={icx} cy={icy} size={isz} color={WHITE} accent={accent} needle={needle} bellK={bellK} stub={false} />

        {/* 铃闪：三帧白 */}
        {bellFlash > 0.02 && <div style={{position: 'absolute', left: BELL.cx - 34, top: BELL.cy - 22, width: 68, height: 44, borderRadius: 22, background: `rgba(255,255,255,${(0.55 * bellFlash).toFixed(3)})`, filter: 'blur(6px)'}} />}

        <GlowDot cx={tipX} cy={tipY} r={5.5 + 2 * peakK} color={WHITE} opacity={0.95 * off} />
      </div>

      {/* 端点涟漪（屏幕坐标，不跟着震） */}
      <TargetRing x={ICON_TO.cx + SWING_R} y={TIP_Y} p={rippleP} r={22} />

      {/* ===== 不需要人按：手试探 → 变虚 → 退回 ===== */}
      {handN >= 0 && handOut > 0.01 && <PressHand cx={BELL.cx} cy={handY} size={92} color={handDashed ? GREY_LIGHT : WHITE} opacity={softOp(handN, 8) * handOut * (handDashed ? 0.8 : 0.92)} dashed={handDashed} armTop={-34} />}

      {/* ===== Hook（本组唯一 GlitchIn）===== */}
      <GlitchIn N={N} f0={8341} rgbSplit={5} slices={6} seed={14}>
        <CText
          cx={912}
          cy={285}
          size={120}
          family={FONT_WIDE}
          weight={400}
          color={WHITE}
          letterSpacing={3}
          shadow={`6px 6px 0 ${PURPLE_DEEP}, 0 0 30px rgba(102,45,248,.5)`}
          style={{transform: `translate(-50%,-50%) scale(${hookPulse.toFixed(4)})`, transformOrigin: '50% 50%'}}
        >
          Hook
        </CText>
      </GlitchIn>
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - 8369, 10)}}>
        <CText cx={912} cy={372} size={28} weight={700} color={GREY_LIGHT} letterSpacing={10}>
          钩子
        </CText>
      </div>

      {/* ===== 条件卡 ===== */}
      {cardN >= 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: cardIn, transform: `translateY(${(10 * (1 - cardIn)).toFixed(2)}px)`}}>
          <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={10} fill="rgba(0,0,0,0.6)" stroke={cardStroke} sw={2} glow={glowPurpleS(cardGlowK)} />
          {/* 左上角的小标签压在边框上 */}
          <div style={{position: 'absolute', left: CARD.x + 22, top: CARD.y - 12, padding: '0 10px', background: '#000', height: 24, display: 'flex', alignItems: 'center'}}>
            <span style={{fontFamily: 'Noto Sans SC, sans-serif', fontSize: 20, fontWeight: 700, color: cardLit > 0.4 ? PURPLE_LIGHT : GREY_LIGHT, letterSpacing: 4, lineHeight: 1}}>条件</span>
          </div>
          <CText cx={CARD_CX} cy={CARD_CY} size={38} weight={700} color={cardText} letterSpacing={2} shadow={cardLit > 0.3 ? `0 0 ${(18 * cardLit).toFixed(0)}px rgba(102,45,248,.7)` : undefined}>
            油温 &gt; 阈值
          </CText>
        </div>
      )}

      {/* ===== 触发线：卡片 → 铃铛 ===== */}
      {drawP > 0 && (
        <Svg bloom={false}>
          <path d={quadPath(TRIG.x0, TRIG.y0, TRIG.cx, TRIG.cy, TRIG.x1, TRIG.y1)} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.2} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawP} opacity={0.82} style={{filter: 'drop-shadow(0 0 5px rgba(102,45,248,.85))'}} />
        </Svg>
      )}
      {dotOn && (() => {
        const [dx, dy] = qPoint(TRIG.x0, TRIG.y0, TRIG.cx, TRIG.cy, TRIG.x1, TRIG.y1, dotT);
        return <div style={{position: 'absolute', left: dx - 5, top: dy - 5, width: 10, height: 10, borderRadius: 5, background: WHITE, boxShadow: '0 0 14px 5px rgba(102,45,248,.9)'}} />;
      })()}

      {/* 铃响紫环 */}
      {shakeN >= 0 && shakeN < 20 && <TargetRing x={BELL.cx} y={BELL.cy} p={clamp01(shakeN / 20)} r={40} />}
    </div>
  );
};
