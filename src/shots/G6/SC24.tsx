import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GlowBlob, type CamKey} from '../../fx';
import {FridgeIcon} from '../../icons';
import {CText, GREY_LIGHT, PURPLE, PURPLE_DEEP, WHITE, exitOp, firstOp, glowOffK, scaleIn, softOp} from '../../ui';
import {FONT_WIDE, GlitchIn, clamp01} from '../../common';
import {KITCHEN, KitchenLineArt} from '../G1/parts';
import {DoorNote} from './parts';

/**
 * SC24 回到冰箱｜5872–6092｜「厨房最左边的冰箱门上 / 贴着四张纸 / 那就是 Memory / 记忆 / 上面可能写着」
 * 本组第一个镜头：从全片厨房立面的整体姿态平移 + 推近到最左边的冰箱（分镜表「全片空间基准」）。
 * 主角：FridgeIcon 393（世界 125,395，机身正好盖住线稿冰箱）+ 双层淡紫柔光；紫便签最亮。
 * 动效：相机 30 帧推近；冰箱 21 帧 scaleIn；四张纸 5936 起逐张「按上」（一次性，不循环）；
 *       紫便签 6011 上浮 4px 后落回（一次性）；6037 第二行字迹写出（一次性）。
 * 唯一 GlitchIn：Memory（白名单词）。全程无 LightSweep / StageLine / GhostText。
 *
 * 复用 G1：KITCHEN 常量与 KitchenLineArt 厨房线稿不重画（冰箱站位直接引用 KITCHEN.fridge）。
 * 注：图标自带的便签只有三枚，且尺寸与「四张纸」不符——用一块与机身同色的黑遮罩盖住
 *     （看不见），再按门面坐标自绘四张（第一张为紫色）。遮罩压到机身右边描边内沿，
 *     遮罩之后把这段白描边补回来。详见 BUILD_NOTES。
 */
const F0 = 5872;
const TO = 6092;

// 5880 起 30 帧：全景 (640,360,1) → 冰箱 (300,395,1.33)，之后不动
const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 5880, x: 640, y: 360, s: 1},
  {f: 5910, x: 300, y: 395, s: 1.33},
  {f: TO, x: 300, y: 395, s: 1.33},
];

// 冰箱站位直接取 G1 的 KITCHEN.fridge（60–190 / 230–560），图标尺寸用机身反推：
// 机身 0.52×size × 0.84×size，取 size=393 得 204×330，正好把线稿冰箱整个盖住（不会露出黑框）。
const FRIDGE = {
  cx: KITCHEN.fridge.x + KITCHEN.fridge.w / 2, // 125
  cy: KITCHEN.fridge.y + KITCHEN.fridge.h / 2, // 395
  size: 393,
};
const K = FRIDGE.size / 100; // 3.93
const BODY = {
  x: FRIDGE.cx + (24 - 50) * K, // 22.82
  y: FRIDGE.cy + (8 - 50) * K, // 229.94
  w: 52 * K, // 204.36
  h: 84 * K, // 330.12
  sw: 3 * K, // 描边 11.79
};

// 图标自带的三枚便签（viewBox 27.9–75.1 / 42.9–65.1）要盖掉；右边那张压到机身描边内沿，
// 所以遮罩之后再把机身右边这段白描边补回来。
const BUILTIN = {x: FRIDGE.cx + (27.6 - 50) * K, y: FRIDGE.cy + (42.7 - 50) * K, w: (75.4 - 27.6) * K, h: (65.3 - 42.7) * K};

// 门面四张纸（世界坐标左上角）：2×2，第一张紫；at = 按上的帧（5936 的块内 −4…+2 错峰）
const NOTES = [
  {x: 64, y: 388, purple: true, at: 5936, rot: -2.5},
  {x: 138, y: 388, purple: false, at: 5938, rot: 2},
  {x: 64, y: 458, purple: false, at: 5932, rot: 1.5},
  {x: 138, y: 458, purple: false, at: 5934, rot: -2},
];

const PURPLE_NOTE = NOTES[0];

