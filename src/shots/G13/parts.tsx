import React from 'react';
import {BrainIcon, CardBoxIcon, KnifeIcon, SheetIcon, SocketIcon} from '../../icons';
import {KITCHEN, HandIcon, StickyNoteIcon} from '../G1/parts';
import {Box, GLOW_PURPLE, GREY, GREY_LIGHT, GREY_LINE, GREY_MID, PURPLE, PURPLE_LIGHT, Svg, WHITE, abs, mixHex} from '../../ui';
import {FONT_HEAVY, FONT_TECH, FONT_WIDE, clamp01} from '../../common';

/**
 * G13（SC58–SC62，第 7 章收尾）共用小零件。
 * 五行的图标复用 icons.tsx / G1 parts 的整枚图元；厨房坐标直接 import G1 的 KITCHEN（全片唯一空间基准）。
 * 这里只补：五行行组件、紫描边厨房地图（SC62 回扣 SC01 用）、五图标系统环（SC61 主环 / SC62 左上角缩略环）。
 */

export {KITCHEN};

export const ROLES = [
  {key: 'brain', name: '大脑', clause: '负责思考'},
  {key: 'tool', name: '工具', clause: '负责行动'},
  {key: 'skill', name: '技能', clause: '负责遵循流程'},
  {key: 'memory', name: '记忆', clause: '负责保留信息'},
  {key: 'role', name: '岗位', clause: '负责规定身份和边界'},
] as const;
export type RoleKey = (typeof ROLES)[number]['key'];

/** 每行左侧的小图标（整枚图元，不能局部改） */
export const RoleIcon: React.FC<{kind: RoleKey; cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number}> = ({
  kind,
  cx,
  cy,
  size = 62,
  color = WHITE,
  accent = PURPLE,
  opacity = 1,
}) => {
  if (kind === 'brain') return <BrainIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  if (kind === 'tool') return <KnifeIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  if (kind === 'skill') return <CardBoxIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  if (kind === 'memory') return <StickyNoteIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  return <SheetIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
};

// ---- SC58/SC59 五行清单的版式基准（与 G12 SC57 的清单逐数对齐：620×64 行框，行距 76）----
export const FIVE = {
  x: 590,
  w: 620,
  h: 64,
  rows: [250, 326, 402, 478, 554],
  spineX: 566, // 行框左侧的竖线（SC57 花括号的竖干位置）
  iconX: 640,
  nameX: 720,
  clauseX: 800,
  spineTop: 250,
  spineBottom: 554,
};

/**
 * 一行职责：行框 + 左侧竖条 + 图标 + 名称 + 「负责…」。
 * lit 0→1 = 当前重点（紫框 + 紫光 + 紫字）；其余行灰框。
 * SC57 的首行是紫框，所以承接过来的第一帧完全对得上。
 */
export const RoleRow: React.FC<{
  kind: RoleKey;
  top: number;
  lit?: number;
  opacity?: number;
  clauseOp?: number;
  offsetY?: number;
  showClause?: boolean;
}> = ({kind, top, lit = 0, opacity = 1, clauseOp = 1, offsetY = 0, showClause = true}) => {
  const role = ROLES.find((r) => r.key === kind)!;
  const k = clamp01(lit);
  const cIcon = mixHex(GREY_LIGHT, WHITE, 0.55 + 0.45 * k);
  const cAccent = mixHex(GREY_LIGHT, PURPLE_LIGHT, k);
  const cName = mixHex(GREY_LIGHT, PURPLE_LIGHT, k);
  const cClause = mixHex(GREY, PURPLE_LIGHT, k * 0.7);
  return (
    <div style={{position: 'absolute', inset: 0, opacity, transform: `translateY(${offsetY.toFixed(2)}px)`}}>
      {/* 行框：当前行紫框 + 紫光，其余灰框 */}
      <div
        style={{
          ...abs(FIVE.x, top - FIVE.h / 2, FIVE.w, FIVE.h),
          boxSizing: 'border-box',
          borderRadius: 10,
          background: k > 0.02 ? `rgba(48,22,110,${(0.55 * k).toFixed(3)})` : 'transparent',
          border: `1.6px solid ${mixHex(GREY_LINE, PURPLE_LIGHT, k)}`,
          boxShadow: k > 0.02 ? GLOW_PURPLE : undefined,
        }}
      />
      <div style={{...abs(FIVE.x + 14, top - 20, 4, 40), borderRadius: 2, background: PURPLE, opacity: 0.22 + 0.78 * k}} />
      <RoleIcon kind={kind} cx={FIVE.iconX} cy={top} size={70} color={cIcon} accent={cAccent} />
      <div style={{...abs(FIVE.nameX - 120, top - 21, 240, 42), textAlign: 'center', fontFamily: FONT_HEAVY, fontWeight: 800, fontSize: 42, lineHeight: '42px', letterSpacing: 2, color: cName, whiteSpace: 'nowrap'}}>
        {role.name}
      </div>
      <div style={{position: 'absolute', left: FIVE.nameX + 58, top: top - 3, width: 6, height: 6, borderRadius: 3, background: mixHex(GREY_LINE, PURPLE_LIGHT, k), opacity: 0.85}} />
      {showClause ? (
        <div style={{...abs(FIVE.clauseX, top - 15, 380, 30), opacity: clauseOp, fontFamily: FONT_HEAVY, fontWeight: 600, fontSize: 30, lineHeight: '30px', letterSpacing: 2, color: cClause, whiteSpace: 'nowrap'}}>
          {role.clause}
        </div>
      ) : null}
    </div>
  );
};

