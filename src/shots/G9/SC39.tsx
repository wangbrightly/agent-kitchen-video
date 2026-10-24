import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GlowBlob, type CamKey} from '../../fx';
import {SocketIcon} from '../../icons';
import {CText, GREY, GREY_LIGHT, PURPLE, PURPLE_DEEP, PURPLE_LIGHT, WHITE, exitOp, firstOp, glowOffK, scaleIn, softOp} from '../../ui';
import {FONT_HEAVY, FONT_WIDE, GlitchIn, clamp01, easeInOutPow, emphasisPulse} from '../../common';
import {KITCHEN, KitchenLineArt} from '../G1/parts';
import {FeedRail} from './parts';

/**
 * SC39 回到厨房地图｜9608–9826｜「有一排标准插座，叫 MCP。」
 * 第 5 章开场，紧跟章节卡：从整张厨房地图推近到墙带左段的插座板。
 * 节拍：9616 插座出现（scaleIn 21 帧）/ 9695 送料轨自左向右长出（24 帧）/
 *       9758 MCP（本章唯一 GlitchIn，紫色硬投影）/ 之后光点持续在轨道上从左往右跑。
 * 主角：MCP（Audiowide 110）+ 插座板（世界 280 → 屏幕约 250）。
 * 厨房线与 KITCHEN 坐标全部复用 G1 的 parts，保证同一张地图。
 */
const F0 = 9608;
const TO = 9826;

// 插座板：分镜给的墙带左段范围 x300–420 / y250–340 的中心
const SOCK = {cx: 360, cy: 295, size: 280};
// 送料轨：横贯墙带下沿
const RAIL = {x0: 250, x1: 1180, y: 500};

// 推近：停在 1.34，插座落在屏幕约 (513, 297)，MCP 落在右侧空处
const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 9612, x: 640, y: 360, s: 1},
  {f: 9642, x: 455, y: 342, s: 1.34},
  {f: TO, x: 455, y: 342, s: 1.34},
];

// 三个插孔的世界坐标（SocketIcon viewBox 里 26/44/62 @ y44）
const HOLES = [26, 44, 62].map((vx) => ({x: SOCK.cx + ((vx - 50) / 100) * SOCK.size, y: SOCK.cy + ((44 - 50) / 100) * SOCK.size}));

export const SC39: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 地图线稿：先淡淡透出来，不再整段消失
  const lineK = 0.5 * (0.6 + 0.4 * firstOp(N - F0, 16));

  // 插座：9612 scaleIn 21 帧
  const sockN = N - 9612;
  const sockS = scaleIn(sockN, 21);
  const sockOp = sockN < 0 ? 0 : clamp01(0.12 + 1.7 * sockS);
  const sockGlow = clamp01(sockN / 16) * off;

  // 送料轨：9692 起 24 帧画完
  const railP = easeInOutPow(2.1)(clamp01((N - 9692) / 24));
  // 画完后两枚光点持续从左往右跑（错开半个周期），跑到可见区右端就淡出、从头再来
  const dotN = N - 9716;
  const dotAt = (phase: number) => {
    if (dotN < 0) return null;
    const t = ((dotN + phase) % 44) / 44;
    return {x: 250 + 630 * t, k: t > 0.88 ? Math.max(0, 1 - (t - 0.88) / 0.12) : 1};
  };
  const dots = [dotAt(0), dotAt(22)];

  // 三个插孔依次点亮：9652 / 9666 / 9680，各 10 帧
  const holeK = (i: number) => clamp01((N - (9652 + i * 14)) / 10);

  const mcpPulse = emphasisPulse(N - 9757, {peak: 1.07, up: 12, hold: 4, down: 14});

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        {/* 厨房线稿（墙带 / 冰箱 / 台面 / 筐） */}
        <KitchenLineArt N={N} opacity={lineK} />

        {/* 墙带左段的强调：一圈极淡的方角，帮观众把目光收到插座区 */}
        <div style={{position: 'absolute', left: 296, top: 244, width: 152, height: 104, border: `1px solid ${PURPLE}`, borderRadius: 6, opacity: 0.18 * softOp(N - 9618, 14)}} />

        {/* 插座板背后的紫柔光 */}
        <GlowBlob cx={SOCK.cx} cy={SOCK.cy} r={180} N={N} k={sockGlow} alpha={0.2} />
        <GlowBlob cx={SOCK.cx} cy={SOCK.cy} r={118} N={N} k={sockGlow} alpha={0.22} />

        {/* 插座：scaleIn 落位；底板白、插孔紫 */}
        {sockN >= 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: sockOp, transform: `scale(${sockS.toFixed(3)})`, transformOrigin: `${SOCK.cx}px ${SOCK.cy}px`}}>
            <SocketIcon cx={SOCK.cx} cy={SOCK.cy} size={SOCK.size} color={WHITE} accent={PURPLE_LIGHT} />
          </div>
        )}

        {/* 三个插孔依次亮一圈（「一排」） */}
        {HOLES.map((h, i) => {
          const k = holeK(i);
          if (k <= 0) return null;
          const r = 9 + 10 * k;
          return (
            <svg key={i} width={1280} height={720} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
              <circle cx={h.x} cy={h.y} r={r} fill="none" stroke={PURPLE_LIGHT} strokeWidth={2.2} opacity={0.9 * (1 - k * 0.75)} />
            </svg>
          );
        })}

        {/* 送料轨 + 轨道上跑的光点 */}
        <FeedRail x0={RAIL.x0} x1={RAIL.x1} y={RAIL.y} p={railP} opacity={0.9} />
        {railP > 0.98 &&
          dots.map((d, i) =>
            d && d.k > 0.01 ? (
              <React.Fragment key={i}>
                <div style={{position: 'absolute', left: d.x - 5, top: RAIL.y - 5, width: 10, height: 10, borderRadius: 5, background: WHITE, boxShadow: '0 0 14px 5px rgba(102,45,248,.7)', opacity: d.k}} />
                <div style={{position: 'absolute', left: d.x - 34, top: RAIL.y - 1.2, width: 30, height: 2.4, borderRadius: 2, background: PURPLE_LIGHT, opacity: 0.45 * d.k}} />
              </React.Fragment>
            ) : null,
          )}
      </CameraRig>

      {/* MCP：本章唯一 GlitchIn，停在插座右侧的墙面上 */}
      <GlitchIn N={N} f0={9755} rgbSplit={3} slices={3} seed={9}>
        <CText
          cx={940}
          cy={300}
          size={110}
          family={FONT_WIDE}
          weight={400}
          color={WHITE}
          letterSpacing={4}
          shadow={`6px 6px 0 ${PURPLE_DEEP}, 0 0 30px rgba(102,45,248,.5)`}
          style={{transform: `translate(-50%,-50%) scale(${mcpPulse.toFixed(4)})`, transformOrigin: '50% 50%'}}
        >
          MCP
        </CText>
      </GlitchIn>

      {/* MCP 下方的灰注（静态、不出框） */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - 9772, 10)}}>
        <div style={{position: 'absolute', left: 940 - 44, top: 352, width: 88, height: 2, background: PURPLE, opacity: 0.55}} />
        <div style={{position: 'absolute', left: 940 - 62, top: 366, fontFamily: FONT_HEAVY, fontSize: 24, fontWeight: 500, color: GREY_LIGHT, letterSpacing: 6, whiteSpace: 'nowrap'}}>标准插座</div>
      </div>
    </div>
  );
};
