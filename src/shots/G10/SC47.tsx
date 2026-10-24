import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GREY_LINE, RED_DEEP, exitOp, glowOffK, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, kf} from '../../common';
import {ConfigColumn, WALL, WallShell} from './parts';

/**
 * SC47 一件一件配太慢｜11500–11752｜第 6 章起手（章节卡在 11457–11499，由覆盖层画，本镜不补）
 * 三列竖排清单：刀 → 菜谱 → 外部服务，每一项下面跟着一串要填的灰表单行，越堆越多，最后堆成一面墙。
 * 节拍：11508 如果每次安装能力（三列 8 帧错峰画框）/ 11550 都要一件一件配置（第一列「能力」空槽 + 表单行开始堆）/
 *       11600 拿一把刀（空槽换成刀）/ 11620 配一张菜谱 / 11653 再接一个外部服务 / 11702 会非常麻烦（整体下沉 6px + 红章落下）。
 * 主角：三列组 760 宽；整体灰，只在外框留一层很淡的紫柔光（硬规则要求，见 BUILD_NOTES）。
 * 持续：18 行表单从 11550 一直堆到 11693；11698 整体下沉 6px + 红章落下（提前 4 帧落稳，换出末拍 30+ 帧停留）。
 */
const F0 = 11500;
const TO = 11752;

const BAY_AT = [11504, 11512, 11520];
const ROW_AT: number[][] = [
  [11550, 11558, 11566, 11574, 11600, 11608],
  [11620, 11628, 11636, 11644, 11652, 11660],
  [11653, 11661, 11669, 11677, 11685, 11693],
];
const HEAD_AT = [11600, 11620, 11653];

const STAMP = {x: 1014, y: 446, w: 176, h: 78};

export const SC47: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  const shellP = clamp01((N - 11504) / 22);
  const glowK = 0.16 * clamp01((N - 11514) / 16) * (1 - 0.45 * clamp01((N - 11698) / 8)) * off;
  const sink = 6 * clamp01((N - 11698) / 8);

  // 「麻烦」红章：11698 出现，7 帧从 1.5 压到 1（带回弹）——要在 11708 前落稳，才留得出 30 帧以上的末拍停留
  const stampN = N - 11698;
  const stampS = stampN < 0 ? 0 : kf(stampN, [
    [0, 1.5],
    [5, 0.94],
    [7, 1],
  ], (u) => u * u * (3 - 2 * u));
  const stampOp = softOp(stampN, 3);
  const stampShake = stampN >= 0 && stampN < 4 ? Math.sin((stampN / 4) * Math.PI * 5) * 2.2 * (1 - stampN / 4) : 0;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 墙外壳整体下沉 6px */}
      <WallShell p={shellP} sink={sink} glowK={glowK} />

      {/* 三列（列框 8 帧错峰；行 2 帧错峰）共 18 行 */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', inset: 0, transform: `translateY(${sink.toFixed(2)}px)`}}>
          <ConfigColumn
            i={i}
            kind={i === 0 ? 'knife' : i === 1 ? 'recipe' : 'plug'}
            bayP={clamp01((N - BAY_AT[i]) / 18)}
            placeholderK={i === 0 ? clamp01((N - 11550) / 10) : 0}
            headerK={clamp01((N - HEAD_AT[i]) / 12)}
            rowK={ROW_AT[i].map((t) => clamp01((N - t) / 10))}
          />
        </div>
      ))}

      {/* 11702「会非常麻烦」：右下角一枚红章落下 */}
      {stampN >= 0 && (
        <div style={{position: 'absolute', left: STAMP.x, top: STAMP.y + sink, width: STAMP.w, height: STAMP.h, opacity: stampOp, transform: `rotate(-7deg) scale(${stampS.toFixed(3)}) translateX(${stampShake.toFixed(2)}px)`, transformOrigin: '50% 50%'}}>
          <div style={{position: 'absolute', inset: 0, border: `3px solid ${RED_DEEP}`, borderRadius: 6, background: 'rgba(0,0,0,0.62)', boxShadow: '0 0 22px rgba(236,8,31,0.35)'}} />
          <div style={{position: 'absolute', left: 0, top: 12, width: STAMP.w, textAlign: 'center', fontFamily: FONT_HEAVY, fontWeight: 900, fontSize: 46, lineHeight: '52px', letterSpacing: 6, color: RED_DEEP, whiteSpace: 'nowrap'}}>麻烦</div>
          {/* 章下面压一道细红线 */}
          <div style={{position: 'absolute', left: 22, top: STAMP.h - 16, width: STAMP.w - 44, height: 2, background: RED_DEEP, opacity: 0.75}} />
        </div>
      )}

      {/* 收尾：墙脚一条极淡的投影线（非紫） */}
      <div style={{position: 'absolute', left: WALL.x - 8, top: WALL.y + WALL.h + 10 + sink, width: WALL.w * clamp01((N - 11520) / 24), height: 2.4, background: GREY_LINE, opacity: 0.3}} />
    </div>
  );
};