/** 未填的行：SC57 留下的灰色虚线占位条（填上后 8 帧退掉） */
export const RoleSlot: React.FC<{top: number; opacity?: number}> = ({top, opacity = 1}) => (
  <div style={{position: 'absolute', inset: 0, opacity}}>
    <div style={{...abs(FIVE.x, top - FIVE.h / 2, FIVE.w, FIVE.h), boxSizing: 'border-box', border: `1px dashed ${GREY_MID}`, borderRadius: 10}}>
      <div style={{...abs(22, 6, 52, 52), boxSizing: 'border-box', border: `1px dashed ${GREY_MID}`, borderRadius: 6}} />
      <div style={{...abs(96, 28, 180, 8), borderRadius: 4, background: GREY_LINE}} />
    </div>
  </div>
);

// ---- SC62：紫描边厨房地图（坐标与 G1 KITCHEN 完全一致）----
/**
 * 九处紫描边：0 冰箱 / 1 墙带 / 2 插座板 / 3 工具杆 / 4 烟感 / 5 台面线 / 6 菜谱盒 / 7 铜铃 / 8 木箱。
 * flash(i) 0→1 把该处描边提亮到白（「依次闪一次」）。全部 PURPLE_LIGHT 细线，厨师另画。
 */
export const PurpleKitchenMap: React.FC<{opacity: number; dashN: number; flash: (i: number) => number}> = ({opacity, dashN, flash}) => {
  const {fridge, wall, counterY, counterFrontY, crate} = KITCHEN;
  const P = (i: number, w = 1.7) => ({stroke: mixHex(PURPLE_LIGHT, WHITE, flash(i)), strokeWidth: w + 1.5 * flash(i)});
  return (
    <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity}}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* 0 冰箱 */}
        <g {...P(0)}>
          <rect x={fridge.x} y={fridge.y} width={fridge.w} height={fridge.h} rx={6} />
          <path d={`M${fridge.x} ${fridge.y + 130}H${fridge.x + fridge.w}`} />
          <path d={`M${fridge.x + fridge.w - 14} ${fridge.y + 62}V${fridge.y + 104}`} strokeWidth={2.6} />
          <path d={`M${fridge.x + 10} ${fridge.y + 60}H${fridge.x + 46}`} opacity={0.75} />
        </g>

        {/* 1 墙带 */}
        <g {...P(1)}>
          <rect x={wall.x} y={wall.y} width={wall.w} height={wall.h} rx={8} strokeDasharray="26 18" strokeDashoffset={-dashN * 1.1} />
          <path d={`M${wall.x} ${wall.y + wall.h}H${wall.x + wall.w}`} strokeDasharray="4 12" strokeDashoffset={dashN * 0.7} opacity={0.75} />
          {[280, 700, 1120].map((x) => (
            <path key={x} d={`M${x} ${wall.y}V${wall.y + 12}`} strokeWidth={2.2} />
          ))}
        </g>

        {/* 2 插座板 x300–420 y250–340 */}
        <g {...P(2)}>
          <rect x={300} y={250} width={120} height={90} rx={6} />
          {[330, 360, 390].map((x) => (
            <g key={x}>
              <circle cx={x} cy={292} r={10} />
              <circle cx={x} cy={292} r={2.4} fill={mixHex(PURPLE_LIGHT, WHITE, flash(2))} stroke="none" />
            </g>
          ))}
          <rect x={302} y={316} width={116} height={6} rx={3} />
          <path d={`M360 340V348`} strokeWidth={2.2} />
        </g>

        {/* 3 工具杆 x520–680 y250–300 */}
        <g {...P(3)}>
          <path d="M524 262H676" strokeWidth={2.4} />
          <path d="M524 278H676" opacity={0.7} />
          {[548, 572, 596, 620, 644].map((x) => (
            <path key={x} d={`M${x} 262V272`} strokeWidth={2} />
          ))}
          {/* 挂着的刀 + 勺 */}
          <path d="M548 286l28-12c4-2 7 2 5 6l-24 12z" />
          <path d="M600 274v10" strokeWidth={2.2} />
          <path d="M600 284a5 5 0 1 0 10 0" />
        </g>

        {/* 4 烟感 x1010–1120 y240–340 */}
        <g {...P(4)}>
          <rect x={1022} y={240} width={86} height={58} rx={5} />
          <circle cx={1065} cy={268} r={17} />
          <path d="M1065 268l9-8" strokeWidth={2.2} />
          <path d="M1052 240c0-10 6-14 13-14s13 4 13 14" />
          <path d="M1065 298v30" strokeWidth={2.4} />
          <circle cx={1065} cy={332} r={5.5} />
        </g>

        {/* 5 台面线 + 前沿带 */}
        <g {...P(5)}>
          <path d={`M190 ${counterY}H1200`} strokeWidth={2.1} />
          <path d={`M210 ${counterFrontY}H1180`} strokeDasharray="6 9" opacity={0.9} />
          {[250, 390, 530, 670, 810, 950, 1090].map((x) => (
            <path key={x} d={`M${x} ${counterY}V${counterFrontY}`} strokeWidth={1.4} opacity={0.6} />
          ))}
        </g>

        {/* 6 菜谱盒 x320–450 y395–470 */}
        <g {...P(6)}>
          {[334, 358, 382, 406].map((x, i) => (
            <g key={x}>
              <rect x={x} y={i % 2 === 0 ? 398 : 402} width={16} height={26} />
              <rect x={x + 2} y={i % 2 === 0 ? 394 : 398} width={12} height={6} />
            </g>
          ))}
          <rect x={320} y={424} width={130} height={46} rx={4} />
          <path d="M332 438H438M332 450H414" strokeWidth={1.8} />
        </g>

        {/* 7 铜铃 x880–980 y395–470 */}
        <g {...P(7)}>
          <ellipse cx={930} cy={462} rx={38} ry={7} />
          <path d="M892 460c0-28 14-46 38-46s38 18 38 46" />
          <path d="M906 460c0-20 8-32 24-36" opacity={0.7} />
          <path d="M930 414v-11" strokeWidth={2.4} />
          <circle cx={930} cy={401} r={7} />
        </g>

        {/* 8 木箱 x1050–1180 y515–620 */}
        <g {...P(8)}>
          <rect x={crate.x} y={crate.y} width={crate.w} height={crate.h} />
          <path d={`M${crate.x} ${crate.y + 18}H${crate.x + crate.w}`} />
          <path d={`M${crate.x} ${crate.y}L${crate.x + crate.w} ${crate.y + crate.h}M${crate.x + crate.w} ${crate.y}L${crate.x} ${crate.y + crate.h}`} opacity={0.85} />
          <path d={`M${crate.x} ${crate.y}L${crate.x - 8} ${crate.y - 10}H${crate.x + crate.w - 8}L${crate.x + crate.w} ${crate.y}`} />
        </g>
      </g>
    </svg>
  );
};