export const SC24: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // 冰箱 21 帧由 1.06 落回 1，同时 6 帧淡入——一开始就比线稿冰箱大，线稿不会被看见
  const si = scaleIn(N - 5878, 21);
  const fridgeOp = firstOp(N - 5878, 6);
  const fridgeScale = 1.06 - 0.06 * si;

  // 线稿：推近后压暗，别抢主角
  const lineOp = 0.44 * (1 - 0.18 * clamp01((N - 5910) / 20));

  const off = glowOffK(N, TO, 6, 8);
  const heroGlow = clamp01((N - 5878) / 18) * off;
  const noteGlow = clamp01((N - 5975) / 10) * off;

  // 紫便签：6011 一次性上浮 4px 再落回（不循环）
  const fl = N >= 6011 && N <= 6027 ? Math.sin((Math.PI * (N - 6011)) / 16) : 0;

  // 6037 第二行字迹写出（11 帧，6048 收笔），光标接着闪到离场前
  const lineP = clamp01((N - 6037) / 11);
  const caretOp = N >= 6037 && N <= 6072 ? (Math.floor(N / 7) % 2 === 0 ? 0.95 : 0.1) : 0;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        {/* 厨房立面线稿（复用 G1）：比全景更淡，只当背景 */}
        <KitchenLineArt N={N} opacity={lineOp} />

        {/* 主角：冰箱 + 淡紫柔光 */}
        <GlowBlob cx={FRIDGE.cx} cy={FRIDGE.cy - 28} r={252} N={N} k={heroGlow} alpha={0.16} />
        <GlowBlob cx={FRIDGE.cx} cy={FRIDGE.cy - 14} r={168} N={N} k={heroGlow} alpha={0.2} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: fridgeOp,
            transform: `scale(${fridgeScale.toFixed(3)})`,
            transformOrigin: `${FRIDGE.cx}px ${FRIDGE.cy}px`,
          }}
        >
          <FridgeIcon cx={FRIDGE.cx} cy={FRIDGE.cy} size={FRIDGE.size} color={WHITE} accent={PURPLE} />
          {/* 盖住图标自带的三枚便签（同色黑，看不见）——四张纸改由本组自绘，才能各自有动作 */}
          <div style={{position: 'absolute', left: BUILTIN.x, top: BUILTIN.y, width: BUILTIN.w, height: BUILTIN.h, background: '#000'}} />
          {/* 遮罩压到了机身右边的白描边内沿，把这一段补回来（同色同宽，接缝看不见） */}
          <div style={{position: 'absolute', left: BODY.x + BODY.w - BODY.sw / 2, top: BUILTIN.y, width: BODY.sw, height: BUILTIN.h, background: WHITE}} />
        </div>

        {/* 紫便签的柔光（最亮的那张） */}
        <GlowBlob cx={NOTES[0].x + 24} cy={NOTES[0].y + 27} r={62} N={N} k={noteGlow} alpha={0.3} />

        {/* 四张纸：逐张按下（一次性缩放，不循环） */}
        {NOTES.map((nt, i) => {
          const t = N - nt.at;
          if (t < 0) return null;
          const p = 1 - Math.pow(1 - clamp01(t / 9), 3);
          const isP = nt.purple;
          return (
            <DoorNote
              key={i}
              x={nt.x}
              y={nt.y}
              purple={isP}
              lineP={isP ? lineP : 1}
              caretOp={isP ? caretOp : 0}
              opacity={clamp01(t / 3)}
              scale={1.32 - 0.32 * p}
              rot={nt.rot + 6 * (1 - p)}
              dy={isP ? -4 * fl : 0}
              glowK={isP ? noteGlow : 0}
            />
          );
        })}
      </CameraRig>

      {/* 落版：Memory（唯一 GlitchIn）+ 记忆 */}
      <GlitchIn N={N} f0={5975} rgbSplit={5} slices={6} seed={24}>
        <CText
          cx={950}
          cy={282}
          size={96}
          family={FONT_WIDE}
          weight={400}
          color={WHITE}
          letterSpacing={4}
          shadow={`6px 6px 0 ${PURPLE_DEEP}, 0 0 26px rgba(102,45,248,.5)`}
        >
          Memory
        </CText>
      </GlitchIn>
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - 6011, 10)}}>
        <CText cx={950} cy={352} size={30} weight={700} color={GREY_LIGHT} letterSpacing={8}>
          记忆
        </CText>
        <div style={{position: 'absolute', left: 950 - 46, top: 380, width: 92, height: 2, background: PURPLE, opacity: 0.75}} />
      </div>
    </div>
  );
};
