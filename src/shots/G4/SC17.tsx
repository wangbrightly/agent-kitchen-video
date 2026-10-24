import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GlowBlob} from '../../fx';
import {BrainIcon} from '../../icons';
import {
  Box,
  LineArrow,
  MonoText,
  PURPLE_LIGHT,
  PURPLE_DEEP,
  GREY_LINE,
  GREY_LIGHT,
  WHITE,
  Svg,
  abs,
  exitOp,
  glowOffK,
  glowPurple,
  scaleIn,
  softOp,
} from '../../ui';
import {GlitchIn, FONT_MONO, clamp01} from '../../common';
import {MiniLabel, PolyArrow, RingPulse, Slip, ValueBars, polyPoint} from './parts';

/**
 * SC17 外部执行并回填｜4009–4241｜「外部程序真正执行动作 / 再把结果递回厨房 / 厨师看到结果之后 / 继续判断下一步」
 * 横向三步：脑 →「单子」→「外部程序」盒（内写 your application）→「结果」单子；一条箭头从结果绕回脑。
 * 主角：外部程序盒 260×180（紫填充 + 白边 + 紫柔光）。唯一 GlitchIn：结果单子顶部的 tool_result（4082）。
 * 运镜：承接位移，整组左移 60（4009–4039，30 帧）。轨道换步：写单子→外部执行在 4017、外部执行→结果回填在 4136。
 * 持续动作：光点沿 单子→盒→结果→脑 闭环跑（4102 起，96 帧一圈）+ 盒内扫描线。
 */
const F0 = 4009;
const TO = 4241;

const BRAIN = {cx: 110, cy: 400, size: 90};
const SLIP = {x: 210, y: 325, w: 220, h: 150};
const BOX = {x: 480, y: 310, w: 260, h: 180};
const RES = {x: 830, y: 330, w: 220, h: 140};
const BOX_CX = BOX.x + BOX.w / 2; // 610
const BOX_CY = BOX.y + BOX.h / 2; // 360
const RES_CX = RES.x + RES.w / 2; // 940

// 闭环路径：脑 → 单子 → 盒 → 结果 → 顶部绕回 → 脑
const LOOP: Array<[number, number]> = [
  [BRAIN.cx, 400],
  [SLIP.x, 400],
  [SLIP.x + SLIP.w, 400],
  [BOX.x, 400],
  [BOX.x + BOX.w, 400],
  [RES.x, 400],
  [RES_CX, 400],
  [RES_CX, 240],
  [BRAIN.cx, 240],
  [BRAIN.cx, 400],
];
const LOOP_PERIOD = 96;