/** 小胶囊（Command / Hook）：描边与文字随当前重点灰→紫 */
export const Chip: React.FC<{x: number; y: number; w: number; h: number; text: string; lit: number; opacity?: number}> = ({x, y, w, h, text, lit, opacity = 1}) => (
  <div style={{...abs(x, y, w, h), opacity}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: h / 2,
        boxSizing: 'border-box',
        border: `1.8px solid ${mixHex(GREY_LINE, PURPLE_LIGHT, lit)}`,
        background: lit > 0.5 ? 'rgba(102,45,248,0.18)' : 'rgba(0,0,0,0.5)',
        boxShadow: lit > 0.02 ? `0 0 18px 4px rgba(102,45,248,${(0.28 * lit).toFixed(3)})` : undefined,
      }}
    />
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_TECH, fontStyle: 'italic', fontWeight: 600, fontSize: 24, lineHeight: 1, letterSpacing: 0.5, color: mixHex(GREY_LIGHT, WHITE, lit), transform: 'scaleX(0.9)'}}>
      {text}
    </div>
  </div>
);

/**
 * SC59 / SC60 的外圈面板（运镜前坐标，外层自行 translateX 抵消相机）。
 * 行 1 MCP（插座 → 厨师手的循环光点，整段连续） / 行 2 Command + Hook / 行 3 由 children 填。
 * row1K / row2K = 入场进度 0→1；mcpLit / cmdLit / hookLit = 当前重点（同一时刻只有一处紫）。
 */
