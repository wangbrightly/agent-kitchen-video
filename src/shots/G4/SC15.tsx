import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {BrainIcon} from '../../icons';
import {PURPLE, PURPLE_LIGHT, GREY, GREY_LINE, RED_DEEP, WHITE, Svg, abs, exitOp, firstOp, glowOffK, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, powOutRemain} from '../../common';
import {Caret, Slip, ToolGlyph, typeSlice, textW} from './parts';

/**
 * SC15 不能直接用｜3645–3842｜「模型不能直接使用这些工具，它只能提出调用请求。比如——」
 * 主角：单子 300×180（紫描边 + 紫柔光，3722 起自脑侧飞出，位移 260 + 旋转 −6°→0，22 帧）。
 * 配角：脑 170（常驻，紫柔光）、右侧三枚灰工具线稿（文件 / 搜索 / 终端）、被红色短杠截断的虚线、每 42 帧一次"伸手被挡"的紫光点。
 * 持续：被挡光点循环（3657→镜头尾）；3782「比如」起单子三行参数逐字写入（到 3804 落定）。
 * 无 GlitchIn / 无扫光三件套。
 */
const F0 = 3645;
const TO = 3842;

const BRAIN = {cx: 300, cy: 390, size: 170};
const SLIP = {x: 750, y: 270, w: 300, h: 180}; // 中心 (900,360)，比分镜 240×150 放大到 300×180：三行参数放得下、且高度过 170px 主角线
const TOOL_X = 1140;
const LINE_Y = 390;
const LINE_X0 = 394;
const LINE_X1 = 1112;
const BAR_X = 650;

// 单子里的三行参数：3782「比如」块首 −6 起逐字写入
const ROWS = [
  {k: 'name', v: '读文件', f: 3776},
  {k: 'description', v: '内容', f: 3778},
  {k: 'input_schema', v: '{}', f: 3780},
];
const FPT = 1.7;

