import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {KnifeIcon} from '../../icons';
import {Box, GREY_LINE, GREY_MID, PURPLE_LIGHT, exitOp, glowOffK, glowPurple, softOp} from '../../ui';
import {clamp01, easeInOutPow} from '../../common';
import {ConfigColumn, CrateBox, CrateLid, WallShell} from './parts';

/**
 * SC48 装进一只木箱｜11753–11960｜第 6 章
 * 上一镜的三列清单被整个吸进右侧木箱：三列自右向左坍缩、缩小、消失；箱盖掀开一次；
 * 「箱子里可能有」四枚待填虚影浮在箱内；「几件工具」刀从箱口升起来。
 * 节拍：11761 于是有人把相关东西装进一只木箱（木箱 21 帧 scaleIn）/ 11868 箱子里可能有（四枚虚影 2 帧错峰）/
 *       11913 几件工具（刀 10 帧从箱口升起）。
 * 主角：木箱 280（墨迹约 185px），紫柔光；清单保持灰色，只作被吸走的东西。
 * 承接：上一镜的配置墙首帧即在（8 帧淡入补上硬切），随后整面吸入。
 * 层次：箱盖在箱体之后（掀开后立在箱后），刀夹在两者之间 —— 刀的下半截被箱体挡住，像真从箱口抽出来。
 */
const F0 = 11753;
const TO = 11960;

const CRATE = {cx: 940, cy: 400, size: 280};
const MOUTH = {x: 933, y: 384};
// 三列坍缩起点（8 帧错峰，各 20 帧）
const COL_AT = [11778, 11772, 11766];
const COL_CX = [240, 500, 760];
const COL_CY = 413;
// 每列吸干的那一帧，口沿上弹一圈（一次性）
const RING_AT = [11798, 11792, 11786];

// 箱内四枚待填虚影（夹在两侧竖板之间，上下两排落在木纹两侧）
const GHOSTS = [
  {x: 868, y: 402},
  {x: 946, y: 402},
  {x: 868, y: 452},
  {x: 946, y: 452},
];
const GHOST_W = 66;
const GHOST_H = 44;

// 刀：从箱内（整段藏在箱体后面）升到口沿上方 —— 刀尖墨迹约在 ±34/±26，落位时刀根正好停在口沿
const KNIFE = {x0: 940, y0: 442, x1: 940, y1: 362, size: 140};

const easeSuction = easeInOutPow(2.6);
const easeRise = easeInOutPow(2.2);

// 吸力余波：三列吸完之后，还有两件零碎被卷进去（把「装进」这个动作一直撑到下一拍）
const STRAYS = [
  {x0: 560, y0: 300, w: 176, h: 34, t: 11802},
  {x0: 742, y0: 466, w: 96, h: 26, t: 11812},
];

