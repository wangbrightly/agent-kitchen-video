import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GlowBlob, type CamKey} from '../../fx';
import {BrainIcon, CardBoxIcon, ChefIcon, KnifeIcon, SheetIcon} from '../../icons';
import {CText, PURPLE, PURPLE_LIGHT, WHITE, GREY, GREY_MID, SoftIn, Svg, TechText, abs, exitOp, firstOp, glowOffK, mixHex, scaleIn, softOp} from '../../ui';
import {FONT_HEAVY, FONT_WIDE, clamp01, powOutRemain} from '../../common';
import {MiniLabel, PulseRing, StickyNoteIcon, polyPoint} from './parts';

/**
 * SC05 整个人才是 Agent｜1099–1426｜「他还有一个名字，叫 Agent。他有大脑，有手，有记性，有菜谱，有岗位职责。
 * 但整个人的经验、判断、手上的动作，才组成一个 Agent。」
 * 主角：厨师 ChefIcon 280（唯一大体积主体，紫柔光）。
 * 配角：五枚 64px 小图标（大脑 / 手 / 记性 / 菜谱 / 岗位职责）+ 22px 灰标签 + 回路虚线 + 循环光点；
 *       顶部 Agent 72px（白色技术字，不发光）+ 灰色「智能体」；底部「LLM = 大脑」44px。
 * 持续动作：一圈回路光点 160 帧转一圈；五枚图标依次灰→紫（11 帧），点亮时厨师对应部位闪紫环。
 * 运镜：1105 起 33 帧推近 1.0→1.06（1138 结束，之后不动）。
 */
const F0 = 1099;
const TO = 1426;

const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 1105, x: 640, y: 360, s: 1},
  {f: 1138, x: 640, y: 360, s: 1.06},
  {f: TO, x: 640, y: 360, s: 1.06},
];

// 五个部位：图标位置、标签、入场帧（S14 块首 1204 的 −6…+2 内，2 帧错峰）、点亮帧、厨师身上对应点与环半径
const ITEMS = [
  {key: 'brain', cx: 300, cy: 300, label: '大脑', entry: 1198, lit: 1204, at: [640, 272] as [number, number], r: 36},
  {key: 'knife', cx: 300, cy: 470, label: '手', entry: 1200, lit: 1221, at: [718, 415] as [number, number], r: 22},
  {key: 'note', cx: 980, cy: 230, label: '记性', entry: 1202, lit: 1232, at: [610, 272] as [number, number], r: 22},
  {key: 'card', cx: 980, cy: 370, label: '菜谱', entry: 1204, lit: 1256, at: [562, 415] as [number, number], r: 22},
  {key: 'sheet', cx: 980, cy: 510, label: '岗位职责', entry: 1206, lit: 1285, at: [640, 367] as [number, number], r: 34},
];

