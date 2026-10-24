import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {exitOp, glowOffK, softOp} from '../../ui';
import {clamp01, easeInOutPow} from '../../common';
import {NoteCard} from './parts';

/**
 * SC25 四张便签｜6093–6354｜「客人不吃香菜 / 这个项目使用哪种代码规范 / 上次任务做到哪一步 / 某个文件放在什么位置」
 * 四张便签从左边（上一镜冰箱的方向）依次飞出、放大成 2×2 大卡，每张一行中文 + 两条灰线。
 * 主角：讲到的那张大卡（300×172，紫边 + 紫柔光，光随当前卡走）。
 * 节拍：6101 / 6148 / 6226 / 6289 各飞出一张；文字打字机；右下角打字光标持续闪。
 * 与分镜的偏差：分镜写「每张 18 帧、间隔 8 帧」，但硬规则要求元素入场落在字幕块 −6…+3，
 *   故起飞帧改为四段字幕块首（6101/6148/6226/6289），飞行 16 帧。见 BUILD_NOTES。
 * 无 GlitchIn（本镜头不在白名单）。
 */
const F0 = 6093;
const TO = 6354;

const CW = 290;
const CH = 172;

// x / y 为卡片左上角；2×2 两列两行，底边 612 不碰字幕带
const CARDS = [
  {title: '客人不吃香菜', f0: 6101, x: 360, y: 250},
  {title: '这个项目使用哪种代码规范', f0: 6148, x: 890, y: 250},
  {title: '上次任务做到哪一步', f0: 6226, x: 360, y: 440},
  {title: '某个文件放在什么位置', f0: 6289, x: 890, y: 440},
];

const PLANE = easeInOutPow(2.0);

export const SC25: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 当前卡的光：按四张卡的 lit 加权求中心，讲到哪张光移到哪张
  // litRaw 不乘 off（乘了会在离场前把「当前卡」提前变回白色），glow 强度才乘 off
  const lits = CARDS.map((c, i) => {
    const nextF = CARDS[i + 1]?.f0 ?? TO;
    return clamp01((N - c.f0) / 10) * (1 - clamp01((N - nextF) / 11));
  });
  const sum = lits.reduce((a, b) => a + b, 0);
  const glowC = sum > 0.001
    ? {
        x: lits.reduce((a, k, i) => a + (CARDS[i].x + CW / 2) * k, 0) / sum,
        y: lits.reduce((a, k, i) => a + (CARDS[i].y + CH / 2) * k, 0) / sum,
      }
    : {x: 640, y: 360};

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {sum > 0.001 ? <GlowBlob cx={glowC.x} cy={glowC.y} r={250} N={N} k={(sum / 1.2) * off} alpha={0.16} /> : null}

      {CARDS.map((c, i) => {
        const t = N - c.f0;
        if (t < 0) return null;
        const p = PLANE(clamp01(t / 16));
        const fromX = c.x - 300;
        const fromY = c.y + 50;
        const x = fromX + (c.x - fromX) * p;
        const y = fromY + (c.y - fromY) * p;
        const s = 0.5 + 0.5 * p;
        const op = softOp(t, 6);
        const nextF = CARDS[i + 1]?.f0 ?? TO;
        const lit = lits[i];

        // 打字机：落位过程末段开始，1.1 帧/字；12 字的卡约 14 帧打完
        const chars = t < 4 ? 0 : Math.min(c.title.length, Math.floor((N - (c.f0 + 4)) / 1.1) + 1);
        const cursorOn = N < nextF ? 1 : 0;
        const cursorOp = cursorOn * clamp01((t - 2) / 5) * (Math.floor(N / 7) % 2 === 0 ? 0.95 : 0.18) * off;
        const tf = 'rotate(' + ((i % 2 === 0 ? -4 : 4) * (1 - p) * s).toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';

        return (
          <div
            key={c.title}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: CW,
              height: CH,
              opacity: op,
              transform: tf,
              transformOrigin: '50% 50%',
            }}
          >
            <NoteCard
              w={CW}
              h={CH}
              title={c.title}
              chars={chars}
              titleSize={c.title.length >= 11 ? 22 : 24}
              active={lit > 0.5}
              glowK={lit * off}
              cursorOp={cursorOp}
            />
          </div>
        );
      })}
    </div>
  );
};
