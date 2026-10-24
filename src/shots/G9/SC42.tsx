import React from 'react';
import {useCurrentFrame} from 'remotion';
import {HeroGlow} from '../../fx';
import {SocketIcon} from '../../icons';
import {Box, GLOW_PURPLE, GREY, GREY_LIGHT, GREY_LINE, PURPLE, PURPLE_LIGHT, WHITE, exitOp, firstOp, glowOffK, scaleIn, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, easeInOutPow} from '../../common';
import {FocusBracket, Link, NET, RingPulse, RunDot, ServiceRow, busPath, polyAt, rowMid, rowTop} from './parts';

/**
 * SC42 智能体接入外部工具｜10285–10503｜「这样，智能体就能接入外部的工具和数据。」
 * 插座缩到左侧，右侧立起一块 5 行的接入面板；连线从插座接到面板，再落到第一行（文件系统）。
 * 节拍：10293 插座 + 面板 / 10311 五行 3 帧错峰滑入 + 干线 draw-on /
 *       10408「比如」四角取景框 / 10437 第一行点亮 + 支线接通 + 数据点跑到文件系统。
 * 主角：510×456 接入面板（紫柔光）；紫只给当前行（文件系统）。
 */
const F0 = 10285;
const TO = 10503;

const TRUNK = (): Array<[number, number]> => [
  [NET.sock.cx + 76, NET.sock.cy],
  [NET.busX, NET.sock.cy],
];

