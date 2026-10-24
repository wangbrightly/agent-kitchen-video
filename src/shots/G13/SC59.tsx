import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, type CamKey} from '../../fx';
import {GREY_LINE, exitOp, glowOffK, scaleIn, softOp, abs} from '../../ui';
import {clamp01, easeInOutPow} from '../../common';
import {FIVE, OuterPanel, RoleRow} from './parts';

/**
 * SC59 外面还有三件事｜14525–14825（301 帧）
 * 左侧五行清单缩小左移（14533 起 22 帧，scale 1→0.62 + 左移），右侧立起「外圈」面板：
 *   第一行 MCP → 手从哪里接进来（插座 → 厨师手的循环光点，贯穿整镜）
 *   第二行 谁来启动任务（人按 Command / 机器触发 Hook）
 *   第三行 留空位（SC60 补 Plugin）
 * 节拍：14533 三件事 / 14605 手从哪来 / 14637 靠 MCP / 14682 谁来启动 / 14709 Command / 14759 Hook
 * 运镜：14533–14563 整组平移 60（CameraRig）；面板 14533 淡入，行内容在运镜结束后按节拍入场。
 * 停留：14770 落位 → 14817 离场（47 帧）。
 */
const F0 = 14525;
const TO = 14825;

const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 14533, x: 640, y: 360, s: 1},
  {f: 14563, x: 700, y: 360, s: 1},
  {f: TO, x: 700, y: 360, s: 1},
];

const ease = easeInOutPow(2.2);

export const SC59: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 左：五行清单缩小左移；第五行的紫色先退掉
  const shrink = ease(clamp01((N - 14533) / 22));
  const listScale = 1 - 0.38 * shrink;
  const listShift = -510 * shrink;
  const lit5 = (1 - clamp01((N - 14525) / 12)) * off;

  // 右：面板整体淡入；行 1 在运镜结束后 21 帧 scaleIn
  const panelOp = softOp(N - 14533, 10);
  const row1K = scaleIn(N - 14605, 21);
  const row2K = scaleIn(N - 14682, 20);

  // 三行的当前重点（同一时刻只有一处紫）
  const mcpLit = clamp01((N - 14637) / 10) * (1 - clamp01((N - 14709) / 10)) * off;
  const cmdLit = clamp01((N - 14709) / 10) * (1 - clamp01((N - 14759) / 6)) * off;
  const hookLit = clamp01((N - 14759) / 10) * off;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        {/* ---- 左：缩小后的五行清单（只留图标 + 名称） ---- */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.86,
            transform: `translateX(${listShift.toFixed(2)}px) scale(${listScale.toFixed(4)})`,
            transformOrigin: '900px 402px',
          }}
        >
          {(['brain', 'tool', 'skill', 'memory', 'role'] as const).map((k, i) => (
            <RoleRow key={k} kind={k} top={FIVE.rows[i]} lit={i === 4 ? lit5 : 0} clauseOp={0} showClause={false} />
          ))}
        </div>

        {/* ---- 右：外圈面板（预移 40px，抵消相机平移，落在画面右半） ---- */}
        <div style={{position: 'absolute', inset: 0, opacity: panelOp, transform: 'translateX(40px)'}}>
          <OuterPanel N={N} row1K={row1K} row2K={row2K} mcpLit={mcpLit} cmdLit={cmdLit} hookLit={hookLit}>
            {/* 行 1 / 行 2 的虚线骨架：面板先立起来，内容按节拍再进 */}
            {[252, 362].map((cy, i) => {
              const op = 0.3 * (1 - clamp01((N - (i === 0 ? 14605 : 14682)) / 6));
              return op > 0.01 ? (
                <div key={cy} style={{position: 'absolute', inset: 0, opacity: op}}>
                  <div style={{...abs(622, cy - 24, 48, 48), boxSizing: 'border-box', border: `1px dashed ${GREY_LINE}`, borderRadius: 6}} />
                  <div style={{...abs(690, cy - 4, 150, 8), borderRadius: 4, background: GREY_LINE}} />
                </div>
              ) : null;
            })}
            {/* 第三行：留空位（SC60 补 Plugin） */}
            <div style={{position: 'absolute', inset: 0, opacity: 0.55}}>
              <div style={{...abs(614, 432, 532, 80), boxSizing: 'border-box', border: `1.5px dashed ${GREY_LINE}`, borderRadius: 10}} />
              {[0, 1, 2].map((i) => (
                <div key={i} style={{position: 'absolute', left: 878.5 + i * 12, top: 469, width: 3, height: 3, borderRadius: 2, background: GREY_LINE, opacity: 0.95}} />
              ))}
            </div>
          </OuterPanel>
        </div>
      </CameraRig>
    </div>
  );
};
