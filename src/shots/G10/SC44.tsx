import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {Pill, Svg} from '../../ui';
import {GREY_LIGHT, GREY_LINE, GREY_MID, PURPLE, PURPLE_DEEP, PURPLE_LIGHT, RED_DEEP, WHITE, exitOp, glowOffK, glowPurple, mixHex, scaleIn, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, emphasisPulse, kf} from '../../common';
import {PlugIcon} from '../G9/parts';
import {ToolIcon} from './parts';

/**
 * SC44 MCP 解决的不是「工具是什么」，而是「工具如何接进来」｜10685–10985｜第 5 章收尾
 * 上半三行大字把问题掰开：第一行（是什么）被红斜线划掉并变灰；第二行（怎么接进来）白字紫描边立起来；
 * 第三行（被发现和调用）被一道紫色扫描线扫过。
 * 下半：左边三件器具 = Tool，右边标准插头 = MCP；一条线把两边连上，MCP 侧起循环脉冲。
 * 节拍：10693 不是「工具是什么」/ 10768 而是「工具如何接进来」/ 10818 又如何被发现和调用 /
 *       10876 所以（上半整体上收、压暗）/ 10893 手里的刀锅铲 / 10923 是 Tool。
 * 主角：第二行 96px 大字（紫描边 + 紫柔光）；下半排 855px 宽。紫只给当前重点。
 */
const F0 = 10685;
const TO = 10985;

const A = {left: 412, top: 148};
const B = {left: 248, top: 248};
const C = {left: 370, top: 364};

const TOOLS = [
  {kind: 'knife' as const, cx: 240, cy: 492, size: 118},
  {kind: 'pot' as const, cx: 355, cy: 492, size: 122},
  {kind: 'spatula' as const, cx: 470, cy: 492, size: 118},
];
const PLUG = {cx: 955, cy: 492, size: 190};
const LINK = {x0: 537, x1: 891, y: 530};

