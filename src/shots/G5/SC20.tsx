import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {GREY_LINE, Svg, WHITE, exitOp, glowOffK, softOp} from '../../ui';
import {clamp01, easeInOutPow} from '../../common';
import {BigCard, SkillBox} from './parts';

/**
 * SC20 一张卡就是一套做法｜4720–5005
 * 卡盒从 SC19 的落位缩到台面下方当「源」，四张卡依次从盒中抽出、放大成 250×170 的大卡。
 * 主角：当前那张大卡（紫柔光跟当前卡走）。
 * 节拍：4728 盒缩 / 4757 表格 / 4810 程序错误 / 4866 周报 / 4917 客户投诉。
 * 持续动作：标题打字机 + 三条横线逐行填充；讲到下一张时上一张光标停、紫光转移。
 * 无 GlitchIn（本镜头不在闪烁白名单）。
 */
const F0 = 4720;
const TO = 5005;

const CW = 250;
const CH = 170;
const CY = 385;

const CARDS = [
  {title: '如何整理一份表格', tx: 255, f0: 4757},
  {title: '如何排查一个程序错误', tx: 535, f0: 4810},
  {title: '如何生成一份周报', tx: 815, f0: 4866},
  {title: '如何处理一封客户投诉', tx: 1095, f0: 4917},
];

export const SC20: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 卡盒：4728 起 22 帧，从 (580,400)/346 缩到 (640,560)/150
  const bp = easeInOutPow(2.5)(clamp01((N - 4728) / 22));
  const bx = 580 + (640 - 580) * bp;
  const by = 400 + (560 - 400) * bp;
  const bs = 346 + (150 - 346) * bp;
  const boxGlow = 0.55 * (1 - clamp01((N - 4720) / 12)) * off;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 台面线：给四张卡一个共同的空间基准 */}
      <Svg bloom={false} opacity={0.34}>
        <path d="M100 470H1180" stroke={GREY_LINE} strokeWidth={1.4} />
        {[255, 535, 815, 1095].map((x) => (
          <path key={x} d={`M${x} 462V470`} stroke={GREY_LINE} strokeWidth={1.2} />
        ))}
      </Svg>

      {/* 源：技能盒 */}
      <div style={{position: 'absolute', inset: 0}}>
        <GlowBlob cx={bx} cy={by} r={bs * 0.42} k={boxGlow} alpha={0.2} />
        <div style={{position: 'absolute', inset: 0, transform: `translate(${(bx - 580).toFixed(2)}px, ${(by - 400).toFixed(2)}px) scale(${(bs / 346).toFixed(3)})`, transformOrigin: '580px 400px'}}>
          <SkillBox cx={580} cy={400} size={346} color={WHITE} />
        </div>
      </div>

      {/* 四张卡：从盒里抽出 → 放大 → 落位 */}
      {CARDS.map((c, i) => {
        const n = N - c.f0;
        if (n < 0) return null;
        const p = easeInOutPow(2.2)(clamp01(n / 18));
        const x = bx + (c.tx - bx) * p;
        const y = by + (CY - by) * p;
        const s = 0.5 + 0.5 * p;
        const rot = (i % 2 === 0 ? -5 : 5) * (1 - p);
        const op = softOp(n, 8);

        const nextF = CARDS[i + 1]?.f0 ?? TO;
        const lit = clamp01((N - c.f0) / 10) * (1 - clamp01((N - nextF) / 11)) * off;

        // 打字机：落位过程末尾开始，2.2 帧/字；三条线每条 4 帧
        const titleStart = c.f0 + 11;
        const chars = N < titleStart ? 0 : Math.min(c.title.length, Math.floor((N - titleStart) / 2.2) + 1);
        const lineStart = titleStart + c.title.length * 2.2;
        const lineFill = [0, 1, 2].map((k) => clamp01((N - (lineStart + k * 4)) / 4));
        const live = N < nextF;
        const cursorRow = !live || N < lineStart ? -1 : Math.min(2, Math.floor((N - lineStart) / 4));
        const cursorOp = Math.floor(N / 6) % 2 === 0 ? 1 : 0;

        return (
          <div
            key={c.title}
            style={{
              position: 'absolute',
              left: x - CW / 2,
              top: y - CH / 2,
              width: CW,
              height: CH,
              opacity: op,
              transform: `rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(3)})`,
              transformOrigin: '50% 50%',
            }}
          >
            <BigCard
              w={CW}
              h={CH}
              title={c.title}
              chars={chars}
              titleSize={22}
              lineFill={lineFill}
              active={lit > 0.02}
              glowK={lit}
              cursorRow={cursorRow}
              cursorOp={cursorOp}
            />
          </div>
        );
      })}
    </div>
  );
};
