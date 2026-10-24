import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GlowBlob, type CamKey} from '../../fx';
import {SocketIcon} from '../../icons';
import {Pill} from '../../ui';
import {GREY_LINE, GREY_MID, PURPLE_LIGHT, WHITE, exitOp, glowOffK, glowPurple, mixHex, scaleIn, softOp} from '../../ui';
import {FONT_HEAVY, FONT_TECH, clamp01} from '../../common';
import {PlugIcon} from '../G9/parts';
import {ToolIcon, type ToolKind} from './parts';

/**
 * SC45 墙上的标准插座是 MCP，手里的工具是具体能力｜10986–11212
 * 左：五件器具堆成「具体能力」；右：插座 + 插头 = 「MCP」；一条紫线把两边连起来，光点来回跑。
 * 节拍：10994 墙上的标准插座（插座入场）/ 11028 是 MCP（插头插入 + MCP 标）/
 *       11075 工具是具体能力（五件器具 2 帧错峰）/ 11121 MCP 是连接这些能力的协议（协议标 + 连线）。
 * 主角：插座（260，墨迹约 177px）；紫光只给右侧插座与连线。
 * 运镜：11034–11074 整组右移 40（camera x 640→680）。
 */
const F0 = 10986;
const TO = 11212;

const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 11034, x: 640, y: 360, s: 1},
  {f: 11074, x: 680, y: 360, s: 1},
  {f: TO, x: 680, y: 360, s: 1},
];

const SOCK = {cx: 960, cy: 355, size: 260};
const PLUG = {cx: 1073, cy: 355, size: 150};
const TOOLS: Array<{kind: ToolKind; cx: number; cy: number; size: number}> = [
  {kind: 'pot', cx: 318, cy: 276, size: 138},
  {kind: 'spoon', cx: 240, cy: 374, size: 132},
  {kind: 'knife', cx: 406, cy: 370, size: 138},
  {kind: 'spatula', cx: 264, cy: 464, size: 132},
  {kind: 'tongs', cx: 382, cy: 464, size: 132},
];
const LINE = {x0: 500, x1: 861, y: 400};

export const SC45: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // ---- 右：插座 ----
  const sockN = N - 10994;
  const sockS = scaleIn(sockN, 21);
  const sockOp = sockN < 0 ? 0 : clamp01(0.1 + 1.7 * sockS);
  const sockGlow = clamp01((N - 10994) / 14) * off;

  // ---- 右：插头 ----
  const plugN = N - 11028;
  const plugIn = clamp01(plugN / 12);
  const plugX = PLUG.cx + 10 * (1 - plugIn);
  const plugOp = softOp(plugN, 8);

  // ---- 左：五件器具 ----
  const toolGlow = clamp01((N - 11075) / 10) * (1 - 0.8 * clamp01((N - 11121) / 14));

  // ---- 连线 ----
  const lineP = clamp01((N - 11123) / 22);
  const dotN = N - 11145;
  const dotP = dotN < 0 ? 0 : (dotN % 46) / 46;
  const dotX = LINE.x0 + (LINE.x1 - LINE.x0) * (0.5 - 0.5 * Math.cos(dotP * Math.PI * 2));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        {/* ---------- 左：具体能力 ---------- */}
        {TOOLS.map((t, i) => {
          const n = N - (11075 + i * 2);
          if (n < 0) return null;
          const s = scaleIn(n, 21);
          return (
            <div key={t.kind} style={{position: 'absolute', inset: 0, opacity: clamp01(0.12 + 1.7 * s), transform: `scale(${s.toFixed(3)})`, transformOrigin: `${t.cx}px ${t.cy}px`}}>
              <ToolIcon kind={t.kind} cx={t.cx} cy={t.cy} size={t.size} color={WHITE} accent={GREY_MID} />
            </div>
          );
        })}
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - 11075, 10)}}>
          <Pill x={205} y={568} w={250} h={44} r={22} fill="rgba(0,0,0,0.72)" stroke={mixHex(GREY_LINE, PURPLE_LIGHT, 0.35 + 0.65 * toolGlow)} sw={1.8} text="具体能力" fontSize={26} color={WHITE} letterSpacing={2} />
        </div>

        {/* ---------- 右：插座 = MCP ---------- */}
        <GlowBlob cx={SOCK.cx} cy={SOCK.cy} r={205} N={N} k={sockGlow} alpha={0.16} />
        <GlowBlob cx={SOCK.cx} cy={SOCK.cy} r={140} N={N} k={sockGlow} alpha={0.2} />

        {sockN >= 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: sockOp, transform: `scale(${sockS.toFixed(3)})`, transformOrigin: `${SOCK.cx}px ${SOCK.cy}px`}}>
            <SocketIcon cx={SOCK.cx} cy={SOCK.cy} size={SOCK.size} color={WHITE} accent={PURPLE_LIGHT} />
          </div>
        )}

        {plugOp > 0.01 && (
          <div style={{position: 'absolute', inset: 0, opacity: plugOp}}>
            <PlugIcon cx={plugX} cy={PLUG.cy} size={PLUG.size} color={WHITE} accent={PURPLE_LIGHT} />
            {/* 插入瞬间的一圈小脉冲 */}
            {plugIn >= 1 && clamp01((N - 11040) / 14) < 1 && (
              <div style={{position: 'absolute', left: SOCK.cx + 0.38 * SOCK.size - 30, top: SOCK.cy - 30, width: 60, height: 60, borderRadius: 30, border: `2px solid ${PURPLE_LIGHT}`, opacity: 0.8 * (1 - clamp01((N - 11040) / 14)), transform: `scale(${(0.7 + 1.1 * clamp01((N - 11040) / 14)).toFixed(3)})`}} />
            )}
          </div>
        )}

        {/* MCP 标 */}
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - 11028, 10)}}>
          <div style={{position: 'absolute', left: SOCK.cx - 120, top: 198, width: 240, textAlign: 'center', fontFamily: FONT_TECH, fontWeight: 700, fontSize: 48, lineHeight: '52px', letterSpacing: 8, color: WHITE, textShadow: glowPurple(0.8)}}>MCP</div>
        </div>

        {/* ---------- 连线：MCP ↔ 具体能力 ---------- */}
        {lineP > 0 && (
          <div style={{position: 'absolute', left: LINE.x0, top: LINE.y - 1.3, width: (LINE.x1 - LINE.x0) * lineP, height: 2.6, background: mixHex(GREY_LINE, PURPLE_LIGHT, lineP), opacity: 0.9}} />
        )}
        {lineP >= 1 && (
          <>
            <div style={{position: 'absolute', left: dotX - 5, top: LINE.y - 5, width: 10, height: 10, borderRadius: 5, background: WHITE, boxShadow: glowPurple(0.95)}} />
            <div style={{position: 'absolute', left: LINE.x1 - 4, top: LINE.y - 4, width: 8, height: 8, borderRadius: 4, background: PURPLE_LIGHT, opacity: 0.9}} />
          </>
        )}

        {/* 协议标（贴着连线） */}
        <div style={{position: 'absolute', inset: 0, opacity: softOp(N - 11124, 10)}}>
          <div style={{position: 'absolute', left: 640, top: 344, width: 120, textAlign: 'center', fontFamily: FONT_HEAVY, fontWeight: 800, fontSize: 36, lineHeight: '40px', letterSpacing: 6, color: PURPLE_LIGHT, whiteSpace: 'nowrap'}}>协议</div>
          <div style={{position: 'absolute', left: 700, top: 388, width: 1.6, height: 14, background: PURPLE_LIGHT, opacity: 0.6}} />
        </div>

      </CameraRig>
    </div>
  );
};
