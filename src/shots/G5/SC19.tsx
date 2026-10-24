import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GlowBlob, type CamKey} from '../../fx';
import {ChefIcon, KnifeIcon} from '../../icons';
import {CText, GREY, GREY_LINE, PURPLE, PURPLE_DEEP, SoftIn, WHITE, exitOp, firstOp, glowOffK, mixHex, scaleIn, softOp} from '../../ui';
import {FONT_WIDE, GlitchIn, clamp01} from '../../common';
import {KITCHEN, KitchenLineArt} from '../G1/parts';
import {SkillBox} from './parts';

/**
 * SC19 有了手，还要知道做菜的方法｜4398–4719
 * 承接第 2 章：回到厨房全景，厨师 + 刀仍是上一章的「手」，随后退成灰线，把画面让给台面左边的卡盒。
 * 主角：CardBoxIcon 260 @ 世界坐标 (385,430)（唯一发光主体）。
 * 配角：厨房线稿（全片空间基准）、厨师 190、刀、Skill 大字、技能小字。
 * 运镜：4406 起 30 帧，全景 (640,360,1) → 台面左段 (430,400,1.33)。
 * 唯一 GlitchIn：4548 Skill。
 * 持续动作：盒内四张卡从 4607 起循环「抽出 6px 再落回」，每张 6 帧、2 帧错峰（分镜明确禁止错位呼吸）。
 */
const F0 = 4398;
const TO = 4719;

// 地图推近：4406–4436（30 帧），之后不动
const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 4406, x: 640, y: 360, s: 1},
  {f: 4436, x: 430, y: 400, s: 1.33},
  {f: TO, x: 430, y: 400, s: 1.33},
];

export const SC19: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 线稿：镜头首帧就要能认出是厨房（首帧约 0.3），18 帧补到 0.5 并保持
  const lineOp = 0.5 * (0.6 + 0.4 * firstOp(N - F0, 18));

  // 厨师：上一章的「手」，白色 + 紫光 → 灰线 → 几乎退场
  const chefOp = 1 - 0.94 * clamp01((N - 4430) / 70);
  const chefCol = mixHex(WHITE, GREY_LINE, clamp01((N - 4418) / 50));
  // 首帧就要有承接的能量：0.75 起步，8 帧到 1，4430 后退掉
  const chefGlow = (0.75 + 0.25 * clamp01((N - F0) / 8)) * (1 - clamp01((N - 4430) / 12));

  // 卡盒：4483 scaleIn 21 帧（分镜原帧），紫柔光
  const boxN = N - 4483;
  const boxS = scaleIn(boxN, 21);
  const boxOp = softOp(boxN, 10);
  const boxGlow = clamp01(boxN / 12) * off;

  // 抽卡循环：每张 6px、6 帧，2 帧错峰；24 帧一轮，保证「每张卡片」这一段一直有抽卡动作
  // 4667 之后停手（该帧四张卡的 phase 都处在停歇段），给末拍留 ~38 帧稳定期再离场
  const lifts = [0, 1, 2, 3].map((i) => {
    if (N >= 4667) return 0;
    const start = 4607 + i * 2;
    if (N < start) return 0;
    const phase = (N - start) % 24;
    if (phase >= 6) return 0;
    return 6 * Math.sin((Math.PI * phase) / 5);
  });

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        <KitchenLineArt N={N} opacity={lineOp} />

        {/* 上一章的厨师与刀：先亮着承接，再退成灰细线 */}
        <div style={{position: 'absolute', inset: 0, opacity: chefOp}}>
          <GlowBlob cx={KITCHEN.chef.cx} cy={KITCHEN.chef.cy} r={170} k={chefGlow} alpha={0.24} />
          <GlowBlob cx={KITCHEN.chef.cx} cy={KITCHEN.chef.cy} r={112} k={chefGlow} alpha={0.26} />
          <ChefIcon cx={KITCHEN.chef.cx} cy={KITCHEN.chef.cy} size={KITCHEN.chef.size} color={chefCol} accent={chefGlow > 0.15 ? PURPLE : chefCol} />
          <div style={{position: 'absolute', inset: 0, transform: 'rotate(-24deg)', transformOrigin: '772px 382px'}}>
            <KnifeIcon cx={772} cy={382} size={78} color={chefCol} accent={chefGlow > 0.15 ? PURPLE : chefCol} />
          </div>
        </div>

        {/* 主角：技能卡盒（4483 落位） */}
        {boxN >= 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: boxOp, transform: `scale(${(0.4 + 0.6 * boxS).toFixed(3)})`, transformOrigin: '385px 430px'}}>
            <GlowBlob cx={385} cy={430} r={215} k={boxGlow} alpha={0.2} />
            <GlowBlob cx={385} cy={430} r={150} k={boxGlow} alpha={0.24} />
            <SkillBox cx={385} cy={430} size={260} color={WHITE} accent={PURPLE} lift={lifts} />
          </div>
        )}
      </CameraRig>

      {/* Skill：屏幕空间大字，唯一一处 GlitchIn */}
      <GlitchIn N={N} f0={4548} rgbSplit={5} slices={6} seed={19}>
        <CText
          cx={950}
          cy={332}
          size={96}
          family={FONT_WIDE}
          weight={400}
          color={WHITE}
          letterSpacing={2}
          shadow={`6px 6px 0 ${PURPLE_DEEP}, 0 0 26px rgba(102,45,248,.45)`}
        >
          Skill
        </CText>
      </GlitchIn>

      {/* 中文释义：4581 */}
      <SoftIn N={N} f0={4581} len={10} dy={10}>
        <CText cx={950} cy={404} size={30} weight={500} color={GREY} letterSpacing={4}>
          技能
        </CText>
      </SoftIn>
    </div>
  );
};