export const SC44: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // ---- 上半：三行 ----
  const aN = N - 10687;
  const aOp = softOp(aN, 8);
  const aGrey = clamp01((N - 10696) / 14); // 「工具是什么」由亮灰转中灰
  const aDim = 1 - 0.28 * clamp01((N - 10760) / 10);
  const strikeP = clamp01((N - 10698) / 12);
  const strikeOp = 1 - 0.5 * clamp01((N - 10820) / 12);

  const bN = N - 10764;
  const bS = bN < 0 ? 0 : kf(bN, [
    [0, 0.94],
    [14, 1.035],
    [26, 1],
  ], (u) => u * u * (3 - 2 * u));
  const bOp = softOp(bN, 10);
  const bPulse = emphasisPulse(N - 10786, {peak: 1.045, up: 11, hold: 6, down: 14});
  const bGlowK = clamp01((N - 10764) / 12) * (1 - 0.55 * clamp01((N - 10888) / 20));

  const cN = N - 10814;
  const cOp = softOp(cN, 9);
  const scanP = clamp01((N - 10840) / 36); // 左侧紫线扫过整行
  const scanX = C.left + 540 * scanP;

  // 10876「所以」：上半整体上收并压暗，把注意力交给下半
  const upK = clamp01((N - 10876) / 16);
  const topY = -14 * upK;
  const topDim = 1 - 0.42 * upK;

  // ---- 下半：器具 / 插头 ----
  const plugN = N - 10896;
  const plugS = scaleIn(plugN, 21);
  const plugOp = plugN < 0 ? 0 : clamp01(0.1 + 1.7 * plugS);
  const breath = N >= 10942 ? 0.5 + 0.5 * Math.cos((((N - 10942) % 36) / 36) * Math.PI * 2) : 0;
  const mcpGlow = clamp01((N - 10900) / 12) * (0.55 + 0.45 * breath) * off;

  const linkP = clamp01((N - 10926) / 16);
  const loopN = N - 10942;
  const loopP = loopN < 0 ? 0 : (loopN % 44) / 44;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* ================= 上半 ================= */}
      <div style={{position: 'absolute', inset: 0, opacity: topDim, transform: `translateY(${topY.toFixed(2)}px)`}}>
        {/* 第一行：不是 工具是什么（被划掉） */}
        {aN >= 0 && (
          <div style={{position: 'absolute', left: A.left, top: A.top, display: 'flex', alignItems: 'flex-end', gap: 18, opacity: aOp * aDim}}>
            <span style={{fontFamily: FONT_HEAVY, fontWeight: 500, fontSize: 40, lineHeight: '40px', color: GREY_MID, letterSpacing: 2, whiteSpace: 'nowrap'}}>不是</span>
            <span style={{fontFamily: FONT_HEAVY, fontWeight: 800, fontSize: 72, lineHeight: '72px', color: mixHex(GREY_LIGHT, GREY_MID, aGrey), whiteSpace: 'nowrap'}}>工具是什么</span>
          </div>
        )}
        {/* 红斜线：一刀划过 */}
        {strikeP > 0 && (
          <Svg bloom={false} opacity={strikeOp}>
            <line x1="487" y1="156" x2="876" y2="217" stroke={RED_DEEP} strokeWidth={7} strokeLinecap="round" strokeDasharray="402" strokeDashoffset={402 * (1 - strikeP)} />
            <line x1="493" y1="162" x2="870" y2="212" stroke="#FF3B4E" strokeWidth={2} strokeLinecap="round" strokeDasharray="390" strokeDashoffset={390 * (1 - strikeP)} opacity={0.55} />
          </Svg>
        )}

        {/* 第二行：而是 工具如何接进来（主角） */}
        {bN >= 0 && (
          <div style={{position: 'absolute', left: B.left, top: B.top, opacity: bOp, transform: `scale(${(bS * bPulse).toFixed(4)})`, transformOrigin: '112px 96px'}}>
            {/* 紫柔光：只贴在「接进来」这一侧（径向渐变，没有硬边） */}
            <div style={{position: 'absolute', left: 40, top: -56, width: 800, height: 220, background: 'radial-gradient(ellipse at center, rgba(102,48,248,0.30) 0%, rgba(102,48,248,0) 68%)', opacity: bGlowK}} />
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 20}}>
              <span style={{fontFamily: FONT_HEAVY, fontWeight: 600, fontSize: 46, lineHeight: '46px', color: PURPLE_LIGHT, letterSpacing: 2, whiteSpace: 'nowrap'}}>而是</span>
              <span
                style={{
                  fontFamily: FONT_HEAVY,
                  fontWeight: 900,
                  fontSize: 96,
                  lineHeight: '96px',
                  color: WHITE,
                  letterSpacing: 1,
                  whiteSpace: 'nowrap',
                  // 不用 -webkit-text-stroke（在 96px 下会出现斜向描边毛刺）：用四向阴影做出紫描边
                  textShadow: `2px 0 0 ${PURPLE}, -2px 0 0 ${PURPLE}, 0 2px 0 ${PURPLE}, 0 -2px 0 ${PURPLE}, 6px 6px 0 ${PURPLE_DEEP}, 0 0 22px rgba(102,48,248,${(0.42 * bGlowK).toFixed(3)})`,
                }}
              >
                工具如何接进来
              </span>
            </div>
            {/* 下划线：10770 起 24 帧画出 */}
            <div style={{position: 'absolute', left: 112, top: 104, width: 672 * clamp01((N - 10770) / 24), height: 3, background: PURPLE, opacity: 0.75, borderRadius: 2}} />
          </div>
        )}

        {/* 第三行：又如何被发现和调用（紫色扫描） */}
        {cN >= 0 && (
          <div style={{position: 'absolute', left: C.left, top: C.top, opacity: cOp}}>
            <span style={{fontFamily: FONT_HEAVY, fontWeight: 700, fontSize: 60, lineHeight: '60px', color: GREY_LIGHT, letterSpacing: 2, whiteSpace: 'nowrap'}}>又如何被发现和调用</span>
            {/* 扫描线：扫到哪儿哪儿亮一点 */}
            {scanP > 0 && scanP < 1.001 && (
              <>
                <div style={{position: 'absolute', left: scanX - C.left - 55, top: -6, width: 110, height: 72, background: 'linear-gradient(90deg, rgba(102,48,248,0) 0%, rgba(161,117,241,0.22) 50%, rgba(102,48,248,0) 100%)'}} />
                <div style={{position: 'absolute', left: scanX - C.left - 1.3, top: -8, width: 2.6, height: 76, background: PURPLE_LIGHT, opacity: 0.85, boxShadow: '0 0 14px 3px rgba(161,117,241,0.55)'}} />
              </>
            )}
            {/* 扫描留下的底线 */}
            <div style={{position: 'absolute', left: 0, top: 78, width: 540 * scanP, height: 2.4, background: PURPLE, opacity: 0.6 * scanP, borderRadius: 2}} />
          </div>
        )}
      </div>

      {/* ================= 下半 ================= */}
      {/* Tool 侧：三件器具（2 帧错峰） */}
      {TOOLS.map((t, i) => {
        const n = N - (10889 + i * 2);
        if (n < 0) return null;
        const s = scaleIn(n, 21);
        return (
          <div key={t.kind} style={{position: 'absolute', inset: 0, opacity: clamp01(0.1 + 1.7 * s), transform: `scale(${s.toFixed(3)})`, transformOrigin: `${t.cx}px ${t.cy}px`}}>
            <ToolIcon kind={t.kind} cx={t.cx} cy={t.cy} size={t.size} color={WHITE} accent={PURPLE_LIGHT} />
          </div>
        );
      })}

      {/* MCP 侧：标准插头 + 紫柔光 */}
      <GlowBlob cx={PLUG.cx} cy={PLUG.cy} r={168} N={N} k={clamp01(plugN / 12)} alpha={0.16} />
      <GlowBlob cx={PLUG.cx} cy={PLUG.cy} r={112} N={N} k={clamp01(plugN / 12)} alpha={0.2} />
      {plugN >= 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: plugOp, transform: `scale(${plugS.toFixed(3)})`, transformOrigin: `${PLUG.cx}px ${PLUG.cy}px`}}>
          <PlugIcon cx={PLUG.cx} cy={PLUG.cy} size={PLUG.size} color={WHITE} accent={PURPLE_LIGHT} />
        </div>
      )}

      {/* 两侧之间的连线：10926 起画出，带一枚来回跑的光点 */}
      {linkP > 0 && (
        <>
          <div style={{position: 'absolute', left: LINK.x0, top: LINK.y - 1.2, width: (LINK.x1 - LINK.x0) * linkP, height: 2.4, background: mixHex(GREY_LINE, PURPLE_LIGHT, linkP), opacity: 0.9}} />
          <div style={{position: 'absolute', left: LINK.x0 + (LINK.x1 - LINK.x0) * linkP - 4, top: LINK.y - 4, width: 8, height: 8, borderRadius: 4, background: PURPLE_LIGHT, opacity: 0.9 * linkP}} />
          {loopN >= 0 && (
            <div style={{position: 'absolute', left: LINK.x0 + ((LINK.x1 - LINK.x0) / 2) * (1 - Math.cos(loopP * Math.PI * 2)) - 4.5, top: LINK.y - 4.5, width: 9, height: 9, borderRadius: 5, background: WHITE, boxShadow: glowPurple(0.9), opacity: 0.95}} />
          )}
        </>
      )}

      {/* 标签：Tool / MCP */}
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - 10919, 9)}}>
        <Pill x={280} y={570} w={150} h={44} r={22} fill="rgba(0,0,0,0.7)" stroke={PURPLE_LIGHT} sw={1.8} text="Tool" fontSize={28} color={WHITE} letterSpacing={1} />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: softOp(N - 10896, 9)}}>
        {/* MCP 标签随插头一起出现，10923 这一拍提亮 */}
        <div style={{position: 'absolute', left: 880, top: 566, width: 150, height: 52, borderRadius: 26, boxShadow: glowPurple(0.35 + 0.5 * clamp01((N - 10923) / 10) * mcpGlow), opacity: 0.9}} />
        <Pill x={880} y={570} w={150} h={44} r={22} fill="rgba(0,0,0,0.7)" stroke={clamp01((N - 10923) / 12) > 0.4 ? PURPLE : PURPLE_DEEP} sw={1.8} text="MCP" fontSize={28} color={clamp01((N - 10923) / 12) > 0.4 ? WHITE : GREY_LIGHT} letterSpacing={1} />
      </div>
    </div>
  );
};
