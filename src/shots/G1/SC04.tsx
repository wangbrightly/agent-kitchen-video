import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {BrainIcon, FridgeIcon, KnifeIcon} from '../../icons';
import {Box, Cross, PURPLE, RED_DEEP, WHITE, GREY, GREY_MID, GREY_LINE, Svg, exitOp, firstOp, glowOffK, mixHex, scaleIn, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, powOutRemain} from '../../common';
import {HandIcon, SpeechBubble, StoveIcon} from './parts';

/**
 * SC04 大脑没有手｜841–1098｜「可是它没有手。所以它看过菜谱，也拿不起刀；知道火候，也开不了火；
 * 记得冰箱里有什么，也打不开冰箱门。它只能说：我认为……」
 * 主角：脑 BrainIcon 200（唯一大体积主体，紫柔光；1003 一次「思考」脉冲）。
 * 配角：虚线手（缺席态）、右侧三枚灰框图标（刀 / 灶火 / 冰箱，84）、三把红叉、打字机气泡。
 * 节拍：三枚图标 897/899/901 作为一组自右滑入（保证每把叉都能落在 903/926/958 的台词上）；
 *       红叉分别 903 / 926 / 958 draw-on 12 帧；1006 气泡框弹出（S12 块首 1003 的 +3），1034 起打字机；
 */
const F0 = 841;
const TO = 1098;

const ITEMS = [
  {y: 230, f0: 897, cross: 903, kind: 'knife', label: '刀'},
  {y: 350, f0: 899, cross: 926, kind: 'stove', label: '灶火'},
  {y: 470, f0: 901, cross: 958, kind: 'fridge', label: '冰箱'},
];

const ICON_X = 860;
const BOX_X = 794;

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // 脑：首帧即在（承接上一个镜头），0.94→1 轻微落定
  const bN = N - 841;
  const bS = 0.94 + 0.06 * scaleIn(bN, 21);
  // 1003「只能想」的一次思考脉冲（语义动作，不是常驻呼吸）
  const think = N >= 1003 && N < 1023 ? Math.sin(((N - 1003) / 20) * Math.PI) : 0;
  const off = glowOffK(N, TO, 6, 8);
  const brainGlow = clamp01((N - 841) / 10) * (1 + 0.5 * think) * off;

  // 虚线手：849 起 12 帧淡入（缺席态，不发光）
  const handOp = 0.55 * softOp(N - 849, 12);

  // 气泡：S12 块首 1003 的 +3 帧出现空框（含跳动的省略号），1034 起打字机逐字写出「我认为」
  const bubN = N - 1006;
  const txtN = N - 1034;
  const bubS = 0.9 + 0.1 * scaleIn(bubN, 10);
  // 打字机 3 帧/字（1034 / 1037 / 1040），1040 落定 → 到 1090 离场剩 50 帧，扣灭光 6 帧 = 44，落在 30–45
  const shown = Math.max(0, Math.min(3, Math.floor(txtN / 3) + 1));
  const dotIdx = bubN < 8 ? -1 : Math.floor((bubN - 8) / 7) % 3;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 主角：脑 */}
      <div style={{position: 'absolute', inset: 0, opacity: firstOp(N - F0, 8)}}>
        <GlowBlob cx={330} cy={350} r={158} N={N} k={brainGlow} alpha={0.3} />
        <BrainIcon cx={330} cy={350} size={200} color={WHITE} accent={PURPLE} opacity={1} />
      </div>

      {/* 缺席的手（虚线线稿） */}
      <HandIcon cx={505} cy={495} size={92} color={GREY} opacity={handOp} />

      {/* 右侧三样东西 + 红叉 */}
      {ITEMS.map((it) => {
        const n = N - it.f0;
        if (n < 0) return null;
        const dx = 320 * powOutRemain(n, 22, 2.5);
        const op = softOp(n, 8);
        const ck = clamp01((N - it.cross) / 11);
        const iconColor = mixHex(WHITE, GREY_MID, ck);
        const boxStroke = mixHex(GREY, GREY_LINE, ck);
        const cp = clamp01((N - it.cross) / 12);
        return (
          <div key={it.label} style={{position: 'absolute', inset: 0, opacity: op, transform: `translateX(${dx.toFixed(2)}px)`, transformOrigin: `${BOX_X + 66}px ${it.y}px`}}>
            <Box x={BOX_X} y={it.y - 56} w={132} h={112} r={10} fill="#000" stroke={boxStroke} sw={2} />
            {it.kind === 'knife' && <KnifeIcon cx={ICON_X} cy={it.y} size={84} color={iconColor} accent={iconColor} />}
            {it.kind === 'stove' && <StoveIcon cx={ICON_X} cy={it.y} size={84} color={iconColor} accent={iconColor} />}
            {it.kind === 'fridge' && <FridgeIcon cx={ICON_X} cy={it.y} size={84} color={iconColor} accent={iconColor} />}
            <Svg bloom={false}>
              <Cross cx={ICON_X} cy={it.y} size={98} color={RED_DEEP} sw={5.5} p={cp} opacity={0.95} />
            </Svg>
          </div>
        );
      })}

      {/* 气泡：我认为…… */}
      {bubN >= 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: softOp(bubN, 8), transform: `scale(${bubS.toFixed(3)})`, transformOrigin: '752px 580px'}}>
          <SpeechBubble x={752} y={548} w={286} h={66} opacity={1}>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transform: 'translateY(-2px)'}}>
              <span style={{fontFamily: FONT_HEAVY, fontSize: 30, fontWeight: 700, color: WHITE, letterSpacing: 2, whiteSpace: 'nowrap'}}>{'我认为'.slice(0, shown)}</span>
              <span style={{display: 'flex', alignItems: 'center', gap: 5}}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{width: 6, height: 6, borderRadius: 3, background: WHITE, opacity: i === dotIdx ? 1 : 0.28}} />
                ))}
              </span>
            </div>
          </SpeechBubble>
        </div>
      )}
    </div>
  );
};
