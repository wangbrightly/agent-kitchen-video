import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {Box, PURPLE_DEEP, PURPLE_LIGHT, GREY_MID, GREY_LINE, WHITE, Svg, abs, exitOp, glowOffK, glowPurpleS, mixHex, slideUp, softOp} from '../../ui';
import {FONT_HEAVY, clamp01} from '../../common';
import {Caret, typeSlice, textW} from './parts';

/**
 * SC16 单子上的话｜3843–4008｜「请读取这份文件 / 请查询这条数据 / 请运行这段代码」
 * 主角：三张竖排叠放的单子（各 300×128，x 错 24px），中间一张常亮紫描边 + 组中心柔光（"中间一张最亮"）。
 * 每张三个字段 name / description / input_schema：字段被写到时 8 帧灰→紫，写完转白；
 * 右侧值区逐字打出（这是本镜头从头到尾的持续动作）。
 * 入场：三张 3 帧错峰 slideUp（3845/3848/3851，落在 S47 块首 3851 的 −6…+0 窗口内）。
 * 无 GlitchIn / 无扫光三件套。
 */
const F0 = 3843;
const TO = 4008;

const CARD_W = 360;
const CARD_H = 134;

type Field = {key: string; val: string; f: number};
type CardSpec = {x: number; y: number; f0: number; fpt: number; fields: Field[]};

const CARDS: CardSpec[] = [
  {
    x: 436,
    y: 175,
    f0: 3845,
    fpt: 2.2,
    fields: [
      {key: 'name', val: '读取文件', f: 3851},
      {key: 'description', val: '读出文件内容', f: 3863},
      {key: 'input_schema', val: '{ 路径 }', f: 3875},
    ],
  },
  {
    x: 460,
    y: 329,
    f0: 3848,
    fpt: 2.2,
    fields: [
      {key: 'name', val: '查询数据', f: 3901},
      {key: 'description', val: '查一条记录', f: 3913},
      {key: 'input_schema', val: '{ 条件 }', f: 3925},
    ],
  },
  {
    x: 484,
    y: 483,
    f0: 3851,
    fpt: 1.5,
    fields: [
      {key: 'name', val: '运行代码', f: 3944},
      {key: 'description', val: '执行代码返回', f: 3951},
      {key: 'input_schema', val: '{ 代码 }', f: 3958},
    ],
  },
];

const ROW_Y = [33, 67, 101]; // 三行文字的墨迹中心（卡内坐标）
const VAL_X = 186; // 值区左边界
const PAD = 14; // 卡内左右留白

const FieldRow: React.FC<{f: Field; N: number; fpt: number}> = ({f, N, fpt}) => {
  const n = N - f.f;
  const typeEnd = 2 + f.val.length * fpt;
  // 字段名：未到 → 暗灰；被写到 → 8 帧灰→紫；写完 → 8 帧紫→白
  let keyColor = GREY_MID;
  let keyOp = 0.5;
  if (n >= 0) {
    if (n < 8) {
      keyColor = mixHex(GREY_MID, PURPLE_LIGHT, n / 8);
      keyOp = 0.5 + 0.5 * (n / 8);
    } else {
      keyOp = 1;
      keyColor = n < typeEnd + 6 ? PURPLE_LIGHT : mixHex(PURPLE_LIGHT, WHITE, clamp01((n - typeEnd - 6) / 8));
    }
  }
  const val = n < 0 ? '' : typeSlice(f.val, n - 2, fpt);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: PAD,
          top: 0,
          transform: `translateY(-50%)`,
          fontFamily: 'SF Mono, Menlo, Consolas, monospace',
          fontSize: 18,
          lineHeight: 1,
          color: keyColor,
          opacity: keyOp,
          whiteSpace: 'nowrap',
        }}
      >
        {f.key}
      </div>
      <div
        style={{
          position: 'absolute',
          left: VAL_X,
          top: 0,
          transform: 'translateY(-50%)',
          fontFamily: FONT_HEAVY,
          fontSize: 19,
          fontWeight: 700,
          lineHeight: 1,
          color: WHITE,
          opacity: n < 0 ? 0 : 0.95,
          whiteSpace: 'nowrap',
        }}
      >
        {val}
      </div>
      {n >= 0 && n <= typeEnd + 4 ? <Caret x={VAL_X + textW(val, 19) + 3} y={-9} N={N} h={17} /> : null}
    </>
  );
};

export const SC16: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);
  // 组中心柔光（"中间一张最亮"）：常亮，离场前灭光
  const centerK = clamp01((N - 3845) / 14) * off;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <GlowBlob cx={640} cy={397} r={300} N={N} k={centerK} alpha={0.12} />
      <GlowBlob cx={640} cy={397} r={168} N={N} k={centerK} alpha={0.14} />

      {CARDS.map((c, ci) => {
        const n = N - c.f0;
        if (n < 0) return null;
        const dy = slideUp(n, 26, 14); // 3 帧错峰向上滑入
        const isMid = ci === 1;
        const stroke = isMid ? PURPLE_DEEP : GREY_LINE;
        return (
          <div key={ci} style={{position: 'absolute', inset: 0, opacity: softOp(n, 8)}}>
            <Box
              x={c.x}
              y={c.y + dy}
              w={CARD_W}
              h={CARD_H}
              r={8}
              fill="#000"
              stroke={stroke}
              sw={2}
              glow={isMid ? glowPurpleS(0.42 * centerK) : undefined}
            >
              {c.fields.map((f, i) => (
                <div key={f.key} style={{...abs(0, ROW_Y[i], CARD_W, 1)}}>
                  <FieldRow f={f} N={N} fpt={c.fpt} />
                </div>
              ))}
            </Box>
          </div>
        );
      })}

      {/* 卡内分隔线（很淡的三条横线，让三行读成一张表单） */}
      <Svg bloom={false} opacity={0.5}>
        {CARDS.map((c, ci) => {
          const n = N - c.f0;
          if (n < 0) return null;
          const dy = slideUp(n, 26, 14);
          return [1, 2].map((k) => (
            <line key={`${ci}-${k}`} x1={c.x + PAD} y1={c.y + dy + ROW_Y[k - 1] + 16} x2={c.x + CARD_W - PAD} y2={c.y + dy + ROW_Y[k - 1] + 16} stroke={GREY_LINE} strokeWidth={1} opacity={0.55} />
          ));
        })}
      </Svg>
    </div>
  );
};
