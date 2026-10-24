import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {BellIcon, BrainIcon, CardBoxIcon, ChefIcon, CrateIcon} from '../../icons';
import {CText, CORAL, GREY_LIGHT, GREY_MID, PURPLE_DEEP, PURPLE_LIGHT, WHITE, exitOp, glowOffK, mixHex, scaleIn} from '../../ui';
import {FONT_HEAVY, FONT_WIDE, GlitchIn, clamp01, easeInOutPow, emphasisPulse} from '../../common';
import {StickyNoteIcon} from '../G1/parts';
import {Bracket, PlugGlyph, qPoint} from './parts';

/**
 * SC50 箱子不是厨师｜12176–12372｜「这整箱东西 / 就是 Plugin / 插件 / 插件本身不是厨师 / 也不是大模型」
 * 第 6 章章论点型高光（≥90 帧）。
 * 左：CrateIcon 240 + 「Plugin」Audiowide 100（本组唯一 GlitchIn + 硬投影 + 一次 emphasisPulse）。
 * 右：ChefIcon 150 与 BrainIcon 150 各 11 帧转灰，各打一个 12 帧画出的 ≠（珊瑚色，右侧无紫光）。
 * 承接：开镜木箱在画面中央，SC49 的四件小物从上方收回箱口（一次性，不循环）。
 * 主角：Plugin 100（大字 ≥96）；木箱 240 带紫柔光。
 */
const F0 = 12176;
const TO = 12372;

// 木箱：从 SC49 的居中位置（相机 1.15 后屏幕约 (640,396.8)、276）移到左侧 (330,380)
const crateAt = (N: number) => {
  const t = easeInOutPow(2.2)(clamp01((N - F0) / 10));
  return {x: 640 - 310 * t, y: 396.8 - 16.8 * t, size: 276 - 36 * t};
};

// SC49 收势时四件小物的屏幕落点（相机 1.15：x=(wx−640)·1.15+640，y=(wy−420)·1.15+360）
const ITEM_START = [
  {x: 355.4, y: 199},
  {x: 545.1, y: 199},
  {x: 734.9, y: 199},
  {x: 924.6, y: 199},
];
const ITEM_LABEL_Y = 281.8;
const ITEM_START_SIZE = 126.5;
const ITEMS: Array<{kind: 'card' | 'note' | 'plug' | 'bell'; label: string}> = [
  {kind: 'card', label: '技能卡'},
  {kind: 'note', label: '记忆模板'},
  {kind: 'plug', label: '配置'},
  {kind: 'bell', label: '触发规则'},
];

const ItemGlyph: React.FC<{kind: string; cx: number; cy: number; size: number; color: string; accent: string; opacity: number}> = ({kind, cx, cy, size, color, accent, opacity}) => {
  if (kind === 'card') return <CardBoxIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  if (kind === 'note') return <StickyNoteIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  if (kind === 'plug') return <PlugGlyph cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  return <BellIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
};

/** 左对齐的揭示进度（clip-path 左→右），用于 12 帧画出 ≠ */
const revealClip = (p: number) => `inset(0 ${(100 * (1 - clamp01(p))).toFixed(1)}% 0 0)`;

