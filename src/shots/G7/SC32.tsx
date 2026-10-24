import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {BellIcon} from '../../icons';
import {CText, GREY_LIGHT, PURPLE, PURPLE_DEEP, PURPLE_LIGHT, WHITE, exitOp, glowOffK, softOp} from '../../ui';
import {clamp01, powOutRemain, slideIn} from '../../common';
import {AlarmDevice, HandPress, SweepUnderline} from './parts';

/**
 * SC32 由人决定｜7854–8072｜「这就是 Command 的特点 / 由人决定什么时候做什么 / 墙上还有另一套装置」
 * 左侧大字「人决定」108px（白字紫描边）slideUp；右侧铜铃 + 一只手叠成一组，7925 强调一次「按下」；
 * 画面右缘 7993 滑进墙上的烟感装置一角（灰，为 SC33 埋线）。
 * 主角：大字 108px（≥96）；配角：铜铃 250、手、装置一角。
 * 持续动作：大字下方一条横线自左向右反复扫（7868 → 末帧）。
 * 无 GlitchIn（不在白名单）；末拍 8019 落位，8064 起淡出，稳定 45 帧。
 */
const F0 = 7854;
const TO = 8072;

const TXT = {cx: 390, cy: 300, size: 108};
const BELL = {cx: 860, cy: 375, size: 250};
const KNOB_Y = BELL.cy - 0.31 * BELL.size; // 顶钮中心
const HAND = {size: 150, palmY: KNOB_Y - 80}; // 悬停时指尖在顶钮上方 32px，按下后正落在顶钮上

export const SC32: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 12, 8); // 灭光放慢，给末拍稳定期留余量

  // 大字：7859 slideUp（7862 字幕的 −3）
  const tn = N - 7859;
  const tEase = slideIn(tn, 16, 2.4);
  const txtOp = softOp(tn, 6);
  const txtGlow = clamp01(tn / 16);

  // 手 + 铃：7862 淡入；7925 按下一次（10 帧），7950 抬起
  const grpOp = softOp(N - 7862, 10);
  const pressN = N - 7925;
  const press = slideIn(pressN, 10, 2) - slideIn(pressN - 25, 14, 2);
  const palmY = HAND.palmY + 32 * press;
  const emph = clamp01(pressN / 8) * (1 - clamp01((N - 7972) / 22));
  const sh = N >= 7933 && N < 7952 ? 3.2 * Math.exp(-(N - 7933) / 6) * Math.sin(((N - 7933) / 3.5) * Math.PI * 2) : 0;

  // 装置一角：7993 自右滑入一半（18 帧，7998 字幕的 −5）
  const devN = N - 7993;
  const devX = 118 * powOutRemain(devN, 18, 2.4);
  const devOp = softOp(devN, 8);

  // 持续动作：大字下方横线反复扫；8013 起停住（末拍留稳定期，不是靠收尾淡出）
  const scanN = N - 7868;
  const sweepT = Math.min(N, 8013) - 7868;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 主角：大字「人决定」 */}
      <div style={{position: 'absolute', inset: 0, opacity: txtOp, transform: `translateY(${(52 * (1 - tEase)).toFixed(2)}px)`}}>
        <GlowBlob cx={TXT.cx} cy={TXT.cy} r={250} N={N} k={txtGlow * off * 0.8} alpha={0.17} />
        <CText
          cx={TXT.cx}
          cy={TXT.cy}
          size={TXT.size}
          weight={900}
          scaleX={0.92}
          color={WHITE}
          letterSpacing={6}
          shadow={`0 0 34px rgba(102,45,248,.45), 5px 5px 0 ${PURPLE_DEEP}`}
          style={{WebkitTextStroke: `1.5px ${PURPLE}`}}
        >
          人决定
        </CText>
      </div>

      {/* 持续动作：大字下方反复扫过的横线 */}
      <SweepUnderline x={238} y={368} w={304} p={clamp01(scanN / 18)} t={Math.max(0, sweepT) / 52} segW={140} color={PURPLE_LIGHT} opacity={0.9 * off} />

      {/* 铜铃 + 手：一组 */}
      <div style={{position: 'absolute', inset: 0, opacity: grpOp * off}}>
        <GlowBlob cx={BELL.cx} cy={BELL.cy} r={190} N={N} k={(0.45 + 0.55 * emph) * off} alpha={0.2} />
        <GlowBlob cx={BELL.cx} cy={BELL.cy} r={124} N={N} k={(0.45 + 0.55 * emph) * off} alpha={0.24} />
        <div style={{position: 'absolute', inset: 0, transform: `rotate(${sh.toFixed(2)}deg)`, transformOrigin: `${BELL.cx}px ${BELL.cy + 0.24 * BELL.size}px`}}>
          <BellIcon cx={BELL.cx} cy={BELL.cy} size={BELL.size} color={WHITE} accent={emph > 0.25 ? PURPLE : GREY_LIGHT} />
        </div>
        <HandPress cx={BELL.cx} cy={palmY} size={HAND.size} rotate={174} color={emph > 0.25 ? PURPLE_LIGHT : GREY_LIGHT} opacity={0.9} />
      </div>

      {/* 右缘：墙上的另一套装置（灰，只露一角） */}
      {devN >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: devOp, transform: `translateX(${devX.toFixed(2)}px)`}}>
          <AlarmDevice cx={1268} cy={300} size={200} color={'#8E8E90'} accent={'#6E6E70'} opacity={0.85} needle={-24} />
        </div>
      ) : null}
    </div>
  );
};