export const SC42: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  const panelN = N - 10288;
  const panelOp = softOp(panelN, 12);
  const panelS = 0.972 + 0.028 * softOp(panelN, 16);
  const panelGlow = clamp01(panelN / 16) * (0.55 + 0.15 * clamp01((N - 10439) / 12)) * off;
  // 插座：从上一镜的 240 缩到 200（先大后落位）
  const sockN = N - 10290;
  const sockS = (1.24 - 0.24 * softOp(sockN, 20)) * scaleIn(sockN, 16);
  const sockOp = sockN < 0 ? 0 : clamp01(0.1 + 1.9 * softOp(sockN, 12));

  // 干线 10311 起 14 帧
  const trunkP = clamp01((N - 10311) / 14);
  // 干线上的第一次数据包：10346 → 10370，到位后面板整块亮一下（收到数据的反馈）
  const pulseP = clamp01((N - 10346) / 24);
  const pulsePt = polyAt(TRUNK(), pulseP);
  const arriveN = N - 10370;
  const bloom = arriveN < 0 ? 0 : arriveN < 6 ? arriveN / 6 : Math.max(0, 1 - (arriveN - 6) / 12);

  // 取景框（比如）：10408
  const bracketP = clamp01((N - 10408) / 14);
  const bracketOp = 1 - clamp01((N - 10439) / 8);

  // 第一行点亮 + 支线
  const k0 = clamp01((N - 10439) / 11);
  const tapP = clamp01((N - 10438) / 12);
  const tap = busPath(0).slice(1);

  // 数据点：支线接通后跑到文件系统，之后循环
  const dotN = N - 10452;
  const dotPt = dotN < 0 ? null : polyAt(busPath(0), (dotN % 58) / 58);
  const arrival = clamp01((N - 10466) / 12);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* ---- 右：接入面板 ---- */}
      {panelN >= 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: panelOp, transform: `scale(${panelS.toFixed(4)})`, transformOrigin: `${NET.panel.x}px ${NET.panel.y + NET.panel.h / 2}px`}}>
          <HeroGlow x={NET.panel.x} y={NET.panel.y} w={NET.panel.w} h={NET.panel.h} r={18} N={N} k={panelGlow} />
          <Box x={NET.panel.x} y={NET.panel.y} w={NET.panel.w} h={NET.panel.h} r={16} fill="rgba(0,0,0,0.46)" stroke={GREY_LINE} sw={1.6} />
          {/* 面板抬头 */}
          <div style={{position: 'absolute', left: NET.panel.x + 18, top: NET.panel.y + 12, fontFamily: FONT_HEAVY, fontWeight: 600, fontSize: 22, letterSpacing: 3, color: GREY_LIGHT, whiteSpace: 'nowrap'}}>MCP server</div>
          <div style={{position: 'absolute', left: NET.panel.x + 18, top: NET.panel.y + 40, width: (NET.panel.w - 36) * firstOp(panelN, 14), height: 1.2, background: GREY_LINE, opacity: 0.35}} />
        </div>
      )}

      {/* 五行（3 帧错峰自右滑入） */}
      {[0, 1, 2, 3, 4].map((i) => {
        const n = N - (10306 + i * 3);
        if (n < 0) return null;
        const e = easeInOutPow(2.4)(clamp01(n / 9));
        return <ServiceRow key={i} i={i} k={i === 0 ? k0 : 0} dim={i === 0 ? 1 : 0.9} op={softOp(n, 7)} dx={46 * (1 - e)} glowK={i === 0 ? k0 * 0.55 * off : 0} />;
      })}

      {/* ---- 左：插座 ---- */}
      {sockN >= 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: sockOp, transform: `scale(${sockS.toFixed(3)})`, transformOrigin: `${NET.sock.cx}px ${NET.sock.cy}px`}}>
          <SocketIcon cx={NET.sock.cx} cy={NET.sock.cy} size={NET.sock.size} color={WHITE} accent={PURPLE_LIGHT} />
        </div>
      )}

      {/* 干线：插座 → 面板左缘 */}
      <Link pts={TRUNK()} p={trunkP} color={PURPLE_LIGHT} w={2.6} opacity={0.85} />
      {/* 干线上的第一次脉冲（数据包：白点 + 大柔光） */}
      {pulseP > 0 && pulseP < 1 && (
        <>
          <div style={{position: 'absolute', left: pulsePt[0] - 62, top: pulsePt[1] - 62, width: 124, height: 124, borderRadius: '50%', background: 'radial-gradient(circle, rgba(161,117,241,0.55) 0%, rgba(102,45,248,0.18) 40%, rgba(0,0,0,0) 70%)'}} />
          <RunDot x={pulsePt[0]} y={pulsePt[1]} size={12} />
        </>
      )}
      {/* 收到数据：整块面板亮一下（大面积反馈，随后回落） */}
      {bloom > 0 && <div style={{position: 'absolute', left: NET.panel.x, top: NET.panel.y, width: NET.panel.w, height: NET.panel.h, borderRadius: 16, background: PURPLE_LIGHT, opacity: 0.13 * bloom}} />}
      {/* 面板左缘的接口点（干线落位后亮） */}
      <div style={{position: 'absolute', left: NET.busX - 6, top: NET.sock.cy - 6, width: 12, height: 12, borderRadius: 6, background: '#000', border: `2px solid ${PURPLE_LIGHT}`, opacity: clamp01((N - 10324) / 8)}} />
      {/* 干线落位 / 数据到位时的两圈脉冲 */}
      <RingPulse cx={NET.busX} cy={NET.sock.cy} p={clamp01((N - 10324) / 14)} r0={10} r1={34} />
      <RingPulse cx={NET.busX} cy={NET.sock.cy} p={clamp01((N - 10370) / 16)} r0={14} r1={58} color={WHITE} opacity={0.55} sw={2} />

      {/* 取景框：先把注意力框到第一行 */}
      {bracketOp > 0.01 && <FocusBracket x={NET.rowX - 6} y={rowTop(0) - 6} w={NET.rowW + 12} h={NET.rowH + 12} p={bracketP} color={PURPLE_LIGHT} arms={22} sw={2.4} opacity={bracketOp} />}

      {/* 支线：面板左缘 → 第一行 */}
      <Link pts={tap} p={tapP} color={PURPLE_LIGHT} w={2.6} opacity={0.9} />
      {k0 > 0.05 && <div style={{position: 'absolute', left: NET.rowX - 6, top: rowMid(0) - 6, width: 12, height: 12, borderRadius: 6, background: PURPLE_LIGHT, opacity: k0 * 0.95}} />}

      {/* 数据点 */}
      {dotPt && <RunDot x={dotPt[0]} y={dotPt[1]} />}
      <RingPulse cx={NET.rowX} cy={rowMid(0)} p={clamp01((N - 10466) / 12)} r0={12} r1={40} color={PURPLE_LIGHT} opacity={0.75} sw={2} />
    </div>
  );
};
