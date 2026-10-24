import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GhostText, GlowBlob, LightSweep, StageLine, ghostOpacity} from '../../fx';
import {ChefIcon} from '../../icons';
import {PURPLE_DEEP, PURPLE_LIGHT, WHITE, exitOp, scaleIn, slideUp, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, easeInOutPow} from '../../common';
import {KITCHEN, MiniRing, PurpleKitchenMap, ringPos} from './parts';

/**
 * SC62 由你决定｜15362–15648（287 帧）——全片最后一镜
 * 前半场承接 SC61 的系统环（中场原位、环上光点继续转），技能 / 记忆各亮一拍；
 * 15480 起环缩到左上角（51 帧，15531 落位），主区重新亮起整张厨房地图：每个物件都是紫描边，厨师站回中间（x=700）。
 * 回扣扫光（白名单第 2 处）：LightSweep 一轮 + StageLine 沿台面线 y470 + GhostText 预示「怎么搭」。
 * 节拍：15370 技能决定它会不会按流程做（环上技能亮）/ 15455 记忆决定它能不能延续过去（记忆亮）/
 *       15535 而厨房怎么搭（地图 30 帧亮起）/ 15568 就决定了这位厨师最终能做什么（末行落下）
 * 持续：九处紫描边 3 帧错峰依次闪一次；墙带虚线缓慢行进。
 * 停留：15577 落定 → 片尾压黑（endingFade 从 15614 起），末 12 帧 exitOp 收尾。
 */
const F0 = 15362;
const TO = 15648;

// 系统环：先接着 SC61 的落点停在中场（15362–15455，技能 / 记忆两拍），再缩到左上角（15455–15506）
const SHRINK = {x0: 640, y0: 360, r0: 210, i0: 68, a0: 96, x1: 150, y1: 168, r1: 44, i1: 22, a1: 20};
const SHRINK_F0 = 15480;
const SHRINK_LEN = 51;
const ease = easeInOutPow(2.2);

/** 一拍扩散光环（技能 / 记忆各一次，与 SC61 同一语言） */
const halo = (n: number) => {
  if (n < 0) return null;
  const tt = clamp01(n / 26);
  return {r: 40 + 34 * tt, op: (1 - tt) * 0.9};
};

export const SC62: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // ---- 系统环：中场停 118 帧（承接 SC61，技能 / 记忆两拍）→ 51 帧缩进左上角 ----
  const t = ease(clamp01((N - SHRINK_F0) / SHRINK_LEN));
  const ring = {
    cx: SHRINK.x0 + (SHRINK.x1 - SHRINK.x0) * t,
    cy: SHRINK.y0 + (SHRINK.y1 - SHRINK.y0) * t,
    r: SHRINK.r0 + (SHRINK.r1 - SHRINK.r0) * t,
    icon: SHRINK.i0 + (SHRINK.i1 - SHRINK.i0) * t,
    agent: SHRINK.a0 + (SHRINK.a1 - SHRINK.a0) * t,
  };
  const skillLit = clamp01((N - 15370) / 8) * (1 - clamp01((N - 15455) / 12));
  const memoryLit = clamp01((N - 15455) / 8) * (1 - clamp01((N - 15535) / 12));
  const skillHalo = halo(N - 15370);
  const memoryHalo = halo(N - 15455);
  const [skx, sky] = ringPos(ring.cx, ring.cy, ring.r, 0);
  const [mex, mey] = ringPos(ring.cx, ring.cy, ring.r, 216);

  // ---- 厨房地图亮起 ----
  const mapOp = softOp(N - 15535, 30);
  const chefS = scaleIn(N - 15538, 21);
  const chefOp = clamp01(0.1 + 1.7 * chefS);
  const {chef, counterY} = KITCHEN;

  // 九处紫描边依次闪一次（15536 起，3 帧错峰）
  const flash = (i: number) => {
    const n = N - (15536 + i * 3);
    if (n < 0) return 0;
    return n < 3 ? n / 3 : Math.max(0, 1 - (n - 3) / 9);
  };

  // ---- 末行（早 3 帧起、12 帧落定，给片尾压黑前留满 38 帧纯停）----
  const lineN = N - 15565;
  const lineOp = softOp(lineN, 8);
  const lineY = slideUp(lineN, 50, 12);
  const ghost = ghostOpacity(N, 15538, 15565);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 12)}}>
      {/* 中场：缩小的系统环（技能 / 记忆各亮一拍）+ 两拍扩散光环 */}
      <MiniRing cx={ring.cx} cy={ring.cy} r={ring.r} iconSize={ring.icon} agentSize={ring.agent} orbitN={N} lit={{skill: skillLit, memory: memoryLit}} />
      {skillHalo || memoryHalo ? (
        <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {skillHalo ? <circle cx={skx} cy={sky} r={skillHalo.r} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2} opacity={skillHalo.op * 0.85} style={{filter: 'drop-shadow(0 0 8px rgba(102,45,248,.8))'}} /> : null}
          {memoryHalo ? <circle cx={mex} cy={mey} r={memoryHalo.r} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2} opacity={memoryHalo.op * 0.85} style={{filter: 'drop-shadow(0 0 8px rgba(102,45,248,.8))'}} /> : null}
        </svg>
      ) : null}

      {/* 紫描边厨房地图（坐标与 G1 KITCHEN 一致） */}
      <PurpleKitchenMap opacity={mapOp} dashN={Math.max(0, Math.min(N, 15578) - 15535)} flash={flash} />

      {/* 厨师：站回地图中央 */}
      <GlowBlob cx={chef.cx} cy={chef.cy} r={170} k={clamp01(chefS) * 0.9} alpha={0.16} />
      <div style={{position: 'absolute', inset: 0, opacity: chefOp * mapOp, transform: `scale(${chefS.toFixed(3)})`, transformOrigin: `${chef.cx}px ${chef.cy}px`}}>
        <ChefIcon cx={chef.cx} cy={chef.cy} size={chef.size} color={WHITE} accent={PURPLE_LIGHT} />
      </div>

      {/* 回扣扫光：一轮横扫 + 台面线舞台光 */}
      <LightSweep N={N} rounds={[15538]} dy={10} alphas={[0.5]} />
      <StageLine N={N} f0={15546} flashAt={15570} cx={chef.cx} cy={counterY} w={980} h={3} />

      {/* 「怎么搭」预示（末行落点处，15568 撤） */}
      <GhostText cx={640} cy={545} size={72} family={FONT_HEAVY} weight={900} letterSpacing={4} opacity={ghost}>
        怎么搭
      </GhostText>

      {/* 末行：厨房怎么搭，他就怎么干 */}
      {lineN >= 0 ? (
        <div style={{position: 'absolute', left: 0, top: 523, width: 1280, height: 70, opacity: lineOp, transform: `translateY(${lineY.toFixed(2)}px)`}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingRight: 40,
              fontFamily: FONT_HEAVY,
              fontWeight: 900,
              fontSize: 70,
              lineHeight: 1,
              letterSpacing: 2,
              color: WHITE,
              whiteSpace: 'nowrap',
              textShadow: `4px 4px 0 ${PURPLE_DEEP}, 0 0 24px rgba(102,45,248,.5)`,
            }}
          >
            厨房怎么搭，他就怎么干
          </div>
        </div>
      ) : null}

    </div>
  );
};
