import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Box, CText, GLOW_PURPLE, GREY, GREY_LIGHT, GREY_LINE, GREY_MID, PURPLE, PURPLE_DEEP, PURPLE_LIGHT, WHITE, exitOp, firstOp, glowOffK, mixHex, scaleIn, softOp} from '../../ui';
import {FONT_HEAVY, FONT_MONO, clamp01} from '../../common';
import {PlugIcon} from './parts';

/**
 * SC41 外部服务按统一方式介绍自己｜10120–10284｜「外部服务接入之后，可以按照统一方式介绍自己」
 * 中间是一张自述卡（Mono 28），三行随三拍依次打出，右侧三条线指向三个去向。
 * 节拍：10128 第一行 name / description → 能力 / 10173 input_schema → 参数 / 10225 tool_result → 返回。
 * 主角：520×270 自述卡（紫描边 + 紫柔光）；紫只给「当前行」（键名、连线、去向标签）。
 * 最后 33 帧保持不动，仅在值区留三枚闪烁光标。
 */
const F0 = 10120;
const TO = 10284;

const CARD = {x: 360, y: 180, w: 520, h: 270};
const KEY_X = 388;
const BAR_X = 700;
const LABEL_X = 962;
const PLUG = {cx: 250, cy: 314, size: 150};

type Row = {key: string; label: string; cy: number; f0: number; type: number; lineAt: number; onAt: number; labelAt: number; barW: number};

const ROWS: Row[] = [
  {key: 'name / description', label: '能力', cy: 228, f0: 10126, type: 13, lineAt: 10142, onAt: 10156, labelAt: 10130, barW: 92},
  {key: 'input_schema', label: '参数', cy: 314, f0: 10171, type: 11, lineAt: 10187, onAt: 10201, labelAt: 10175, barW: 74},
  {key: 'tool_result', label: '返回', cy: 400, f0: 10222, type: 10, lineAt: 10232, onAt: 10242, labelAt: 10227, barW: 84},
];

const KEY_SIZE = 26;
const ADV = KEY_SIZE * 0.6; // 等宽字体单字符宽度