export const OuterPanel: React.FC<{
  N: number;
  row1K?: number;
  row2K?: number;
  mcpLit?: number;
  cmdLit?: number;
  hookLit?: number;
  children?: React.ReactNode;
}> = ({N, row1K = 1, row2K = 1, mcpLit = 0, cmdLit = 0, hookLit = 0, children}) => {
  const k1 = clamp01(row1K);
  const k2 = clamp01(row2K);
  // 插座 → 手：54 帧一趟的循环光点（SC59 14625 起跑，SC60 继续用同一相位）
  const dotN = N - 14625;
  const dotT = dotN < 0 ? 0 : (dotN % 54) / 54;
  const dotX = 662 + 412 * dotT;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Box x={600} y={196} w={560} h={340} r={16} fill="rgba(0,0,0,0.34)" stroke={GREY_LINE} sw={1.3} />
      <div style={{...abs(616, 306, 528, 1), background: GREY_LINE, opacity: 0.55}} />
      <div style={{...abs(616, 416, 528, 1), background: GREY_LINE, opacity: 0.55}} />

      {/* 行 1：MCP → 手从哪里接进来 */}
      <div style={{position: 'absolute', inset: 0, opacity: k1, transform: `translateY(${((1 - k1) * 40).toFixed(2)}px) scale(${(0.9 + 0.1 * k1).toFixed(4)})`, transformOrigin: '880px 252px'}}>
        <SocketIcon cx={636} cy={252} size={54} color={mixHex(GREY_LIGHT, PURPLE_LIGHT, mcpLit)} accent={mixHex(GREY_LIGHT, PURPLE_LIGHT, mcpLit)} />
        <div style={{...abs(674, 238, 300, 30), fontFamily: FONT_HEAVY, fontWeight: 700, fontSize: 30, lineHeight: '30px', color: mixHex(GREY_LIGHT, PURPLE_LIGHT, mcpLit), whiteSpace: 'nowrap'}}>手从哪里接进来</div>
        <div style={{position: 'absolute', left: 990, top: 252, transform: 'translate(-50%,-50%)'}}>
          <div style={{fontFamily: FONT_TECH, fontStyle: 'italic', fontWeight: 600, fontSize: 34, lineHeight: 1, letterSpacing: 1, color: mixHex(GREY_LIGHT, PURPLE_LIGHT, mcpLit), textShadow: mcpLit > 0.05 ? '0 0 10px rgba(161,117,241,.8)' : undefined}}>MCP</div>
        </div>
        <HandIcon cx={1104} cy={250} size={58} color={mixHex(GREY_LIGHT, PURPLE_LIGHT, mcpLit)} dashed={false} />
        <Svg bloom={false}>
          <line x1={662} y1={287} x2={1074} y2={287} stroke={mixHex(GREY_LINE, PURPLE_LIGHT, 0.5)} strokeWidth={1.6} strokeDasharray="5 7" />
        </Svg>
        {dotN >= 0 ? (
          <>
            <div style={{position: 'absolute', left: dotX - 4.5, top: 282.5, width: 9, height: 9, borderRadius: 5, background: WHITE, boxShadow: '0 0 12px 4px rgba(102,45,248,.85)'}} />
            <div style={{position: 'absolute', left: dotX - 22.5, top: 284, width: 6, height: 6, borderRadius: 3, background: PURPLE_LIGHT, opacity: 0.45}} />
          </>
        ) : null}
      </div>

      {/* 行 2：谁来启动任务（人按 Command / 机器触发 Hook） */}
      <div style={{position: 'absolute', inset: 0, opacity: k2, transform: `translateY(${((1 - k2) * 34).toFixed(2)}px)`}}>
        <div style={{...abs(634, 347, 210, 30), fontFamily: FONT_HEAVY, fontWeight: 700, fontSize: 30, lineHeight: '30px', color: mixHex(GREY_LIGHT, PURPLE_LIGHT, Math.max(cmdLit, hookLit)), whiteSpace: 'nowrap'}}>谁来启动任务</div>
        <div style={{...abs(790, 331, 116, 24), textAlign: 'right', fontFamily: FONT_HEAVY, fontWeight: 600, fontSize: 22, lineHeight: '24px', color: GREY, whiteSpace: 'nowrap'}}>人按</div>
        <Chip x={914} y={320} w={160} h={38} text="Command" lit={cmdLit} />
        <div style={{...abs(790, 372, 116, 24), textAlign: 'right', fontFamily: FONT_HEAVY, fontWeight: 600, fontSize: 22, lineHeight: '24px', color: GREY, whiteSpace: 'nowrap'}}>机器触发</div>
        <Chip x={914} y={363} w={110} h={38} text="Hook" lit={hookLit} />
      </div>

      {children}
    </div>
  );
};