// 回路：脑 → 记性 → 菜谱 → 岗位职责 → 手 → 回脑（闭合）；最后一段从厨师身后穿过
const LOOP: Array<[number, number]> = [
  [300, 300],
  [980, 230],
  [980, 370],
  [980, 510],
  [300, 470],
];

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;

  const chefN = N - 1105;
  const chefS = 0.9 + 0.1 * scaleIn(chefN, 21);
  const off = glowOffK(N, TO, 6, 8);
  const chefGlow = clamp01((N - 1103) / 10) * off;

  const loopOp = softOp(N - 1198, 14) * 0.4;
  const dotT = ((N - 1204) % 160) / 160;
  const [dotX, dotY] = polyPoint(LOOP, dotT);

  const eqN = N - 1340;
  const eqDy = 40 * powOutRemain(eqN, 20, 2.5);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        {/* 回路虚线（先画，压在图标/厨师下方） */}
        <Svg bloom={false} opacity={loopOp}>
          <polygon points={LOOP.map((p) => p.join(',')).join(' ')} fill="none" stroke={GREY_MID} strokeWidth={1.2} strokeDasharray="7 7" />
        </Svg>
        {/* 循环光点：160 帧一圈 */}
        {N >= 1204 && (
          <div style={{...abs(dotX - 3.5, dotY - 3.5, 7, 7), borderRadius: 4, background: PURPLE_LIGHT, boxShadow: '0 0 10px 3px rgba(102,45,248,.75)'}} />
        )}

        {/* 五枚小图标 + 标签（依次灰→紫） */}
        {ITEMS.map((it) => {
          const en = N - it.entry;
          if (en < 0) return null;
          const op = softOp(en, 8);
          const dy = 14 * powOutRemain(en, 14, 2.5);
          const litK = clamp01((N - it.lit) / 11);
          const iconColor = mixHex(GREY_MID, PURPLE_LIGHT, litK);
          const labelColor = mixHex(GREY, WHITE, litK);
          // 点亮后 15 帧的短辉光（一帧内最多一处）
          const gp = N - it.lit;
          const glowK = gp >= 0 && gp < 15 ? (gp < 5 ? gp / 5 : gp < 8 ? 1 : 1 - (gp - 8) / 7) : 0;
          return (
            <React.Fragment key={it.key}>
              {glowK > 0 && <GlowBlob cx={it.cx} cy={it.cy} r={54} k={glowK} alpha={0.4} />}
              <div style={{position: 'absolute', inset: 0, opacity: op, transform: `translateY(${dy.toFixed(2)}px)`}}>
                {it.key === 'brain' && <BrainIcon cx={it.cx} cy={it.cy} size={64} color={iconColor} accent={iconColor} />}
                {it.key === 'knife' && <KnifeIcon cx={it.cx} cy={it.cy} size={64} color={iconColor} accent={iconColor} />}
                {it.key === 'note' && <StickyNoteIcon cx={it.cx} cy={it.cy} size={64} color={iconColor} accent={iconColor} />}
                {it.key === 'card' && <CardBoxIcon cx={it.cx} cy={it.cy} size={64} color={iconColor} accent={iconColor} />}
                {it.key === 'sheet' && <SheetIcon cx={it.cx} cy={it.cy} size={64} color={iconColor} accent={iconColor} />}
                <MiniLabel cx={it.cx} cy={it.cy + 48} text={it.label} color={labelColor} opacity={1} />
              </div>
            </React.Fragment>
          );
        })}

        {/* 主角：厨师 280（紫柔光） */}
        <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - F0, 8), transform: `scale(${chefS.toFixed(3)})`, transformOrigin: '640px 370px'}}>
          <GlowBlob cx={640} cy={370} r={230} N={N} k={chefGlow} alpha={0.22} />
          <GlowBlob cx={640} cy={370} r={160} N={N} k={chefGlow} alpha={0.26} />
          <ChefIcon cx={640} cy={370} size={280} color={WHITE} accent={PURPLE} />
        </div>

        {/* 点亮时厨师对应部位的脉冲环 */}
        {ITEMS.map((it) => {
          const p = (N - it.lit) / 12;
          return p > 0 && p < 1 ? <PulseRing key={it.key} cx={it.at[0]} cy={it.at[1]} p={p} r={it.r} /> : null;
        })}

        {/* 顶部：Agent / 智能体 */}
        <SoftIn N={N} f0={1141} len={10} dy={12}>
          <TechText cx={640} cy={166} text="Agent" fontSize={72} color={WHITE} glow={false} scaleX={0.95} letterSpacing={2} />
        </SoftIn>
        <SoftIn N={N} f0={1174} len={10} dy={10}>
          <CText cx={640} cy={214} size={26} weight={500} color={GREY} letterSpacing={3}>
            智能体
          </CText>
        </SoftIn>

        {/* 底部落点：LLM = 大脑（1360 落位，与分镜一致；1340 起入场对齐 S15 块首） */}
        {eqN >= 0 && (
          <div
            style={{
              position: 'absolute',
              left: 640,
              top: 565,
              opacity: softOp(eqN, 10),
              transform: `translate(-50%,-50%) translateY(${eqDy.toFixed(2)}px)`,
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{fontFamily: FONT_WIDE, fontSize: 44, color: PURPLE_LIGHT, letterSpacing: 1}}>LLM</span>
            <span style={{fontFamily: FONT_HEAVY, fontSize: 36, fontWeight: 400, color: WHITE}}>=</span>
            <span style={{fontFamily: FONT_HEAVY, fontSize: 44, fontWeight: 800, color: WHITE, letterSpacing: 2}}>大脑</span>
          </div>
        )}
      </CameraRig>
    </div>
  );
};