export const SC48: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 墙：承接上一镜，8 帧淡入；三列坍缩后整体退场
  const wallOp = softOp(N - 11751, 10) * (1 - clamp01((N - 11784) / 10));
  const shellFade = 1 - clamp01((N - 11766) / 16);

  // 木箱
  const crateN = N - 11764;
  const crateS = crateN < 0 ? 0 : clamp01(0.06 + 0.94 * (1 - Math.pow(1 - clamp01(crateN / 21), 2.6)));
  // 箱盖掀到底的一记轻微下沉（一次性，16 帧）
  const settle = N < 11784 ? 1 : 1 + 0.02 * Math.sin(clamp01((N - 11784) / 16) * Math.PI);
  const crateOp = crateN < 0 ? 0 : softOp(crateN, 6);
  const glowK = clamp01(crateN / 14) * off;

  // 箱盖：11774 起 13 帧掀开（翻到左侧立起来），之后保持敞开
  const lidOpen = clamp01((N - 11774) / 13);

  // 箱内的光：吸入后先留一点余晖（11790 起），11834 再亮一档，把「箱子里可能有」的四个槽照出来
  const innerK = (clamp01((N - 11790) / 24) * 0.35 + clamp01((N - 11834) / 14) * 0.65) * (1 - 0.45 * clamp01((N - 11918) / 16)) * off;

  // 刀：11908 从箱口升起，10 帧
  const knifeN = N - 11908;
  const riseK = knifeN < 0 ? 0 : easeRise(clamp01(knifeN / 10));
  const knifeX = KNIFE.x0 + (KNIFE.x1 - KNIFE.x0) * riseK;
  const knifeY = KNIFE.y0 + (KNIFE.y1 - KNIFE.y0) * riseK;
  const knifeOp = softOp(knifeN, 5);
  const knifeGlow = clamp01(knifeN / 10);
  // 落位脉冲（一次性，14 帧）
  const pulseK = knifeN >= 10 ? clamp01((knifeN - 10) / 14) : 0;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* ---------- 上一镜的配置墙：被吸走 ---------- */}
      <div style={{position: 'absolute', inset: 0, opacity: wallOp}}>
        <div style={{position: 'absolute', inset: 0, opacity: shellFade}}>
          <WallShell p={1} glowK={0.12 * glowOffK(N, 11790, 6, 6)} />
        </div>
        {[0, 1, 2].map((i) => {
          const p = clamp01((N - COL_AT[i]) / 20);
          const e = easeSuction(p);
          const dx = MOUTH.x - COL_CX[i];
          const dy = MOUTH.y - COL_CY;
          const s = 1 - 0.965 * e;
          const op = 1 - clamp01((p - 0.48) / 0.52);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: op,
                transform: `translate(${(dx * e).toFixed(2)}px, ${(dy * e).toFixed(2)}px) scale(${s.toFixed(4)})`,
                transformOrigin: `${COL_CX[i]}px ${COL_CY}px`,
              }}
            >
              <ConfigColumn
                i={i}
                kind={i === 0 ? 'knife' : i === 1 ? 'recipe' : 'plug'}
                bayP={1}
                headerK={1}
                rowK={[1, 1, 1, 1, 1, 1]}
              />
            </div>
          );
        })}
      </div>

      {/* ---------- 吸力余波：三列吸完后，最后两件零碎也被卷进去（画在木箱之前，是从箱后穿过） ---------- */}
      {STRAYS.map((s, i) => {
        const p0 = clamp01((N - s.t) / 32);
        if (p0 <= 0 || p0 >= 1) return null;
        const popIn = Math.min(1, (N - s.t + 1) / 3);
        // 拖尾：往前取 3 个更早的位置画残影，把「被吸过去」的方向说清楚
        return [0.18, 0.12, 0.06, 0].map((lag, j) => {
          const p = clamp01(p0 - lag);
          if (p <= 0) return null;
          const e = Math.pow(p, 1.45);
          const cx = s.x0 + (MOUTH.x - s.x0) * e;
          const cy = s.y0 + (MOUTH.y - s.y0) * e;
          const k = 1 - 0.92 * e;
          const w = s.w * k;
          const h = s.h * k;
          const trailOp = j === 3 ? 1 : 0.3 - j * 0.08;
          return (
            <div key={`${i}-${j}`} style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, opacity: popIn * (1 - Math.pow(p0, 4)) * trailOp}}>
              <Box x={0} y={0} w={w} h={h} r={4} fill="rgba(0,0,0,0.55)" stroke={GREY_LINE} sw={1.6} />
              {j === 3 && <div style={{position: 'absolute', left: w * 0.12, top: h * 0.42, width: w * 0.42, height: Math.max(2, h * 0.12), borderRadius: 2, background: GREY_MID, opacity: 0.85}} />}
            </div>
          );
        });
      })}

      {/* ---------- 木箱 ---------- */}
      <GlowBlob cx={CRATE.cx} cy={CRATE.cy} r={236} N={N} k={glowK} alpha={0.17} />
      <GlowBlob cx={CRATE.cx} cy={CRATE.cy} r={150} N={N} k={glowK} alpha={0.2} />

      {/* 箱盖：先画，掀开后立在箱后，下半截被箱体挡住（立起来后压低一点亮度，拉开前后层次） */}
      {crateN >= 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: crateOp * (1 - 0.2 * lidOpen), transform: `scale(${(crateS * settle).toFixed(4)})`, transformOrigin: `${CRATE.cx}px ${CRATE.cy}px`}}>
          <CrateLid cx={CRATE.cx} cy={CRATE.cy} size={CRATE.size} open={lidOpen} color="#FFFFFF" accent={PURPLE_LIGHT} />
        </div>
      )}

      {/* 从箱口升起的刀：夹在箱盖与箱体之间 */}
      {knifeN >= 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: knifeOp}}>
          <div style={{position: 'absolute', left: knifeX - 104, top: knifeY - 104, width: 208, height: 208, borderRadius: '50%', background: 'radial-gradient(circle, rgba(102,48,248,0.26) 0%, rgba(102,48,248,0) 68%)', opacity: knifeGlow}} />
          <KnifeIcon cx={knifeX} cy={knifeY} size={KNIFE.size} color="#FFFFFF" accent={PURPLE_LIGHT} />
        </div>
      )}

      {/* 箱体：挡住刀的下半截 */}
      {crateN >= 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: crateOp, transform: `scale(${(crateS * settle).toFixed(4)})`, transformOrigin: `${CRATE.cx}px ${CRATE.cy}px`}}>
          <CrateBox cx={CRATE.cx} cy={CRATE.cy} size={CRATE.size} open={lidOpen} color="#FFFFFF" accent={PURPLE_LIGHT} showLid={false} />
        </div>
      )}

      {/* 箱内亮起来的光：贴着口沿往下渗，画在箱体里，不外溢 */}
      {innerK > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: 850,
            top: 384,
            width: 180,
            height: 134,
            opacity: innerK,
            background: 'radial-gradient(ellipse 100px 82px at 50% 3%, rgba(102,48,248,0.34) 0%, rgba(102,48,248,0) 100%)',
          }}
        />
      )}

      {/* ---------- 箱内四枚待填虚影（11862 起，正好卡在字幕块前 6 帧；描边加粗，别在 0.5 倍屏上糊掉） ---------- */}
      {GHOSTS.map((g, i) => {
        const n = N - (11862 + i * 2);
        if (n < 0) return null;
        const k = softOp(n, 10);
        return (
          <div key={i} style={{position: 'absolute', left: g.x, top: g.y, width: GHOST_W, height: GHOST_H, opacity: k * (1 - 0.42 * knifeGlow)}}>
            <Box x={0} y={0} w={GHOST_W} h={GHOST_H} r={5} fill="rgba(102,48,248,0.16)" stroke={PURPLE_LIGHT} sw={2.6} dashed />
            <div style={{position: 'absolute', left: 13, top: 19, width: 40 * clamp01((n - 4) / 10), height: 4, borderRadius: 2, background: PURPLE_LIGHT, opacity: 0.5}} />
          </div>
        );
      })}

      {/* 每列吸干时，口沿上弹一圈（一次性，不循环） */}
      {RING_AT.map((t) => {
        const n = N - t;
        if (n < 0 || n >= 14) return null;
        const k = n / 14;
        return (
          <div
            key={t}
            style={{
              position: 'absolute',
              left: MOUTH.x - 26,
              top: MOUTH.y - 26,
              width: 52,
              height: 52,
              borderRadius: 26,
              border: `2px solid ${PURPLE_LIGHT}`,
              opacity: 0.75 * (1 - k),
              transform: `scale(${(0.5 + 1.5 * k).toFixed(3)})`,
            }}
          />
        );
      })}

      {/* 落位脉冲：刀抽出来停住的瞬间，口沿再弹一圈 */}
      {pulseK > 0 && pulseK < 1 && (
        <div style={{position: 'absolute', left: 940 - 30, top: 383 - 30, width: 60, height: 60, borderRadius: 30, border: `2px solid ${PURPLE_LIGHT}`, opacity: 0.8 * (1 - pulseK), transform: `scale(${(1 + 2.2 * pulseK).toFixed(3)})`, boxShadow: glowPurple(0.8 * (1 - pulseK))}} />
      )}
    </div>
  );
};
