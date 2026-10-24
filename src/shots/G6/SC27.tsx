import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {Box, GREY_LINE, PURPLE, PURPLE_LIGHT, RED_DEEP, WHITE, exitOp, glowOffK, glowPurpleS, mixHex, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, easeInOutPow} from '../../common';
import {Brush, OpenPot, PourChef, SaltShaker, pourHand, typeSlice} from './parts';

/**
 * SC27 写错了怎么办｜6625–6967｜「如果便签写错了 / 厨师明天就可能继续照着错误信息做 /
 * 所以记忆需要被检查 / 更新和清理 / 到这里 / 一位厨师已经拥有」
 * 左：一张便签被红线划掉（红叉 12 帧）；右：厨师照着错便签把盐倒进锅里（18 帧动作，极简线稿）。
 * 6775 紫色扫描线自上而下检查一遍；6829 刷子从左扫过 22 帧把便签擦白；6852 重写成「先放糖」。
 * 主角：便签 290×190；错误时红色微光，修正后转紫。
 * 厨师手臂可动 —— ChefIcon 是单一路径无法分肢，故本组 parts 里另画 PourChef（骨架一致，左臂绕肩转）。
 * 无 GlitchIn；无 LightSweep / StageLine / GhostText。
 */
const F0 = 6625;
const TO = 6967;

const NOTE = {x: 205, y: 235, w: 290, h: 190};
const CHEF = {cx: 910, cy: 330, size: 160};
const POT = {cx: 795, cy: 424, size: 165};
const COUNTER_Y = 470;

const OLD = '先放盐';
const NEW = '先放糖';

const EASE = easeInOutPow(2.2);

