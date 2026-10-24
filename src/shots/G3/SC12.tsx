import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GlowBlob, type CamKey} from '../../fx';
import {ChefIcon, KnifeIcon} from '../../icons';
import {CText, GREY_LIGHT, GREY_MID, PURPLE, PURPLE_DEEP, PURPLE_LIGHT, WHITE, exitOp, firstOp, glowOffK, mixHex, softOp} from '../../ui';
import {FONT_WIDE, GlitchIn, clamp01, easeInOutPow, emphasisPulse} from '../../common';
import {DashCircle, PotIcon, SpoonIcon, SpatulaIcon, TongsIcon, qPoint} from './parts';

/**
 * SC12 手才让智能体动手｜2911–3143｜「因为他还没有手。厨房里的刀、锅、勺、夹子、铲子，就是 Tool。工具。」
 * 章论点型高光（≥90 帧）。
 * 主角：Tool（Audiowide 110，唯一 GlitchIn + emphasisPulse + 紫硬投影）；厨师 240 保持灰色（他还没有手）。
 * 配角：两臂末端的两枚空虚线圈；五件自绘器具从左抛物线飞入，按各自字幕块起飞；
 *       每插入一件右手圈亮一次；入位后沿弧轮转高亮（11 帧灰→紫 + 放大 1.12）。
 * 运镜：2919 起 30 帧推近 1.0→1.2（厨师屏幕 200→240，2949 停住，之后不再动）。
 * 飞行轨迹全程在 y≤620，不穿字幕带。
 */
const F0 = 2911;
const TO = 3143;

const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 2919, x: 640, y: 360, s: 1},
  {f: 2949, x: 640, y: 360, s: 1.2},
  {f: TO, x: 640, y: 360, s: 1.2},
];

// 厨师：世界坐标 200，推近后屏幕 240；两手末端 = 世界 (±56, +32)
const CHEF = {cx: 600, cy: 345, size: 200};
const HAND_R = {cx: CHEF.cx + 56, cy: CHEF.cy + 32};
const HAND_L = {cx: CHEF.cx - 56, cy: CHEF.cy + 32};
// 相机 1.2 后：右圈屏幕 (659, 380)、左圈 (525, 380)
const RING_S = {x: 640 + (HAND_R.cx - 640) * 1.2, y: 360 + (HAND_R.cy - 360) * 1.2};
const ARC = {cx: RING_S.x, cy: RING_S.y, R: 120};

const ease = easeInOutPow(2.2);

type ToolKey = 'knife' | 'pot' | 'spoon' | 'tongs' | 'spatula';
const TOOLS: Array<{key: ToolKey; at: number; dur: number; from: [number, number]; rot: number; size: number}> = [
  {key: 'knife', at: 2972, dur: 18, from: [-90, 520], rot: -32, size: 66}, // 刀
  {key: 'pot', at: 2996, dur: 16, from: [-90, 560], rot: 22, size: 64}, // 锅
  {key: 'spoon', at: 3002, dur: 15, from: [-90, 588], rot: -20, size: 62}, // 勺
  {key: 'tongs', at: 3015, dur: 15, from: [-90, 606], rot: 26, size: 62}, // 夹子
  {key: 'spatula', at: 3027, dur: 15, from: [-90, 618], rot: -24, size: 62}, // 铲子
];

// 五个弧位：-70 / -35 / 0 / 35 / 70 度
const SLOTS: Array<[number, number]> = [-70, -35, 0, 35, 70].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return [ARC.cx + ARC.R * Math.cos(a), ARC.cy + ARC.R * Math.sin(a)];
});
// 控制点：上两个从上弧、下两个从下弧接近（曲线本身不进字幕带）
const CTRLS: Array<[number, number]> = SLOTS.map(([x, y], i) => [Math.max(140, x * 0.42), y + (i < 2 ? -150 : 150)]);

// 入位后轮转高亮：3050 起每 10 帧一件，最后停在铲子
const HIGH_AT = [3050, 3060, 3070, 3080, 3090];