export const SC15: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 脑：镜头首帧即在（承接上一镜的工具语境），10 帧落定；单子落位后退到 0.55，紫光让给单子
  const brainK = clamp01((N - F0) / 10) * (1 - 0.45 * clamp01((N - 3728) / 12));
  const brainGlow = brainK * off;

  // 三枚"这些工具"：整段保持灰色（不能用）
  const toolOp = softOp(N - (F0 + 1), 10) * 0.75;

  // 虚线 + 红色短杠：3653「模型不能直接使用这些工具」
  const lineP = clamp01((N - 3653) / 14);
  const barP = clamp01((N - 3653) / 10);

  // "伸手被挡"循环：42 帧一轮，前 26 帧光点从脑侧跑到短杠，26–32 帧短杠红闪，之后熄灭重来
  const cyc = N - 3657;
  const cycleN = cyc >= 0 ? cyc % 42 : 0;
  const travel = clamp01(cycleN / 26);
  const dotX = LINE_X0 + (BAR_X - 6 - LINE_X0) * travel;
  const dotOp = cyc < 0 ? 0 : cycleN < 26 ? 0.95 : cycleN < 32 ? 0.95 * (1 - (cycleN - 26) / 6) : 0;
  const blockHit = cyc >= 0 && cycleN >= 26 && cycleN < 34 ? 1 - (cycleN - 26) / 8 : 0;

  // 单子：3722「它只能提出调用请求」起 22 帧飞出；3742 起亮柔光
  const sn = N - 3722;
  const flyK = powOutRemain(sn, 22, 2.5);
  const slipX = SLIP.x - 260 * flyK;
  const slipRot = -6 * flyK; // powOutRemain 是"剩余量"：sn=0 时 =1（−6°），落位后 =0
  const slipGlowK = clamp01((N - 3742) / 10) * off;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 三枚灰色工具（文件 / 搜索 / 终端） */}
      <ToolGlyph kind="file" cx={TOOL_X} cy={270} size={56} color={GREY} accent={GREY} opacity={toolOp} />
      <ToolGlyph kind="search" cx={TOOL_X} cy={390} size={56} color={GREY} accent={GREY} opacity={toolOp} />
      <ToolGlyph kind="code" cx={TOOL_X} cy={510} size={56} color={GREY} accent={GREY} opacity={toolOp} />

      {/* 被截断的虚线：脑 → 工具 */}
      <Svg bloom={false} opacity={lineP * 0.85}>
        <line
          x1={LINE_X0}
          y1={LINE_Y}
          x2={LINE_X0 + (LINE_X1 - LINE_X0) * lineP}
          y2={LINE_Y}
          stroke={GREY_LINE}
          strokeWidth={1.6}
          strokeDasharray="9 8"
        />
      </Svg>

      {/* 红色短杠：横切虚线 */}
      {barP > 0 ? (
        <div
          style={{
            ...abs(BAR_X - 5, LINE_Y - 24,
              10,
              48 * barP),
            background: RED_DEEP,
            borderRadius: 2,
            transform: `scaleY(${barP.toFixed(2)})`,
            transformOrigin: '50% 50%',
            opacity: 0.95,
            boxShadow: blockHit > 0 ? `0 0 ${(12 + 14 * blockHit).toFixed(0)}px ${(3 + 4 * blockHit).toFixed(0)}px rgba(236,8,31,${(0.55 * blockHit).toFixed(2)})` : '0 0 10px 2px rgba(236,8,31,.32)',
          }}
        />
      ) : null}

      {/* 伸手被挡的紫光点（动词动作：每 42 帧一次） */}
      {dotOp > 0 ? (
        <div
          style={{
            ...abs(dotX - 3.5, LINE_Y - 3.5, 7, 7),
            borderRadius: 4,
            background: PURPLE_LIGHT,
            opacity: dotOp,
            boxShadow: '0 0 10px 3px rgba(102,45,248,.75)',
          }}
        />
      ) : null}

      {/* 主角之一：脑 170（紫柔光） */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - F0, 8)}}>
        <GlowBlob cx={BRAIN.cx} cy={BRAIN.cy} r={148} N={N} k={brainGlow} alpha={0.2} />
        <GlowBlob cx={BRAIN.cx} cy={BRAIN.cy} r={104} N={N} k={brainGlow} alpha={0.26} />
        <BrainIcon cx={BRAIN.cx} cy={BRAIN.cy} size={BRAIN.size} color={WHITE} accent={PURPLE} />
      </div>

      {/* 主角：单子 300×180（紫描边 + 柔光，3722 起飞出） */}
      {sn >= 0 ? (
        <>
          <div style={{position: 'absolute', inset: 0, opacity: softOp(sn, 6)}}>
            <GlowBlob cx={slipX + SLIP.w / 2} cy={SLIP.y + SLIP.h / 2} r={190} N={N} k={slipGlowK} alpha={0.18} />
            <Slip x={slipX} y={SLIP.y} w={SLIP.w} h={SLIP.h} header="tool_use" opacity={1} rotate={slipRot} glowK={slipGlowK}>
              {ROWS.map((r, i) => {
                const cy = 72 + i * 34;
                const key = typeSlice(r.k, N - r.f, FPT);
                const keyEnd = r.f + r.k.length * FPT;
                const val = typeSlice(r.v, N - keyEnd, FPT);
                const valEnd = keyEnd + r.v.length * FPT;
                const typing = N >= r.f && N <= valEnd + 6;
                const top = cy - 13;
                return (
                  <React.Fragment key={r.k}>
                    {/* 键名与值同 top / 同 lineHeight，基线天然对齐 */}
                    <div style={{position: 'absolute', left: 16, top, fontFamily: 'SF Mono, Menlo, Consolas, monospace', fontSize: 21, lineHeight: 1.2, color: GREY, opacity: 0.95, whiteSpace: 'nowrap'}}>{key}</div>
                    <div style={{position: 'absolute', left: 196, top, fontFamily: FONT_HEAVY, fontSize: 22, lineHeight: 1.2, fontWeight: 600, color: WHITE, whiteSpace: 'nowrap'}}>{val}</div>
                    {typing ? <Caret x={196 + textW(val, 22) + 4} y={top + 1} N={N} h={18} /> : null}
                  </React.Fragment>
                );
              })}
            </Slip>
          </div>
        </>
      ) : null}
    </div>
  );
};