export const SC27: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // ---- 厨师手臂：0 → 40°（6666–6680）→ 缓缓压到 52°（6755–6772）→ 6875 起收回 ----
  const raiseK =
    N < 6666
      ? 0
      : N < 6680
        ? 1 - Math.pow(1 - clamp01((N - 6666) / 14), 3)
        : N < 6755
          ? 1
          : N < 6772
            ? 1 + 0.3 * EASE(clamp01((N - 6755) / 17))
            : N < 6875
              ? 1.3
              : 1.3 * (1 - EASE(clamp01((N - 6875) / 20)));
  const angle = 40 * raiseK;
  const hand = pourHand(CHEF.cx, CHEF.cy, CHEF.size, angle);
  const shakerRot = -105 * clamp01((angle - 8) / 30);

  // ---- 盐粒：6685 起持续落下，6875 收手后停 ----
  const pouring = N >= 6685 && N < 6876;
  const capX = hand.x + 29 * Math.sin((shakerRot * Math.PI) / 180) * 0.86;
  const capY = hand.y - 29 * Math.cos((shakerRot * Math.PI) / 180) * 0.86;

  // ---- 便签 ----
  const xP = clamp01((N - 6633) / 12);
  const xP2 = clamp01((N - 6636) / 12);
  // 刷子：6829 起 20 帧扫到便签右沿（495），6846 起 10 帧淡出，别飞到便签外面
  const brushX = 195 + clamp01((N - 6829) / 20) * 300;
  const brushOp = 1 - clamp01((N - 6846) / 10);
  const eraseP = N < 6829 ? 0 : clamp01((brushX - (NOTE.x + 20)) / (NOTE.w - 40));
  const fixedK = clamp01((N - 6851) / 10);
  const redK = clamp01((N - 6633) / 8) * (1 - clamp01((N - 6829) / 14));
  const border = mixHex(WHITE, PURPLE_LIGHT, fixedK);
  const newChars = typeSlice(NEW, N - 6852, 5);

  // 扫描线（6775 需要被检查）：自上而下 24 帧
  const scanP = clamp01((N - 6775) / 24);
  const scanY = NOTE.y + 14 + (NOTE.h - 28) * EASE(scanP);

  // 修正勾：6875 起 12 帧
  const checkP = clamp01((N - 6875) / 12);

  const appear = softOp(N - 6627, 8);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 台面线：给锅与厨师一个共同基准 */}
      <div style={{position: 'absolute', left: 150, top: COUNTER_Y, width: 1010, height: 1.4, background: GREY_LINE, opacity: 0.4}} />

      {/* 右侧：厨师 + 锅（厨师在台后，锅在台前） */}
      <GlowBlob cx={CHEF.cx - 40} cy={CHEF.cy + 10} r={150} N={N} k={0.55 * clamp01((N - 6898) / 14) * off} alpha={0.2} />
      <PourChef cx={CHEF.cx} cy={CHEF.cy} size={CHEF.size} color={WHITE} accent={PURPLE} armAngle={angle} opacity={appear} />
      <SaltShaker cx={hand.x} cy={hand.y} size={86} rot={shakerRot} color={WHITE} accent={PURPLE_LIGHT} opacity={appear} />
      <OpenPot cx={POT.cx} cy={POT.cy} size={POT.size} color={WHITE} accent={PURPLE_LIGHT} opacity={appear} />

      {/* 落下的盐粒：14 颗 6×6，斜着从罐口进锅（持续动作，肉眼能看清是一股盐） */}
      {pouring
        ? Array.from({length: 14}).map((_, i) => {
            const y = 338 + (((N - 6685) * 4.4 + i * 5.4) % 74);
            const k = 1 - Math.abs(y - 375) / 64;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: capX - 7 + ((i * 37) % 13),
                  top: y,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  background: WHITE,
                  opacity: Math.max(0, Math.min(1, k)) * 0.95,
                }}
              />
            );
          })
        : null}

      {/* 便签 */}
      <div style={{position: 'absolute', inset: 0, opacity: appear}}>
        <Box
          x={NOTE.x}
          y={NOTE.y}
          w={NOTE.w}
          h={NOTE.h}
          r={6}
          fill="#000"
          stroke={border}
          sw={2.6}
          glow={redK > 0.02 ? `0 0 28px 6px rgba(236,8,31,${(0.24 * redK).toFixed(3)})` : fixedK > 0.02 ? glowPurpleS(0.6 * fixedK * off) : undefined}
        />
        {/* 折角 */}
        <svg width={26} height={26} viewBox="0 0 26 26" style={{position: 'absolute', left: NOTE.x + NOTE.w - 25, top: NOTE.y + NOTE.h - 25, overflow: 'visible'}}>
          <path d="M26 0V26H0" fill="none" stroke={border} strokeWidth={2} opacity={0.5} />
        </svg>

        {/* 旧内容（被刷子自左擦掉） */}
        <div style={{position: 'absolute', left: NOTE.x, top: NOTE.y, width: NOTE.w, height: NOTE.h, clipPath: `inset(0 0 0 ${(eraseP * 100).toFixed(2)}%)`}}>
          <div style={{position: 'absolute', left: 26, top: 46, fontFamily: FONT_HEAVY, fontSize: 46, fontWeight: 700, lineHeight: 1, color: WHITE, whiteSpace: 'nowrap'}}>{OLD}</div>
          <div style={{position: 'absolute', left: 26, top: 122, width: NOTE.w - 60, height: 3, background: GREY_LINE, opacity: 0.8}} />
          <div style={{position: 'absolute', left: 26, top: 150, width: (NOTE.w - 60) * 0.62, height: 3, background: GREY_LINE, opacity: 0.8}} />
          {/* 红叉 12 帧 */}
          <svg width={NOTE.w} height={NOTE.h} viewBox={`0 0 ${NOTE.w} ${NOTE.h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <path d={`M18 16 L${NOTE.w - 18} ${NOTE.h - 16}`} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - xP} fill="none" stroke={RED_DEEP} strokeWidth={11} strokeLinecap="round" opacity={0.92} />
            <path d={`M${NOTE.w - 18} 16 L18 ${NOTE.h - 16}`} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - xP2} fill="none" stroke={RED_DEEP} strokeWidth={11} strokeLinecap="round" opacity={0.92} />
          </svg>
        </div>

        {/* 新内容（修正后） */}
        {N >= 6852 ? (
          <div style={{position: 'absolute', left: NOTE.x + 26, top: NOTE.y + 66, fontFamily: FONT_HEAVY, fontSize: 46, fontWeight: 700, lineHeight: 1, color: PURPLE_LIGHT, whiteSpace: 'nowrap', textShadow: '0 0 18px rgba(161,117,241,.55)'}}>{newChars}</div>
        ) : null}

        {/* 检查扫描线 */}
        {N >= 6775 && N <= 6806 ? (
          <div
            style={{
              position: 'absolute',
              left: NOTE.x + 10,
              top: scanY,
              width: NOTE.w - 20,
              height: 2.6,
              background: PURPLE_LIGHT,
              opacity: 0.9 * (1 - clamp01((scanP - 0.85) / 0.15)),
              boxShadow: '0 0 12px rgba(161,117,241,.9)',
            }}
          />
        ) : null}

        {/* 刷子：6829 起从左扫过，扫到右沿时已经淡出 */}
        {N >= 6829 && N <= 6860 ? (
          <div style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 9px rgba(161,117,241,.85))'}}>
            <Brush cx={brushX} cy={NOTE.y + 96} size={96} rot={-14} opacity={brushOp} />
          </div>
        ) : null}

        {/* 修正勾 */}
        {checkP > 0 ? (
          <svg width={44} height={44} viewBox="0 0 44 44" style={{position: 'absolute', left: NOTE.x + NOTE.w + 14, top: NOTE.y + 116, overflow: 'visible', filter: 'drop-shadow(0 0 10px rgba(161,117,241,.7))'}}>
            <path d="M6 22 L17 33 L38 9" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - checkP} fill="none" stroke={PURPLE_LIGHT} strokeWidth={4.4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>
    </div>
  );
};
