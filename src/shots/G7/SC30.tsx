import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {GREY_LIGHT, MonoText, PURPLE_LIGHT, abs, exitOp, glowOffK, softOp} from '../../ui';
import {clamp01, powOutRemain} from '../../common';
import {Caret, HandPress, TicketCard, TypeBar, textW, typeSlice} from './parts';

/**
 * SC30 人主动发起｜7505–7645（141 帧，三句短句，刻意留白）
 * 手留在画面上方，小票放大到中央 420×260，票头打 `/整理数据`。
 * 主角：小票 420×260（紫柔光）；配角：上方一只静止的手（灰线稿）。
 * 无 GlitchIn（不在白名单）、无运镜（由小票自身的放大上移做视差）。
 * 持续动作：票身三条值条逐条打字 → 票头打字机；末拍落位后停 36 帧。
 */
const F0 = 7505;
const TO = 7645;

const TK = {x: 430, y: 260, w: 420, h: 260};

export const SC30: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 小票：7508 起 56 帧放大并上移（手不动，只动票 = 视差）；拉长是为了整段都有可感的位移
  const tn = N - 7508;
  const ease = 1 - powOutRemain(tn, 56, 2.2);
  const s = 0.82 + 0.18 * ease;
  const dy = 62 * (1 - ease);
  const tkOp = softOp(tn, 6);
  const tkGlow = clamp01(tn / 14) * off;

  // 手：整镜头静止在画面上方（承接 SC29 按铃的那只手）
  const handOp = 0.42;

  // 三条值条：逐条填充
  const bars = [
    {w: 344, t0: 7520, len: 14},
    {w: 300, t0: 7546, len: 14},
    {w: 252, t0: 7572, len: 14},
  ];
  const barP = bars.map((b) => clamp01((N - b.t0) / b.len));

  // 票头 /整理数据：7589「『帮我整理这份数据』」的 −3，打字机
  const HEAD = '/整理数据';
  const headN = N - 7586;
  const head = typeSlice(HEAD, headN, 4);

  const actBar = barP.findIndex((p) => p > 0 && p < 1);
  const typingHead = headN >= 0 && head.length < HEAD.length;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 手：留在画面上方，不动 */}
      {tn >= 0 ? <HandPress cx={640} cy={168} size={160} rotate={174} color={GREY_LIGHT} opacity={handOp * tkOp} /> : null}

      {/* 主角：小票 */}
      {tn >= 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: tkOp, transform: `translate(0, ${dy.toFixed(2)}px) scale(${s.toFixed(4)})`, transformOrigin: `${640}px ${390}px`}}>
          <GlowBlob cx={640} cy={390} r={280} N={N} k={tkGlow} alpha={0.2} />
          <GlowBlob cx={640} cy={390} r={190} N={N} k={tkGlow} alpha={0.22} />
          <TicketCard x={TK.x} y={TK.y} w={TK.w} h={TK.h} glowK={tkGlow * 0.5} headY={78}>
            {/* 票头：/整理数据（票内坐标） */}
            <MonoText x={22} y={22} size={30} color={PURPLE_LIGHT}>
              {head}
            </MonoText>
            {/* 票头右侧的小方印 */}
            <div style={{...abs(TK.w - 34, 24, 14, 14), borderRadius: 2, border: `1.5px solid ${PURPLE_LIGHT}`, opacity: 0.7}} />
            {/* 票身三条值条 */}
            {bars.map((b, i) => (
              <TypeBar key={i} x={22} y={106 + i * 52} w={b.w} p={barP[i]} h={6} color={GREY_LIGHT} opacity={0.8} />
            ))}
            {/* 光标：先在值条上逐条打，随后跳到票头（票内坐标） */}
            {typingHead ? <Caret x={22 + textW(head, 30)} y={20} N={N} h={32} /> : null}
            {!typingHead && actBar >= 0 ? <Caret x={24 + bars[actBar].w * barP[actBar]} y={100 + actBar * 52} N={N} h={18} /> : null}
          </TicketCard>
        </div>
      ) : null}
    </div>
  );
};