export const SC17: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 承接位移：整组从 +60 回到原位（30 帧，不进末拍）
  const camKeys = [
    {f: 4009, x: 580, y: 360, s: 1},
    {f: 4039, x: 640, y: 360, s: 1},
  ];

  // 脑：4136「厨师看到结果之后」一次 flare，4183「继续判断下一步」再一圈脉冲
  const flare = N >= 4136 && N < 4160 ? Math.sin(((N - 4136) / 24) * Math.PI) : 0;
  const brainK = (1 + 0.9 * flare) * off;
  const ring1 = clamp01((N - 4136) / 20);
  const ring2 = clamp01((N - 4183) / 16);

  // 盒：4017「外部程序真正执行动作」21 帧 scaleIn
  const bn = N - 4017;
  const boxS = 0.82 + 0.18 * scaleIn(bn, 21);
  const boxGlowK = clamp01(bn / 12) * off;
  // 盒内扫描线：4020 起每 36 帧一趟；进度条 4022–4070 填满
  const scanOn = N >= 4020;
  const scanY = 298 + 118 * (((N - 4020) % 36) / 35);
  const prog = clamp01((N - 4022) / 48);

  // 结果单子：4082「再把结果递回厨房」
  const rn = N - 4082;

  // 闭环光点：4102 起
  const loopN = N - 4102;
  const dotPos = loopN >= 0 ? polyPoint(LOOP, (loopN % LOOP_PERIOD) / LOOP_PERIOD) : null;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={camKeys}>
        {/* 回程箭头：结果 → 顶部 → 脑（4082 起 20 帧 draw-on） */}
        <PolyArrow pts={[[RES_CX, RES.y], [RES_CX, 240], [BRAIN.cx, 240], [BRAIN.cx, 353]]} p={clamp01((N - 4082) / 20)} color={PURPLE_LIGHT} width={2.5} head={14} />

        {/* 前向箭头：单子 → 盒（4017）、盒 → 结果（4082） */}
        <Svg bloom={false}>
          <LineArrow x0={SLIP.x + SLIP.w + 2} y0={400} x1={BOX.x - 2} y1={400} p={clamp01((N - 4017) / 12)} rodW={2.4} headL={13} headW={17} color={PURPLE_LIGHT} />
          <LineArrow x0={BOX.x + BOX.w + 2} y0={400} x1={RES.x - 2} y1={400} p={clamp01((N - 4082) / 14)} rodW={2.4} headL={13} headW={17} color={PURPLE_LIGHT} />
        </Svg>

        {/* 脑（左端，回程终点） */}
        <GlowBlob cx={BRAIN.cx} cy={BRAIN.cy} r={96} N={N} k={brainK} alpha={0.26} />
        <GlowBlob cx={BRAIN.cx} cy={BRAIN.cy} r={62} N={N} k={brainK} alpha={0.3} />
        <BrainIcon cx={BRAIN.cx} cy={BRAIN.cy} size={BRAIN.size} color={WHITE} accent={PURPLE_LIGHT} />
        <RingPulse cx={BRAIN.cx} cy={BRAIN.cy} p={ring1} r0={40} r1={104} opacity={0.9} />
        <RingPulse cx={BRAIN.cx} cy={BRAIN.cy} p={ring2} r0={40} r1={88} opacity={0.9} />

        {/* 单子（承接 SC15，已填好） */}
        <Slip x={SLIP.x} y={SLIP.y} w={SLIP.w} h={SLIP.h} header="tool_use" stroke={PURPLE_LIGHT} sw={2} glowK={0.45 * off}>
          <ValueBars x={18} y={72} w={SLIP.w - 36} rows={3} gap={22} color={GREY_LIGHT} opacity={0.55} />
        </Slip>

        {/* 主角：外部程序盒 260×180（紫填充 + 白边 + 紫柔光） */}
        {bn >= 0 ? (
          <div style={{position: 'absolute', inset: 0, opacity: softOp(bn, 8), transform: `scale(${boxS.toFixed(4)})`, transformOrigin: `${BOX_CX}px ${BOX_CY}px`}}>
            <Box
              x={BOX.x}
              y={BOX.y}
              w={BOX.w}
              h={BOX.h}
              r={10}
              fill="linear-gradient(180deg, rgba(102,48,248,.62), rgba(90,58,213,.20))"
              stroke={WHITE}
              sw={2}
              glow={glowPurple(boxGlowK)}
            />
            {/* 三个窗口点 */}
            {[0, 1, 2].map((i) => (
              <div key={i} style={{...abs(BOX.x + 16 + i * 12, BOX.y + 16, 6, 6), borderRadius: 3, background: GREY_LIGHT, opacity: 0.7}} />
            ))}
            {/* 盒内扫描线（持续动作） */}
            {scanOn ? <div style={{...abs(BOX.x + 12, scanY, BOX.w - 24, 2), background: PURPLE_LIGHT, opacity: 0.75, boxShadow: '0 0 10px 3px rgba(161,117,241,.55)'}} /> : null}
            {/* your application */}
            <MonoText x={BOX_CX - 96} y={BOX_CY - 13} size={20} color={WHITE} opacity={0.95}>
              your application
            </MonoText>
            {/* 进度条 */}
            <div style={{...abs(BOX.x + 14, BOX.y + BOX.h - 20, BOX.w - 28, 4), background: GREY_LINE, opacity: 0.8, borderRadius: 2}} />
            <div style={{...abs(BOX.x + 14, BOX.y + BOX.h - 20, (BOX.w - 28) * prog, 4), background: WHITE, opacity: 0.9, borderRadius: 2}} />
          </div>
        ) : null}

        {/* 结果单子（唯一 GlitchIn：tool_result） */}
        {rn >= 0 ? (
          <GlitchIn N={N} f0={4082} rgbSplit={4} slices={5} seed={17}>
            <div style={{position: 'absolute', inset: 0, opacity: softOp(rn, 6)}}>
              <GlowBlob cx={RES_CX} cy={RES.y + RES.h / 2} r={150} N={N} k={0.5 * off} alpha={0.16} />
              <Slip x={RES.x} y={RES.y} w={RES.w} h={RES.h} header="tool_result" stroke={PURPLE_LIGHT} sw={2} glowK={0.35 * off}>
                <ValueBars x={18} y={64} w={RES.w - 36} rows={3} gap={22} color={GREY_LIGHT} opacity={0.55} />
              </Slip>
            </div>
          </GlitchIn>
        ) : null}

        {/* 三个标签（对象下方同一基线） */}
        <MiniLabel cx={SLIP.x + SLIP.w / 2} cy={510} text="单子" size={24} color="#A0A0A1" />
        <MiniLabel cx={BOX_CX} cy={510} text="外部程序" size={24} color="#A0A0A1" opacity={softOp(bn, 10)} />
        <MiniLabel cx={RES_CX} cy={510} text="结果" size={24} color="#A0A0A1" opacity={softOp(rn, 10)} />

        {/* 闭环光点：单子→盒→结果→脑 */}
        {dotPos ? (
          <>
            <div style={{...abs(dotPos[0] - 3, dotPos[1] - 3, 6, 6), borderRadius: 3, background: WHITE, boxShadow: '0 0 12px 4px rgba(102,45,248,.85)'}} />
            <div style={{...abs(dotPos[0] - 7, dotPos[1] - 7, 14, 14), borderRadius: 7, border: `1px solid ${PURPLE_LIGHT}`, opacity: 0.45}} />
          </>
        ) : null}
      </CameraRig>
    </div>
  );
};