/** 一次性闪光包络：0 → 1（3 帧）→ 0（10 帧） */
const flashK = (n: number) => (n < 0 ? 0 : n < 3 ? n / 3 : Math.max(0, 1 - (n - 3) / 10));

export const SC12: React.FC = () => {
  const N = useCurrentFrame() + F0;

  const chefN = N - 2913;
  const chefOp = firstOp(chefN, 8);
  const ringOp = softOp(N - 2919, 10);
  const ringScale = 0.6 + 0.4 * clamp01((N - 2919) / 12);

  // 右手圈：每插进一件亮一次（起飞后 80% 航程经过手边）
  const ringFlash = TOOLS.reduce((acc, t) => Math.max(acc, flashK(N - (t.at + t.dur * 0.8))), 0);
  const chefGlow = clamp01((N - 2913) / 12) * (0.55 + 0.45 * ringFlash) * glowOffK(N, TO, 6, 8);

  // 轮转高亮：i<4 亮 10 帧后退回，末件保持
  const hiK = (i: number) => {
    const hs = HIGH_AT[i];
    const up = clamp01((N - hs) / 7);
    const keep = i === HIGH_AT.length - 1 ? 1 : 1 - clamp01((N - (hs + 10)) / 7);
    return up * keep;
  };

  const toolPulse = emphasisPulse(N - 3067, {peak: 1.13, up: 13, hold: 4, down: 13});

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 厨师 + 两枚空虚线圈（随相机推近） */}
      <CameraRig N={N} keys={CAM}>
        <GlowBlob cx={CHEF.cx} cy={CHEF.cy} r={210} N={N} k={chefGlow} alpha={0.2} />
        <GlowBlob cx={CHEF.cx} cy={CHEF.cy} r={140} N={N} k={chefGlow} alpha={0.22} />
        {chefN >= 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: chefOp}}>
            <ChefIcon cx={CHEF.cx} cy={CHEF.cy} size={CHEF.size} color={GREY_LIGHT} accent={GREY_MID} />
          </div>
        )}
        <DashCircle cx={HAND_R.cx} cy={HAND_R.cy} r={16 * ringScale} color={GREY_LIGHT} opacity={ringOp * 0.95} phase={-N * 0.9} glow={ringFlash > 0.02} />
        <DashCircle cx={HAND_L.cx} cy={HAND_L.cy} r={16 * ringScale} color={GREY_LIGHT} opacity={ringOp * 0.95} phase={N * 0.9} />
      </CameraRig>

      {/* 右手圈闪光：屏幕坐标（相机 2949 后已停），每插入一件亮一次 */}
      {ringFlash > 0.01 && (
        <>
          <GlowBlob cx={RING_S.x} cy={RING_S.y} r={54} k={ringFlash} alpha={0.5} />
          <DashCircle cx={RING_S.x} cy={RING_S.y} r={20 + 8 * ringFlash} color={PURPLE_LIGHT} opacity={ringFlash} sw={2.6} phase={-N * 1.4} glow />
        </>
      )}

      {/* 五件器具：抛物线飞入 → 落位闪光 → 沿弧轮转高亮 */}
      {TOOLS.map((t, i) => {
        const raw = (N - t.at) / t.dur;
        if (N < t.at) return null;
        const e = ease(clamp01(raw));
        const [sx, sy] = t.from;
        const [tx, ty] = SLOTS[i];
        const [cx, cy] = CTRLS[i];
        const [px, py] = qPoint(sx, sy, cx, cy, tx, ty, e);
        const landed = N >= t.at + t.dur;
        const k = hiK(i);
        const color = mixHex(WHITE, PURPLE_LIGHT, k);
        const scale = (0.86 + 0.14 * e) * (1 + 0.12 * k);
        const op = softOp(N - t.at, 5);
        const rot = t.rot * (1 - e);
        // 落位闪光（12 帧）
        const landN = N - (t.at + t.dur);
        const landK = landN >= 0 && landN < 12 ? (landN < 4 ? landN / 4 : 1 - (landN - 4) / 8) : 0;
        return (
          <React.Fragment key={t.key}>
            {/* 飞入拖尾：沿同一曲线落后 3 点 */}
            {!landed && e > 0.1
              ? [0.05, 0.1, 0.16].map((d, j) => {
                  const [qx, qy] = qPoint(sx, sy, cx, cy, tx, ty, Math.max(0, e - d));
                  return <div key={j} style={{position: 'absolute', left: qx - 4 + j, top: qy - 4 + j, width: 8 - j * 1.6, height: 8 - j * 1.6, borderRadius: 4, background: PURPLE_LIGHT, opacity: (0.5 - j * 0.13) * op, filter: 'blur(0.4px)'}} />;
                })
              : null}

            {landK > 0 && <GlowBlob cx={tx} cy={ty} r={46} k={landK} alpha={0.42} />}
            {landK > 0 && <DashCircle cx={tx} cy={ty} r={28 + 10 * landK} color={PURPLE_LIGHT} opacity={landK * 0.9} sw={2.2} dash="5 5" glow />}

            {/* 位置 / 旋转 / 缩放放在同一条 transform 上，原点取弧位，落位后正好压在弧位上 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: op,
                transform: `translate(${(px - tx).toFixed(2)}px, ${(py - ty).toFixed(2)}px) scale(${scale.toFixed(3)}) rotate(${rot.toFixed(2)}deg)`,
                transformOrigin: `${tx}px ${ty}px`,
              }}
            >
              {t.key === 'knife' && <KnifeIcon cx={tx} cy={ty} size={t.size} color={color} accent={k > 0.05 ? PURPLE_LIGHT : WHITE} />}
              {t.key === 'pot' && <PotIcon cx={tx} cy={ty} size={t.size} color={color} accent={k > 0.05 ? PURPLE_LIGHT : WHITE} />}
              {t.key === 'spoon' && <SpoonIcon cx={tx} cy={ty} size={t.size} color={color} accent={k > 0.05 ? PURPLE_LIGHT : WHITE} />}
              {t.key === 'tongs' && <TongsIcon cx={tx} cy={ty} size={t.size} color={color} accent={k > 0.05 ? PURPLE_LIGHT : WHITE} />}
              {t.key === 'spatula' && <SpatulaIcon cx={tx} cy={ty} size={t.size} color={color} accent={k > 0.05 ? PURPLE_LIGHT : WHITE} />}
            </div>
            {k > 0.02 && <GlowBlob cx={tx} cy={ty} r={52} k={k} alpha={0.34} />}
          </React.Fragment>
        );
      })}

      {/* 右下落点：Tool（唯一 GlitchIn）+ 工具 */}
      <GlitchIn N={N} f0={3057} rgbSplit={5} slices={6} seed={12}>
        <CText
          cx={1040}
          cy={470}
          size={110}
          family={FONT_WIDE}
          weight={400}
          color={WHITE}
          letterSpacing={4}
          shadow={`6px 6px 0 ${PURPLE_DEEP}, 0 0 30px rgba(102,45,248,.5)`}
          style={{transform: `translate(-50%,-50%) scale(${toolPulse.toFixed(4)})`, transformOrigin: '50% 50%'}}
        >
          Tool
        </CText>
      </GlitchIn>
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - 3085, 10)}}>
        <CText cx={1040} cy={552} size={26} weight={700} color={GREY_LIGHT} letterSpacing={8}>
          工具
        </CText>
      </div>

      {/* 「工具」下方的支撑线（静态，不呼吸） */}
      <div style={{position: 'absolute', left: 1040 - 46, top: 582, width: 92 * softOp(N - 3085, 10), height: 2, background: PURPLE, opacity: 0.7 * softOp(N - 3085, 10)}} />
    </div>
  );
};
