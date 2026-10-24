import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {BrainIcon, CardBoxIcon, KnifeIcon, SheetIcon} from '../../icons';
import {CText, GREY_LIGHT, GREY_LINE, PURPLE, PURPLE_LIGHT, WHITE, exitOp, glowOffK, mixHex, scaleIn, softOp} from '../../ui';
import {FONT_HEAVY, FONT_ORB, clamp01, easeInOutPow} from '../../common';
import {StickyNoteIcon} from '../G1/parts';

/**
 * SC28 五样齐了｜6968–7195｜「大脑 / 岗位职责 / 工具 / 菜谱和记忆 / 但他什么时候开始工作 / 还需要有人或某种机制来触发」
 * 章末收束：五枚图标横排（脑 / 纸 / 刀 / 卡盒 / 便签），下方一条汇总横线；
 * 顶部中间浮出大「？」（Orbitron 110，本镜头最亮）。末拍停满再离场。
 * 节拍：6976 / 6985 / 7006 / 7015 各起一枚（第五枚 7016 与第四枚同块、错 1 帧）；
 *       横线 7018 起 draw-on；光点 7040 起从左跑到右，7145 到尽头停住；问号 7063 起 11 帧 scaleIn + 短紫闪。
 * 无运镜、无 GlitchIn；无 LightSweep / StageLine / GhostText。
 */
const F0 = 6968;
const TO = 7195;

const Y = 320;
const ICONS = [
  {x: 220, f0: 6976, label: '大脑'},
  {x: 420, f0: 6985, label: '岗位职责'},
  {x: 620, f0: 7006, label: '工具'},
  {x: 820, f0: 7015, label: '菜谱'},
  {x: 1020, f0: 7016, label: '记忆'},
];

const LINE = {y: 472, x0: 170, x1: 1110};
const EASE = easeInOutPow(1.9);

export const SC28: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  const lineP = clamp01((N - 7018) / 22);
  const dotP = clamp01((N - 7040) / 105);
  const dotX = LINE.x0 + (LINE.x1 - LINE.x0) * EASE(dotP);

  const qP = clamp01((N - 7063) / 11);
  const qS = 0.55 + 0.45 * scaleIn(N - 7063, 11);
  const qFlash = N < 7063 ? 0 : N < 7069 ? (N - 7063) / 6 : Math.max(0, 1 - (N - 7069) / 16);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 五枚图标：各带淡紫光，自下而上升起 */}
      {ICONS.map((ic, i) => {
        const t = N - ic.f0;
        if (t < 0) return null;
        const p = 1 - Math.pow(1 - clamp01(t / 16), 3);
        const op = softOp(t, 6);
        const lit = clamp01((N - ic.f0) / 10);
        const dy = 46 * (1 - p);
        return (
          <React.Fragment key={ic.label}>
            <GlowBlob cx={ic.x} cy={Y - 6} r={96} N={N} k={0.45 * op * off} alpha={0.14} />
            <div style={{position: 'absolute', inset: 0, opacity: op, transform: `translateY(${dy.toFixed(2)}px)`}}>
              {i === 0 && <BrainIcon cx={ic.x} cy={Y} size={140} color={WHITE} accent={PURPLE} />}
              {i === 1 && <SheetIcon cx={ic.x} cy={Y} size={140} color={WHITE} accent={PURPLE} />}
              {i === 2 && <KnifeIcon cx={ic.x} cy={Y} size={140} color={WHITE} accent={PURPLE} />}
              {i === 3 && <CardBoxIcon cx={ic.x} cy={Y} size={140} color={WHITE} accent={PURPLE} />}
              {i === 4 && <StickyNoteIcon cx={ic.x} cy={Y} size={140} color={WHITE} accent={PURPLE} />}
              {/* 标签 */}
              <div
                style={{
                  position: 'absolute',
                  left: ic.x - 80,
                  top: 400,
                  width: 160,
                  textAlign: 'center',
                  fontFamily: FONT_HEAVY,
                  fontSize: 24,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: 2,
                  color: mixHex(GREY_LIGHT, WHITE, lit),
                  whiteSpace: 'nowrap',
                }}
              >
                {ic.label}
              </div>
            </div>
            {/* 小竖线：把每枚图标接到汇总横线 */}
            <div style={{position: 'absolute', left: ic.x - 0.7, top: 434, width: 1.4, height: 38 * clamp01((N - 7018) / 14), background: GREY_LINE, opacity: 0.55}} />
          </React.Fragment>
        );
      })}

      {/* 汇总横线 */}
      <div style={{position: 'absolute', left: LINE.x0, top: LINE.y - 1, width: (LINE.x1 - LINE.x0) * lineP, height: 2, background: GREY_LINE, opacity: 0.9}} />

      {/* 光点：从左跑到右，到尽头停住（离场由整层 exitOp 负责，核心点不提前灭） */}
      {N >= 7040 ? (
        <>
          <div style={{position: 'absolute', left: dotX - 26, top: LINE.y - 26, width: 52, height: 52, borderRadius: 26, background: 'radial-gradient(circle, rgba(161,117,241,.55) 0%, rgba(161,117,241,0) 70%)', opacity: off}} />
          <div style={{position: 'absolute', left: dotX - 5, top: LINE.y - 6, width: 10, height: 10, borderRadius: 5, background: PURPLE_LIGHT, boxShadow: '0 0 12px 3px rgba(161,117,241,.8)', opacity: 1}} />
        </>
      ) : null}

      {/* 大问号：顶部中间，最亮（本体不乘 off，避免末 8 帧突然消失） */}
      {N >= 7063 ? (
        <>
          <GlowBlob cx={640} cy={178} r={150} N={N} k={(0.75 + 0.5 * qFlash) * off} alpha={0.24} />
          <div style={{position: 'absolute', inset: 0, opacity: qP, transform: `scale(${qS.toFixed(3)})`, transformOrigin: '640px 178px'}}>
            <CText
              cx={640}
              cy={178}
              size={110}
              family={FONT_ORB}
              weight={700}
              color={WHITE}
              shadow={`0 0 30px rgba(102,45,248,${(0.55 + 0.35 * qFlash).toFixed(2)}), 0 0 8px rgba(255,255,255,.6)`}
              style={{transform: `translate(-50%,-50%) scale(${(1 + 0.08 * qFlash).toFixed(3)})`, transformOrigin: '50% 50%'}}
            >
              ?
            </CText>
          </div>
        </>
      ) : null}
    </div>
  );
};
