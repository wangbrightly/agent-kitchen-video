import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GlowBlob, type CamKey} from '../../fx';
import {BellIcon, ChefIcon} from '../../icons';
import {CText, GREY, GREY_LIGHT, PURPLE_DEEP, PURPLE_LIGHT, SoftIn, WHITE, abs, exitOp, firstOp, glowOffK, softOp} from '../../ui';
import {FONT_WIDE, GlitchIn, clamp01, powOutRemain} from '../../common';
import {KITCHEN, KitchenLineArt} from '../G1/parts';
import {Caret, HandPress, TicketCard, TypeBar} from './parts';

/**
 * SC29 铜铃｜7241–7504｜「台面上有一个铜铃 / 客人按一下 / 就会打出一张小票 / 小票上的任务 / 就是 Command / 命令」
 * 第 4 章开场：先回到厨房地图（G1 的空间基准），再推近到台面右段的铜铃。
 * 主角：BellIcon 280（世界坐标 (930,402)，与分镜表「铜铃 x880–980 / y395–470」对齐），
 * 线稿墨迹 0.69×size ≈193px，推近 1.3 后屏幕墨迹高 ≈251px，紫柔光。
 * 配角：厨房线稿、灰厨师（只做空间参照）、一只按下来的手、一张小票。
 * 唯一 GlitchIn：7412 的 Command（白名单词）。
 * 持续动作：小票上四条值条持续打字（7336→7462）。
 */
const F0 = 7241;
const TO = 7504;

// 世界坐标：铜铃压在台面线（y470）上
const BELL = {x: 930, y: 402, size: 280, base: 402 + 0.24 * 280};
// 推近后铜铃落在屏幕 (620,347)：640+(930−945)×1.3 / 360+(402−412)×1.3
const SCR = {x: 620, y: 347, knobY: 234};
// 掌心落点：掌心在指尖上方 0.35×尺寸；size 160 → 指尖正好落在铜铃顶钮上
const HAND = {size: 160, palmY: SCR.knobY - 0.35 * 160};

export const SC29: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 运镜：7241 全景 → 7271 台面右段（30 帧，结束远早于离场起点）
  // 相机中心偏右 (945)，让铜铃落在屏幕左侧 620，给右侧的 Command 留出整块空间
  const CAM: CamKey[] = [
    {f: F0, x: 640, y: 360, s: 1},
    {f: 7245, x: 640, y: 360, s: 1},
    {f: 7275, x: 945, y: 412, s: 1.3},
    {f: TO, x: 945, y: 412, s: 1.3},
  ];

  // 线稿：首帧即 0.35，8 帧补到 0.5
  const lineOp = 0.5 * (0.7 + 0.3 * firstOp(N - F0, 8));

  // 铜铃紫柔光：7247 起亮（7249「台面上有一个铜铃」的 −2）
  const bellGlow = clamp01((N - 7247) / 12) * off;

  // 铃声：7311 按下落点起，周期 4 帧、按指数衰减的摆动
  const sh = N >= 7311 && N < 7333 ? 3.6 * Math.exp(-(N - 7311) / 7) * Math.sin(((N - 7311) / 4) * Math.PI * 2) : 0;

  // 手：7297 起 14 帧按下（7295–7304 窗口内），7342 起抬起淡出
  const handN = N - 7297;
  const palmY = HAND.palmY - 70 * powOutRemain(handN, 14, 2.2) - 54 * clamp01((N - 7342) / 18);
  const palmX = SCR.x + 16 * powOutRemain(handN, 14, 2.2);
  const handOp = softOp(handN, 5) * (1 - clamp01((N - 7342) / 18));

  // 小票：7332 slideUp 18 帧（Δ110）
  const tkN = N - 7332;
  const tkY = 350 + 110 * powOutRemain(tkN, 18, 2.5);
  const tkOp = softOp(tkN, 6);
  const tkGlow = clamp01(tkN / 14) * off;

  // 票身四段值条持续打字（最后一段落在「命令」这一拍上）
  const bars = [
    {w: 176, t0: 7336, len: 16},
    {w: 148, t0: 7356, len: 16},
    {w: 122, t0: 7376, len: 16},
    {w: 90, t0: 7450, len: 12},
  ];
  const barP = bars.map((b) => clamp01((N - b.t0) / b.len));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        <KitchenLineArt N={N} opacity={lineOp} />

        {/* 厨师：只作空间参照，灰线不发光 */}
        <ChefIcon cx={KITCHEN.chef.cx} cy={KITCHEN.chef.cy} size={KITCHEN.chef.size} color={GREY} accent={GREY} opacity={0.5} />

        {/* 主角：铜铃 */}
        <GlowBlob cx={BELL.x} cy={BELL.y} r={210} N={N} k={bellGlow} alpha={0.2} />
        <GlowBlob cx={BELL.x} cy={BELL.y} r={140} N={N} k={bellGlow} alpha={0.24} />
        <div style={{position: 'absolute', inset: 0, transform: `rotate(${sh.toFixed(2)}deg)`, transformOrigin: `${BELL.x}px ${BELL.base}px`}}>
          <BellIcon cx={BELL.x} cy={BELL.y} size={BELL.size} color={WHITE} accent={bellGlow > 0.1 ? PURPLE_LIGHT : GREY_LIGHT} />
        </div>
      </CameraRig>

      {/* 手：从上方按下来（屏幕空间，避开顶部 HUD） */}
      {handOp > 0.01 ? <HandPress cx={palmX} cy={palmY} size={HAND.size} rotate={187} color={WHITE} opacity={handOp * 0.92} /> : null}

      {/* 小票：铃下一张打出来的单子 */}
      {tkN >= 0 ? (
        <TicketCard x={860} y={tkY} w={230} h={170} opacity={tkOp} glowK={tkGlow * 0.55}>
          {/* 票头：一枚紫色小方印 + 一条灰线 */}
          <div style={{...abs(18, 14, 16, 16), borderRadius: 2, background: PURPLE_LIGHT, opacity: 0.9}} />
          <div style={{...abs(44, 19, 96, 6), borderRadius: 3, background: GREY_LIGHT, opacity: 0.5}} />
          {bars.map((b, i) => (
            <TypeBar key={i} x={18} y={56 + i * 30} w={b.w} p={barP[i]} h={5} color={i === 3 ? PURPLE_LIGHT : GREY_LIGHT} />
          ))}
          {/* 光标：跟着当前正在打的那一条走 */}
          {(() => {
            const act = barP.findIndex((p) => p > 0 && p < 1);
            if (act < 0) return null;
            return <Caret x={18 + bars[act].w * barP[act] + 6} y={50 + act * 30} N={N} h={16} />;
          })()}
        </TicketCard>
      ) : null}

      {/* Command：屏幕空间大字，唯一一处 GlitchIn */}
      <GlitchIn N={N} f0={7412} rgbSplit={5} slices={6} seed={29}>
        <CText
          cx={945}
          cy={245}
          size={96}
          family={FONT_WIDE}
          weight={400}
          color={WHITE}
          letterSpacing={1}
          shadow={`6px 6px 0 ${PURPLE_DEEP}, 0 0 26px rgba(102,45,248,.45)`}
        >
          Command
        </CText>
      </GlitchIn>

      {/* 中文释义：7448「命令」 */}
      <SoftIn N={N} f0={7446} len={8} dy={8}>
        <CText cx={945} cy={310} size={30} weight={500} color={GREY} letterSpacing={8}>
          命令
        </CText>
      </SoftIn>
    </div>
  );
};