export const SC41: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  const cardN = N - 10123;
  const cardS = scaleIn(cardN, 21);
  const cardOp = cardN < 0 ? 0 : clamp01(0.1 + 1.8 * cardS);
  const cardGlow = clamp01(cardN / 14) * off;

  const plugN = N - 10125;
  const plugOp = softOp(plugN, 10);
  const leadP = clamp01((N - 10128) / 12);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8) * cardOp, transform: `scale(${cardS.toFixed(3)})`, transformOrigin: `${CARD.x + CARD.w / 2}px ${CARD.y + CARD.h / 2}px`}}>
      {/* 卡背后的紫柔光（主角光，跟着卡走） */}
      <div style={{position: 'absolute', left: CARD.x - 12, top: CARD.y - 12, width: CARD.w + 24, height: CARD.h + 24, borderRadius: 20, boxShadow: GLOW_PURPLE, opacity: 0.42 * cardGlow}} />

      {/* 自述卡 */}
      {cardN >= 0 && (
        <div style={{position: 'absolute', inset: 0}}>
          <Box x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} r={16} fill="rgba(0,0,0,0.58)" stroke={PURPLE_DEEP} sw={2.2} />
          {/* 行分隔（极淡、静态） */}
          <div style={{position: 'absolute', left: KEY_X, top: 271, width: CARD.x + CARD.w - 28 - KEY_X, height: 1.2, background: GREY_LINE, opacity: 0.22}} />
          <div style={{position: 'absolute', left: KEY_X, top: 357, width: CARD.x + CARD.w - 28 - KEY_X, height: 1.2, background: GREY_LINE, opacity: 0.22}} />
        </div>
      )}

      {/* 左侧插头（镜像，脚尖朝向卡） */}
      {plugOp > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: plugOp, transform: `scaleX(-1) translateX(${(-18 * (1 - softOp(plugN, 12))).toFixed(1)}px)`, transformOrigin: `${PLUG.cx}px ${PLUG.cy}px`}}>
          <PlugIcon cx={PLUG.cx} cy={PLUG.cy} size={PLUG.size} color={WHITE} accent={PURPLE_LIGHT} />
        </div>
      )}
      {/* 插头 → 卡的连线 */}
      <div style={{position: 'absolute', left: 300, top: PLUG.cy - 1.2, width: 56 * leadP, height: 2.4, background: PURPLE_LIGHT, opacity: 0.8 * leadP}} />
      <div style={{position: 'absolute', left: CARD.x - 5, top: PLUG.cy - 5, width: 10, height: 10, borderRadius: 5, background: PURPLE_LIGHT, opacity: 0.95 * leadP}} />

      {/* 三行 */}
      {ROWS.map((r, i) => {
        const n = N - r.f0;
        if (n < 0) return null;
        const chars = Math.ceil(clamp01(n / r.type) * r.key.length);
        const text = r.key.slice(0, chars);
        const typing = n < r.type;
        const nextF0 = i < ROWS.length - 1 ? ROWS[i + 1].f0 : Infinity;
        const isCurrent = N < nextF0;
        const keyColor = isCurrent ? PURPLE_LIGHT : mixHex(GREY_LIGHT, GREY, 0.35);
        const onK = clamp01((N - r.onAt) / 10);
        const labelColor = N < nextF0 ? mixHex(GREY, PURPLE_LIGHT, onK) : mixHex(GREY, GREY_LIGHT, 0.55);

        // 值区：键名打完后 2 帧开始填两条灰条，填完留一枚闪烁光标
        const barN = N - (r.f0 + r.type + 2);
        const barP = clamp01(barN / 6);
        const cursorOn = typing || (barN > 6 ? Math.floor(((N + i * 7) % 22) / 11) === 0 : true);
        const cursorX = typing ? KEY_X + chars * ADV + 4 : BAR_X + r.barW + 10;

        return (
          <React.Fragment key={r.key}>
            {/* 键名 */}
            <div style={{position: 'absolute', left: KEY_X, top: r.cy - 17, fontFamily: FONT_MONO, fontSize: KEY_SIZE, lineHeight: 1.2, color: keyColor, whiteSpace: 'pre', opacity: softOp(n, 3)}}>{text}</div>
            {/* 打字光标 / 值区光标 */}
            {cursorOn && <div style={{position: 'absolute', left: cursorX, top: r.cy - 14, width: 10, height: 24, background: typing ? PURPLE_LIGHT : PURPLE, opacity: typing ? 0.9 : 0.75}} />}

            {/* 值区两条灰条（表示「值」，不写具体内容） */}
            {barN >= 0 && (
              <>
                <div style={{position: 'absolute', left: BAR_X, top: r.cy - 10, width: r.barW * barP, height: 6, borderRadius: 3, background: mixHex(GREY_LINE, GREY_LIGHT, 0.4), opacity: 0.9}} />
                <div style={{position: 'absolute', left: BAR_X, top: r.cy + 6, width: r.barW * 0.62 * clamp01((barN - 4) / 6), height: 5, borderRadius: 3, background: GREY_LINE, opacity: 0.85}} />
              </>
            )}

            {/* 卡右缘 → 去向标签的连线 */}
            {N >= r.lineAt && (
              <div style={{position: 'absolute', left: CARD.x + CARD.w, top: r.cy - 1.1, width: 80 * clamp01((N - r.lineAt) / 12), height: 2.2, background: onK > 0.5 ? PURPLE_LIGHT : GREY_LIGHT, opacity: 0.85}} />
            )}
            {/* 去向标签 */}
            <div style={{position: 'absolute', inset: 0, opacity: softOp(N - r.labelAt, 8)}}>
              <div style={{position: 'absolute', left: LABEL_X, top: r.cy - 20, fontFamily: FONT_HEAVY, fontWeight: 700, fontSize: 34, lineHeight: 1.15, color: labelColor, letterSpacing: 2, whiteSpace: 'nowrap'}}>{r.label}</div>
            </div>
          </React.Fragment>
        );
      })}

      {/* 卡底部的一行极淡基线（静态） */}
      <div style={{position: 'absolute', left: CARD.x + 28, top: CARD.y + CARD.h - 18, width: (CARD.w - 56) * firstOp(N - 10130, 14), height: 1.4, background: PURPLE, opacity: 0.25}} />
    </div>
  );
};
