import React from 'react';
import {useCurrentFrame} from 'remotion';
import {HeroGlow} from '../../fx';
import {SocketIcon} from '../../icons';
import {Box, GREY_LIGHT, GREY_LINE, PURPLE, PURPLE_LIGHT, WHITE, exitOp, glowOffK, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, easeInOutPow} from '../../common';
import {Link, NET, RunDot, ServiceRow, busPath, polyAt, rowMid, rowTop} from './parts';

/**
 * SC43 外部的工具和数据｜10504–10684｜「外部的工具和数据，都能接进来。」
 * 沿用 SC42 的同一块面板与同一个插座：数据库、搜索服务、企业内部系统、第三方应用依次点亮，
 * 每亮一行就从插座拉出一条线过来；五条线上的光点错开相位反复流动。
 * 节拍：10512 数据库 / 10546 搜索服务 / 10586 企业内部系统 / 10634 第三方应用。
 * 主角：接入面板（紫柔光）；紫光跟着当前行移动。
 * 本镜与上一镜布景完全相同，所以开场用 10 帧淡入做交接，避免硬闪。
 */
const F0 = 10504;
const TO = 10684;

const TRUNK = (): Array<[number, number]> => [
  [NET.sock.cx + 76, NET.sock.cy],
  [NET.busX, NET.sock.cy],
];

// 第 0 行（文件系统）上一镜已点亮；本镜从第 1 行起依次点亮
const LIT_AT = [10290, 10510, 10544, 10584, 10632];

export const SC43: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 布景交接：10 帧淡入
  const fo = softOp(N - F0, 10);
  const panelGlow = (0.4 + 0.25 * clamp01((N - 10510) / 12)) * off * fo;

  // 每行的点亮进度
  const K = LIT_AT.map((at) => clamp01((N - at) / 11));
  // 当前行 = 最后点亮的那一行；换行后上一行压暗一点
  const current = (i: number) => (i === 4 ? 1 : 1 - clamp01((N - LIT_AT[i + 1]) / 10));
  // 支线：第 i 行在点亮前 1 帧开始画
  const TAP_AT = [10438, 10509, 10543, 10583, 10631];

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* ---- 面板（与 SC42 同位置同尺寸） ---- */}
      <div style={{position: 'absolute', inset: 0, opacity: fo}}>
        <HeroGlow x={NET.panel.x} y={NET.panel.y} w={NET.panel.w} h={NET.panel.h} r={18} N={N} k={panelGlow} />
        <Box x={NET.panel.x} y={NET.panel.y} w={NET.panel.w} h={NET.panel.h} r={16} fill="rgba(0,0,0,0.46)" stroke={GREY_LINE} sw={1.6} />
        <div style={{position: 'absolute', left: NET.panel.x + 18, top: NET.panel.y + 12, fontFamily: FONT_HEAVY, fontWeight: 600, fontSize: 22, letterSpacing: 3, color: GREY_LIGHT, whiteSpace: 'nowrap'}}>MCP server</div>
        <div style={{position: 'absolute', left: NET.panel.x + 18, top: NET.panel.y + 40, width: NET.panel.w - 36, height: 1.2, background: GREY_LINE, opacity: 0.35}} />
      </div>

      {/* ---- 五行：0 已亮，1–4 依次点亮 ---- */}
      {[0, 1, 2, 3, 4].map((i) => {
        const k = K[i];
        const cur = current(i);
        return (
          <ServiceRow
            key={i}
            i={i}
            k={k}
            dim={1 - 0.3 * (1 - cur)}
            op={fo}
            dx={0}
            glowK={i === 0 ? 0 : k * cur * 0.55 * off * fo}
          />
        );
      })}

      {/* ---- 左：插座（与 SC42 同位置） ---- */}
      <div style={{position: 'absolute', inset: 0, opacity: fo}}>
        <SocketIcon cx={NET.sock.cx} cy={NET.sock.cy} size={NET.sock.size} color={WHITE} accent={PURPLE_LIGHT} />
      </div>

      {/* 干线 + 接口点（上一镜已有） */}
      <div style={{opacity: fo}}>
        <Link pts={TRUNK()} p={1} color={PURPLE_LIGHT} w={2.6} opacity={0.85} />
      </div>
      <div style={{position: 'absolute', left: NET.busX - 6, top: NET.sock.cy - 6, width: 12, height: 12, borderRadius: 6, background: '#000', border: `2px solid ${PURPLE_LIGHT}`, opacity: fo}} />

      {/* ---- 五条支线 + 错相光点 ---- */}
      {[0, 1, 2, 3, 4].map((i) => {
        const p = i === 0 ? 1 : clamp01((N - TAP_AT[i]) / 12);
        const tap = busPath(i).slice(1);
        // 光点：支线画完后开始跑，各条错开 11 帧相位
        const dn = N - (TAP_AT[i] + 14) - i * 11;
        const dp = dn < 0 ? null : polyAt(busPath(i), ((dn % 56) / 56));
        const dim = 0.45 + 0.55 * (i === 0 ? 0.55 : current(i));
        return (
          <React.Fragment key={i}>
            <div style={{opacity: fo}}>
              <Link pts={tap} p={p} color={PURPLE_LIGHT} w={2.6} opacity={0.85 * dim} />
            </div>
            {p > 0.98 && <div style={{position: 'absolute', left: NET.rowX - 5, top: rowMid(i) - 5, width: 10, height: 10, borderRadius: 5, background: PURPLE_LIGHT, opacity: 0.9 * (i === 0 ? 0.55 : current(i)) * fo}} />}
            {dp && <RunDot x={dp[0]} y={dp[1]} opacity={0.9 * (i === 0 ? 0.6 : current(i)) * fo} size={8} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};
