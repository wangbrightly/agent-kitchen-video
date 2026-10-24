import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {GREY_LIGHT, PURPLE_LIGHT, WHITE, exitOp, firstOp, glowOffK} from '../../ui';
import {clamp01} from '../../common';
import {KitchenLineArt} from '../G1/parts';
import {AlarmDevice, DashPolyline, GlowDot, type Pt} from './parts';

/**
 * SC33 烟感与探针｜8073–8332｜「表盘负责监测温度 / 顶上的铃铛负责报警 / 中间垂下来一根探针 / 持续观察厨房里的变化」
 * 回到地图（G1 空间基准，默认相机不推）：墙上挂着烟感 + 恒温器，中间垂下一条虚线探针，末端一个小圆点。
 * 主角：AlarmDevice 320 @ (640,340)（线稿墨迹 0.85×size ≈272px），紫柔光。
 * 配角：厨房线稿 0.32、探针虚线、底部扫描线。
 * 持续动作：探针端点以 40 帧为周期左右摆（8220 → 末帧），表盘指针另以 95 帧为周期缓慢摆动（全程）。
 * 无 GlitchIn（不在白名单）；末拍 8289 落位，8324 起淡出，稳定 35 帧。
 */
const F0 = 8073;
const TO = 8332;

const DEV = {cx: 640, cy: 340, size: 320};
const PIVOT_Y = DEV.cy + ((68 - 50) / 100) * DEV.size; // 装置底部 = 探针悬挂点 397.6
const ROD_LEN = 204;
const TRACK = {x0: 300, x1: 980, y: 602};

export const SC33: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 线稿：首帧 0.22，12 帧补到 0.32
  const lineOp = 0.32 * (0.68 + 0.32 * firstOp(N - F0, 12));

  // 装置：8078 scaleIn 21 帧（8081 字幕的 −3）
  const dN = N - 8078;
  const dS = 0.72 + 0.28 * clamp01(dN / 21) ** 0.6;
  // 装置本体跟着整镜一起淡出（外层 exitOp），不要让它在厨房线稿还在时就消失——否则末 8 帧只剩空厨房，与 SC34 的接缝对不上
  const dOp = clamp01((dN + 1) / 9);
  const dGlow = clamp01(dN / 14) * off;

  // 表盘指针：全程缓慢摆动（95 帧一个来回）
  const needle = 20 * Math.sin(((N - 8078) / 95) * Math.PI * 2);

  // 顶上铃铛：8133 亮起（8136 字幕的 −3），8198 交给探针后退回半亮
  const bellK = clamp01((N - 8133) / 10) * (1 - 0.55 * clamp01((N - 8198) / 20));

  // 探针：8198 起 22 帧自悬挂点 draw-on；8220 起端点左右摆（40 帧一次）
  const rodP = clamp01((N - 8198) / 22);
  const swing = N <= 8220 ? 0 : 26 * Math.sin(((N - 8220) / 40) * Math.PI * 2);
  const rad = (swing * Math.PI) / 180;
  const tip: Pt = [DEV.cx + ROD_LEN * rodP * Math.sin(rad), PIVOT_Y + ROD_LEN * rodP * Math.cos(rad)];
  const tipOp = clamp01((N - 8216) / 6) * off;

  // 底部扫描线：8251 起 38 帧 draw-on（8253 字幕的 −2）
  const trkP = clamp01((N - 8251) / 38);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <KitchenLineArt N={N} opacity={lineOp} />

      {/* 主角：烟感 + 恒温器 */}
      {dN >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: dOp, transform: `scale(${dS.toFixed(4)})`, transformOrigin: `${DEV.cx}px ${DEV.cy}px`}}>
          <GlowBlob cx={DEV.cx} cy={DEV.cy} r={230} N={N} k={dGlow * 0.8} alpha={0.18} />
          <GlowBlob cx={DEV.cx} cy={DEV.cy} r={150} N={N} k={dGlow * 0.85} alpha={0.22} />
          <AlarmDevice cx={DEV.cx} cy={DEV.cy} size={DEV.size} color={WHITE} accent={PURPLE_LIGHT} opacity={1} needle={needle} bellK={bellK} stub={false} />
          {/* 铃铛单独一束光：8136 这一拍的重点 */}
          {bellK > 0.02 ? <GlowBlob cx={685} cy={236} r={86} N={N} k={bellK * off} alpha={0.26} /> : null}
        </div>
      ) : null}

      {/* 探针：从装置底部垂下的虚线（末端跟随摆动） */}
      {rodP > 0 ? <DashPolyline pts={[[DEV.cx, PIVOT_Y], tip]} p={1} color={PURPLE_LIGHT} sw={2.4} dash={'9 8'} opacity={0.9 * off} /> : null}
      {tipOp > 0.01 ? <GlowDot cx={tip[0]} cy={tip[1]} r={5.5} color={WHITE} opacity={tipOp} /> : null}

      {/* 底部扫描线：表示探针在扫厨房 */}
      {trkP > 0 ? (
        <DashPolyline pts={[[TRACK.x0, TRACK.y], [TRACK.x1, TRACK.y]]} p={trkP} color={GREY_LIGHT} sw={1.8} dash={'6 10'} opacity={0.55 * off} />
      ) : null}
    </div>
  );
};
