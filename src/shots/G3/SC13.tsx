import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {KnifeIcon} from '../../icons';
import {Box, CText, GREY, GREY_LIGHT, GREY_LINE, GREY_MID, PURPLE_LIGHT, WHITE, exitOp, mixHex, scaleIn, softOp} from '../../ui';
import {clamp01} from '../../common';
import {BiArrow, DigitalIcon, PotIcon, TongsIcon} from './parts';

/**
 * SC13 实物与数字｜3144–3436｜「工具让智能体可以执行具体动作：刀可以切菜、锅可以加热、夹子可以夹取。
 * 在数字世界里，工具可能是文件、网页、终端。」
 * 主角：左组三件实物（刀 / 锅 / 夹子，120 基准；讲到哪件，11 帧灰→紫并放大到 170）。
 * 配角：中间双向箭头（16 帧 draw-on）+ 两枚往返光点；右侧三枚 120 灰虚框（文件 / 网页 / 终端）待填，
 *       3383 起三枚依次转紫（下一步的数字工具）。
 * 出现帧：3150/3152/3154 左三件（2 帧错峰，块首 3152）/ 3154 箭头 / 3344/3346/3348 右三框。
 */
const F0 = 3144;
const TO = 3436;

const LEFT = [
  {key: 'knife', label: '刀', y: 130, entry: 3150, lit: 3246, next: 3261},
  {key: 'pot', label: '锅', y: 305, entry: 3152, lit: 3261, next: 3296},
  {key: 'tongs', label: '夹子', y: 480, entry: 3154, lit: 3296, next: 3346},
];

const RIGHT: Array<{kind: 'file' | 'web' | 'terminal'; label: string; y: number; entry: number; pulse: number}> = [
  {kind: 'file', label: '文件', y: 130, entry: 3344, pulse: 3381},
  {kind: 'web', label: '网页', y: 305, entry: 3346, pulse: 3383},
  {kind: 'terminal', label: '终端', y: 480, entry: 3348, pulse: 3385},
];

const ARROW = {x0: 440, x1: 860, y: 340};

export const SC13: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // 箭头 3154 起 16 帧画完
  const arrowP = clamp01((N - 3154) / 16);
  // 两枚光点：46 帧单程来回，相位差半程
  const dotPos = (offset: number) => {
    const u = (((N - 3170) / 46 + offset) % 2 + 2) % 2;
    const t = u < 1 ? u : 2 - u;
    return ARROW.x0 + (ARROW.x1 - ARROW.x0) * t;
  };

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 左组：实物三件 */}
      {LEFT.map((it) => {
        const en = N - it.entry;
        if (en < 0) return null;
        const s = scaleIn(en, 16);
        const op = softOp(en, 10);
        const k = clamp01((N - it.lit) / 11) * (1 - clamp01((N - it.next) / 11));
        const size = 120 * (1 + 0.417 * k);
        const color = mixHex(GREY_LIGHT, PURPLE_LIGHT, k);
        const labelColor = mixHex(GREY, WHITE, k);
        return (
          <React.Fragment key={it.key}>
            {k > 0.02 && <GlowBlob cx={320} cy={it.y} r={118} k={k} alpha={0.32} />}
            <div style={{position: 'absolute', inset: 0, opacity: op, transform: `scale(${s.toFixed(3)})`, transformOrigin: `320px ${it.y}px`}}>
              {it.key === 'knife' && <KnifeIcon cx={320} cy={it.y} size={size} color={color} accent={color} />}
              {it.key === 'pot' && <PotIcon cx={320} cy={it.y} size={size} color={color} accent={color} />}
              {it.key === 'tongs' && <TongsIcon cx={320} cy={it.y} size={size} color={color} accent={color} />}
              <CText cx={320} cy={it.y + 100} size={22} weight={700} color={labelColor} letterSpacing={4} opacity={0.95}>
                {it.label}
              </CText>
            </div>
          </React.Fragment>
        );
      })}

      {/* 中间：双向箭头 + 往返光点 */}
      <BiArrow x0={ARROW.x0} x1={ARROW.x1} y={ARROW.y} p={arrowP} color={GREY_LIGHT} opacity={0.95} />
      {arrowP > 0.9
        ? [0, 1].map((o) => {
            const x = dotPos(o);
            return <div key={o} style={{position: 'absolute', left: x - 3.5, top: ARROW.y - 3.5, width: 7, height: 7, borderRadius: 4, background: PURPLE_LIGHT, boxShadow: '0 0 10px 3px rgba(102,45,248,.8)'}} />;
          })
        : null}

      {/* 右组：数字工具（灰虚框待填） */}
      {RIGHT.map((it) => {
        const en = N - it.entry;
        if (en < 0) return null;
        const op = softOp(en, 10);
        const k = clamp01((N - it.pulse) / 9);
        const stroke = mixHex(GREY_LINE, PURPLE_LIGHT, k);
        return (
          <React.Fragment key={it.kind}>
            {k > 0.02 && <GlowBlob cx={960} cy={it.y} r={92} k={k} alpha={0.3} />}
            <div style={{position: 'absolute', inset: 0, opacity: op}}>
              <Box x={900} y={it.y - 60} w={120} h={120} r={10} fill="rgba(0,0,0,0.6)" stroke={stroke} sw={k > 0.02 ? 2.2 : 1.6} dashed />
              <DigitalIcon cx={960} cy={it.y} size={68} kind={it.kind} color={mixHex(GREY_MID, PURPLE_LIGHT, k)} accent={mixHex(GREY_MID, PURPLE_LIGHT, k)} />
              <CText cx={960} cy={it.y + 100} size={22} weight={700} color={mixHex(GREY, WHITE, k)} letterSpacing={4} opacity={0.95}>
                {it.label}
              </CText>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
