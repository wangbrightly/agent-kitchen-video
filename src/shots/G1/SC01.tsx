import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GhostText, GlowBlob, LightSweep, StageLine, ghostOpacity, type CamKey} from '../../fx';
import {ChefIcon} from '../../icons';
import {PURPLE, WHITE, exitOp, firstOp, glowOffK, scaleIn, softOp} from '../../ui';
import {clamp01} from '../../common';
import {DashRing, KITCHEN, KitchenLineArt} from './parts';

/**
 * SC01 厨房全景｜78–303｜「先看厨房里最重要的两样东西。一个在脑子里，一个站在灶台前。」
 * 主角：厨师 ChefIcon 190（全片唯一白色实体 + 紫柔光）。
 * 配角：冰箱 / 墙带 / 台面线 / 木箱（GREY_LINE 线稿，不发光）。
 * 高光：LightSweep 三轮 + StageLine 舞台线 + GhostText 预示（全片仅两处之一）。
 * 持续动作：墙带虚线流动 + 厨师柔光呼吸；末段整体拉出 1.0→0.95。
 * 元素节拍：84 厨师 / 86 扫光 / 158 头顶虚线圈 / 217 脚下虚线圈 + 台面线白闪。
 */
const F0 = 78;
const TO = 303;

// 拉出：222 起 33 帧，1.0→0.95（结束帧 255，留足末拍稳定期）
const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 222, x: 640, y: 360, s: 1},
  {f: 255, x: 640, y: 360, s: 0.95},
  {f: TO, x: 640, y: 360, s: 0.95},
];

export const SC01: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // 线稿 30 帧 0→0.5；80 起（S01 块首 86 的 −6，落进「元素出现窗口」）
  const lineK = firstOp(N - 80, 30);
  // 厨师 84 起 21 帧缩放入场（首帧能量到，避免空场）
  const chefN = N - 84;
  const chefS = scaleIn(chefN, 21);
  const chefOp = chefN < 0 ? 0 : clamp01(0.15 + 1.4 * chefS);
  // 紫柔光：随厨师入场亮起，离场前 6 帧熄灭
  const glowK = clamp01((N - 84) / 12) * glowOffK(N, TO, 6, 8);

  const ghostBrain = ghostOpacity(N, 84, 164); // 预示「大脑」，讲到 161 的台词时撤
  const ghostChef = ghostOpacity(N, 84, 220); // 预示「厨师」，讲到 217 的台词时撤
  const topRingOp = softOp(N - 158, 10); // 头顶空虚线圆（161 的「脑子里」）
  const feetRingOp = softOp(N - 214, 10); // 脚下空虚线圆（217 的「站在灶台前」）

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        {/* 空间基准线稿 */}
        <KitchenLineArt N={N} opacity={0.5 * lineK} />

        {/* 预示轮廓：两样东西的占位 */}
        <GhostText cx={575} cy={170} size={72} weight={900} letterSpacing={4} opacity={ghostBrain}>
          大脑
        </GhostText>
        <GhostText cx={825} cy={170} size={72} weight={900} letterSpacing={4} opacity={ghostChef}>
          厨师
        </GhostText>

        {/* 头顶 / 脚下的空虚线圈 */}
        <DashRing cx={KITCHEN.ringTop.cx} cy={KITCHEN.ringTop.cy} rx={KITCHEN.ringTop.r} opacity={topRingOp * 0.9} phase={-N * 0.8} />
        <DashRing cx={KITCHEN.ringFeet.cx} cy={KITCHEN.ringFeet.cy} rx={KITCHEN.ringFeet.rx} ry={KITCHEN.ringFeet.ry} opacity={feetRingOp * 0.9} phase={N * 0.8} />

        {/* 台面线：f0=100 展宽，217「站在灶台前」白闪 3 帧 */}
        <StageLine N={N} f0={100} flashAt={217} cx={700} cy={KITCHEN.counterY} w={980} h={3} />

        {/* 主角：厨师（唯一白色实体，带紫柔光） */}
        {chefN >= 0 && (
          <div style={{position: 'absolute', inset: 0, transform: `scale(${chefS})`, transformOrigin: `${KITCHEN.chef.cx}px ${KITCHEN.chef.cy}px`, opacity: chefOp}}>
            <GlowBlob cx={KITCHEN.chef.cx} cy={KITCHEN.chef.cy} r={172} N={N} k={glowK} alpha={0.22} />
            <GlowBlob cx={KITCHEN.chef.cx} cy={KITCHEN.chef.cy} r={118} N={N} k={glowK} alpha={0.26} />
            <ChefIcon cx={KITCHEN.chef.cx} cy={KITCHEN.chef.cy} size={KITCHEN.chef.size} color={WHITE} accent={PURPLE} />
          </div>
        )}
      </CameraRig>

      {/* 扫光三件套之一：三轮紫光横扫（屏幕空间，不随相机缩放） */}
      <LightSweep N={N} rounds={[86, 104, 122]} dy={10} alphas={[0.55, 0.5, 0.45]} />
    </div>
  );
};