export const SC50: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);
  const crate = crateAt(N);
  const mouth = {x: crate.x, y: crate.y - 67};

  // 四件小物收回箱口：12176 起 16 帧，2 帧错峰
  const itemOps = ITEMS.map((_, i) => 1 - clamp01((N - (F0 + i * 2)) / 16));
  const itemPos = ITEMS.map((_, i) => {
    const t = easeInOutPow(2)(clamp01((N - (F0 + i * 2)) / 16));
    const s = ITEM_START[i];
    const [x, y] = qPoint(s.x, s.y, (s.x + mouth.x) / 2, Math.min(s.y, mouth.y) - 30, mouth.x, mouth.y, t);
    return {x, y, sc: 1 - 0.62 * t};
  });

  const bracketP = clamp01((N - 12184) / 14);
  const bracketDim = 1 - 0.55 * clamp01((N - 12207) / 12);

  const pluginN = N - 12207;
  const pluginPulse = emphasisPulse(N - 12238, {peak: 1.05, up: 10, hold: 4, down: 12});
  const underlineP = clamp01((N - 12238) / 18);

  // 右侧：厨师 12264 / 大脑 12321 登场后 11 帧转灰，同一帧起 12 帧画出 ≠
  const chefN = N - 12264;
  const chefS = scaleIn(chefN, 18);
  const chefGrey = clamp01((N - 12265) / 11);
  const chefNot = clamp01((N - 12265) / 12);
  const brainN = N - 12321;
  const brainS = scaleIn(brainN, 18);
  const brainGrey = clamp01((N - 12322) / 11);
  const brainNot = clamp01((N - 12322) / 12);

  const chefColor = mixHex(WHITE, GREY_MID, chefGrey);
  const chefAccent = mixHex(PURPLE_LIGHT, GREY_MID, chefGrey);
  const brainColor = mixHex(WHITE, GREY_MID, brainGrey);
  const brainAccent = mixHex(PURPLE_LIGHT, GREY_MID, brainGrey);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 左侧分隔：箱子 | 不是 */}
      <div style={{position: 'absolute', left: 640, top: 190, width: 1.6, height: 400 * clamp01((N - 12207) / 16), background: '#3A3A3A'}} />

      {/* 木箱紫柔光（右侧一律无光） */}
      <GlowBlob cx={crate.x} cy={crate.y} r={200} k={0.2 * off} alpha={0.26} />
      <GlowBlob cx={crate.x} cy={crate.y} r={132} k={0.2 * off} alpha={0.22} />

      {/* 四件小物收回箱口（承接 SC49 的落点） */}
      {ITEMS.map((it, i) => {
        if (itemOps[i] <= 0.01) return null;
        const p = itemPos[i];
        return (
          <React.Fragment key={it.kind}>
            <div style={{position: 'absolute', inset: 0, opacity: itemOps[i], transform: `translate(${(p.x - ITEM_START[i].x).toFixed(2)}px, ${(p.y - ITEM_START[i].y).toFixed(2)}px) scale(${p.sc.toFixed(3)})`, transformOrigin: `${ITEM_START[i].x}px ${ITEM_START[i].y}px`}}>
              <ItemGlyph kind={it.kind} cx={ITEM_START[i].x} cy={ITEM_START[i].y} size={ITEM_START_SIZE} color={WHITE} accent={PURPLE_LIGHT} opacity={1} />
            </div>
            <div style={{position: 'absolute', inset: 0, opacity: itemOps[i] * 0.9}}>
              <CText cx={ITEM_START[i].x} cy={ITEM_LABEL_Y} size={24} weight={600} family={FONT_HEAVY} color={GREY_LIGHT} dy={-1}>
                {it.label}
              </CText>
            </div>
          </React.Fragment>
        );
      })}

      {/* 木箱 */}
      <CrateIcon cx={crate.x} cy={crate.y} size={crate.size} color={WHITE} accent={PURPLE_LIGHT} />

      {/* 「这整箱东西」：四角括号把箱子框住 */}
      <Bracket x={180} y={240} w={300} h={250} p={bracketP} color={PURPLE_LIGHT} sw={2.6} arm={30} opacity={0.85 * bracketDim} />

      {/* 「就是 Plugin」：本组唯一 GlitchIn + 紫硬投影 */}
      <GlitchIn N={N} f0={12207} rgbSplit={4} slices={4} seed={50}>
        <CText
          cx={330}
          cy={544}
          size={100}
          family={FONT_WIDE}
          weight={400}
          color={WHITE}
          letterSpacing={2}
          shadow={`6px 6px 0 ${PURPLE_DEEP}, 0 0 30px rgba(102,45,248,.5)`}
          style={{transform: `translate(-50%,-50%) scale(${pluginPulse.toFixed(4)})`, transformOrigin: '50% 50%'}}
        >
          Plugin
        </CText>
      </GlitchIn>

      {/* 「插件」：一道紫线把词收住 */}
      {underlineP > 0 ? (
        <div style={{position: 'absolute', left: 180, top: 606, width: 300 * underlineP, height: 2.4, borderRadius: 2, background: PURPLE_LIGHT, opacity: 0.85, boxShadow: '0 0 14px 3px rgba(102,45,248,.55)'}} />
      ) : null}

      {/* 厨师：白色登场 → 11 帧转灰 + ≠ */}
      {chefN >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: clamp01(0.1 + 1.7 * chefS), transform: `scale(${(0.86 + 0.14 * chefS).toFixed(3)})`, transformOrigin: '840px 340px'}}>
          <ChefIcon cx={840} cy={340} size={150} color={chefColor} accent={chefAccent} />
        </div>
      ) : null}
      {chefNot > 0 ? (
        <CText cx={908} cy={392} size={58} weight={900} family={FONT_HEAVY} color={CORAL} opacity={chefNot} style={{clipPath: revealClip(chefNot)}}>
          ≠
        </CText>
      ) : null}

      {/* 大脑：同样 11 帧转灰 + ≠ */}
      {brainN >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: clamp01(0.1 + 1.7 * brainS), transform: `scale(${(0.86 + 0.14 * brainS).toFixed(3)})`, transformOrigin: '1090px 340px'}}>
          <BrainIcon cx={1090} cy={340} size={150} color={brainColor} accent={brainAccent} />
        </div>
      ) : null}
      {brainNot > 0 ? (
        <CText cx={1158} cy={392} size={58} weight={900} family={FONT_HEAVY} color={CORAL} opacity={brainNot} style={{clipPath: revealClip(brainNot)}}>
          ≠
        </CText>
      ) : null}
    </div>
  );
};