// ---- 系统环：五个概念（左上 Brain / 右上 Knife，其余沿环均布）----
export const RING_SLOTS: Array<{kind: RoleKey; angle: number}> = [
  {kind: 'brain', angle: 144},
  {kind: 'tool', angle: 72},
  {kind: 'skill', angle: 0},
  {kind: 'memory', angle: 216},
  {kind: 'role', angle: 288},
];

export const ringPos = (cx: number, cy: number, r: number, angle: number): [number, number] => [
  cx + r * Math.cos((angle * Math.PI) / 180),
  cy - r * Math.sin((angle * Math.PI) / 180),
];

/**
 * 缩略系统环（SC62 左上角）：环 + 五图标 + 环心 Agent。
 * ringP = 环 draw-on 进度（SC62 从 1 开始，是 SC61 的承接）；
 * orbitN 给定绝对帧号时，环上三枚光点按 SC61 的相位继续循环（切镜不断）。
 */
export const MiniRing: React.FC<{
  cx: number;
  cy: number;
  r: number;
  iconSize: number;
  agentSize: number;
  ringP?: number;
  opacity?: number;
  orbitN?: number;
  lit?: Partial<Record<RoleKey, number>>;
}> = ({cx, cy, r, iconSize, agentSize, ringP = 1, opacity = 1, orbitN, lit = {}}) => {
  const C = 2 * Math.PI * r;
  const orbitT = orbitN === undefined ? null : (orbitN - 15166) / 72;
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={PURPLE_LIGHT}
          strokeWidth={Math.max(1.4, r * 0.017)}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - clamp01(ringP))}
          style={{filter: 'drop-shadow(0 0 8px rgba(102,45,248,.8))'}}
        />
      </svg>
      {orbitT === null
        ? null
        : [0, 1 / 3, 2 / 3].map((ph) => {
            const [x, y] = ringPos(cx, cy, r, -90 + 360 * (((orbitT + ph) % 1 + 1) % 1));
            return <div key={ph} style={{position: 'absolute', left: x - Math.max(2, r * 0.021), top: y - Math.max(2, r * 0.021), width: Math.max(4, r * 0.042), height: Math.max(4, r * 0.042), borderRadius: 9, background: WHITE, boxShadow: '0 0 12px 4px rgba(102,45,248,.85)'}} />;
          })}
      {RING_SLOTS.map((s) => {
        const [x, y] = ringPos(cx, cy, r, s.angle);
        const k = clamp01(lit[s.kind] ?? 0);
        const c = mixHex(WHITE, PURPLE_LIGHT, k);
        return <RoleIcon key={s.kind} kind={s.kind} cx={x} cy={y} size={iconSize * (1 + 0.12 * k)} color={c} accent={k > 0.05 ? PURPLE_LIGHT : WHITE} />;
      })}
      <div style={{position: 'absolute', left: cx, top: cy, transform: 'translate(-50%,-50%)', fontFamily: FONT_WIDE, fontWeight: 400, fontSize: agentSize, lineHeight: 1, color: WHITE, letterSpacing: agentSize > 40 ? 2 : 1, whiteSpace: 'nowrap', textShadow: `3px 3px 0 ${PURPLE}, 0 0 28px rgba(102,45,248,.55)`}}>
        Agent
      </div>
    </div>
  );
};
