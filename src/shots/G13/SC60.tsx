import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CrateIcon} from '../../icons';
import {GREY_LIGHT, GREY_LINE, GREY_MID, PURPLE_LIGHT, RED_DEEP, Svg, WHITE, abs, exitOp, glowOffK, mixHex, scaleIn, softOp} from '../../ui';
import {FONT_HEAVY, FONT_TECH, clamp01} from '../../common';
import {FIVE, OuterPanel, RoleRow} from './parts';

/**
 * SC60 一行补上｜14826–15061（236 帧）
 * 第三行从空位补上「怎么一次获得一组能力 → Plugin」（14834 落位 / 14879 亮 Plugin）。
 * 14920「所以」：左侧清单与右侧面板向两侧淡出，画面中央出现两个被划掉的等式：
 *   Agent = 一颗大脑（14939 出现，11 帧 fadeIn，14950–14962 红斜线）
 *   Agent = 一个工具（14998 出现，15004–15014 红斜线）
 * 持续：两个等式缓慢下沉 8px（14962–15014），之后完全落定。
 * 停留：15014 → 15053 离场（39 帧）。红斜线，无紫光。
 */
const F0 = 14826;
const TO = 15061;

const EQ = {y1: 286, y2: 432, x0: 250, w: 780};

/** 一个被红斜线划掉的等式：Agent = 一颗大脑 / 一个工具（等号画成两条横杠，任何字号下都不糊） */
const Equation: React.FC<{cy: number; cn: string; op: number; slashP: number; dead: number; sink: number}> = ({cy, cn, op, slashP, dead, sink}) => {
  const y = cy + sink;
  const cCn = mixHex(WHITE, GREY_MID, dead);
  const cEq = mixHex(WHITE, GREY_MID, dead * 0.9);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      <div style={{position: 'absolute', left: EQ.x0, top: y - 60, width: EQ.w, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28}}>
        <span style={{fontFamily: FONT_TECH, fontStyle: 'italic', fontWeight: 600, fontSize: 64, lineHeight: 1, letterSpacing: 1, color: cEq}}>Agent</span>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{width: 42, height: 7, borderRadius: 4, background: cEq}} />
          <div style={{width: 42, height: 7, borderRadius: 4, background: cEq}} />
        </div>
        <span style={{fontFamily: FONT_HEAVY, fontWeight: 800, fontSize: 96, lineHeight: 1, letterSpacing: 2, color: cCn, whiteSpace: 'nowrap'}}>{cn}</span>
      </div>
      {slashP > 0 ? (
        <Svg bloom={false}>
          <line x1={306} y1={y + 44} x2={974} y2={y - 38} stroke={RED_DEEP} strokeWidth={8} strokeLinecap="round" strokeDasharray="700" strokeDashoffset={700 * (1 - slashP)} />
          <line x1={312} y1={y + 39} x2={968} y2={y - 33} stroke="#FF3B4E" strokeWidth={2.4} strokeLinecap="round" strokeDasharray="690" strokeDashoffset={690 * (1 - slashP)} opacity={0.55} />
        </Svg>
      ) : null}
    </div>
  );
};

export const SC60: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 上下文（左清单 + 右面板）：14920「所以」向两侧淡出，把画面交给等式
  const ctxDim = clamp01((N - 14920) / 16);
  const ctxOp = 1 - ctxDim;
  const listShift = -570 - 40 * ctxDim;
  const panelShift = -20 + 50 * ctxDim;

  // 第三行补上
  const row3K = scaleIn(N - 14834, 20);
  const pluginOp = softOp(N - 14879, 10);
  const lit3 = clamp01((N - 14879) / 10) * (1 - clamp01((N - 14920) / 10)) * off;

  // 两个等式
  const eq1Op = softOp(N - 14939, 11);
  const eq1Dead = clamp01((N - 14950) / 14);
  const eq1Slash = clamp01((N - 14950) / 12);
  const eq2Op = softOp(N - 14998, 6);
  const eq2Dead = clamp01((N - 15004) / 12);
  const eq2Slash = clamp01((N - 15004) / 10);
  const sink = 8 * clamp01((N - 14962) / 52);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* ---- 左侧五行清单（SC59 收势的落点，继续缩小停在一旁） ---- */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.86 * ctxOp,
          transform: `translateX(${listShift.toFixed(2)}px) scale(0.62)`,
          transformOrigin: '900px 402px',
        }}
      >
        {(['brain', 'tool', 'skill', 'memory', 'role'] as const).map((k, i) => (
          <RoleRow key={k} kind={k} top={FIVE.rows[i]} lit={0} clauseOp={0} showClause={false} />
        ))}
      </div>

      {/* ---- 右侧外圈面板：第三行补 Plugin ---- */}
      <div style={{position: 'absolute', inset: 0, opacity: ctxOp, transform: `translateX(${panelShift.toFixed(2)}px)`}}>
        <OuterPanel N={N} row1K={1} row2K={1} mcpLit={0} cmdLit={0} hookLit={0}>
          {/* 空位：随第三行入场退掉 */}
          <div style={{position: 'absolute', inset: 0, opacity: 0.55 * (1 - row3K)}}>
            <div style={{...abs(614, 432, 532, 80), boxSizing: 'border-box', border: `1.5px dashed ${GREY_LINE}`, borderRadius: 10}} />
          </div>
          {/* 第三行：怎么一次获得一组能力 → Plugin */}
          <div style={{position: 'absolute', inset: 0, opacity: row3K, transform: `translateY(${((1 - row3K) * 40).toFixed(2)}px)`}}>
            <CrateIcon cx={636} cy={472} size={52} color={mixHex(GREY_LIGHT, PURPLE_LIGHT, lit3)} accent={mixHex(GREY_LIGHT, PURPLE_LIGHT, lit3)} />
            <div style={{...abs(668, 458, 290, 28), fontFamily: FONT_HEAVY, fontWeight: 700, fontSize: 28, lineHeight: '28px', color: mixHex(GREY_LIGHT, PURPLE_LIGHT, lit3 * 0.95), whiteSpace: 'nowrap'}}>怎么一次获得一组能力</div>
            <div style={{position: 'absolute', left: 1042, top: 472, transform: 'translate(-50%,-50%)', opacity: pluginOp}}>
              <div style={{fontFamily: FONT_TECH, fontStyle: 'italic', fontWeight: 600, fontSize: 32, lineHeight: 1, letterSpacing: 1, color: mixHex(GREY_LIGHT, PURPLE_LIGHT, lit3), textShadow: lit3 > 0.05 ? '0 0 10px rgba(161,117,241,.8)' : undefined}}>Plugin</div>
            </div>
          </div>
        </OuterPanel>
      </div>

      {/* ---- 两个被划掉的等式（画面中央） ---- */}
      <Equation cy={EQ.y1} cn="一颗大脑" op={eq1Op} slashP={eq1Slash} dead={eq1Dead} sink={sink} />
      <Equation cy={EQ.y2} cn="一个工具" op={eq2Op} slashP={eq2Slash} dead={eq2Dead} sink={sink} />
    </div>
  );
};
