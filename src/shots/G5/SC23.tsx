import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GlowBlob, type CamKey} from '../../fx';
import {Box, GREY, GREY_LIGHT, GREY_LINE, PURPLE_LIGHT, WHITE, exitOp, glowOffK, mixHex, softOp} from '../../ui';
import {FONT_MONO, clamp01, easeInOutPow} from '../../common';
import {CornerBrackets, GreyNote, MonoLabel, SkillBox, SpinIcon, TextBar} from './parts';

/**
 * SC23 SKILL.md：只读需要的那一张｜5605–5871
 * 卡盒缩到 160 放在左下，只露四道卡脊；讲到「真正要做那道菜」时抽出一张，沿 45° 飞出并放大到 300×200。
 * 卡上写 SKILL.md（打字机），下面 name / description 两行说明这是按需读取的技能文件。
 * 主角：抽出的卡 300×200（紫柔光）；右上循环箭头持续微旋。
 * 节拍：5607 盒缩 / 5677 抽卡 / 5726 SKILL.md 打字机 / 5794 取景框 + 告诉「只读这一张」。
 * 偏离：分镜里的「≈100 tokens」按硬规则替换为中文小灰字「按需读取」（不出现统计数字）。
 */
const F0 = 5605;
const TO = 5871;

// 运镜：5730–5772 整体缓推 1.15（40 帧出头），让「阅读」这一段有持续推进感；
// 结束在 5772，离离场起点 5863 还有 90 帧，不进末拍。
const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 5730, x: 640, y: 360, s: 1},
  {f: 5772, x: 640, y: 360, s: 1.15},
  {f: TO, x: 640, y: 360, s: 1.15},
];

// 抽卡路径：从盒里的卡脊位置沿 45° 起飞，再落到右上
const P0 = {x: 228, y: 474};
const P1 = {x: 500, y: 230};
const P2 = {x: 860, y: 320};
const qPoint = (t: number) => ({
  x: (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x,
  y: (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y,
});

const CARD_W = 300;
const CARD_H = 200;

export const SC23: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 卡盒 5607 起 21 帧缩到 160；抽卡后盒里少一张
  const bp = easeInOutPow(2.5)(clamp01((N - 5607) / 21));
  const boxSize = 260 + (160 - 260) * bp;
  const pulled = N >= 5677;
  const boxDim = 1 - 0.55 * clamp01((N - 5794) / 12);

  // 抽卡：5677–5699（22 帧）
  const pn = N - 5677;
  const p = easeInOutPow(2.2)(clamp01(pn / 22));
  const pt = qPoint(p);
  const cardS = 0.28 + 0.72 * p;
  const cardRot = -10 * (1 - p);
  const cardOp = softOp(pn, 8);
  const landed = N >= 5699;

  // 落位后紫光；5794 取景框时再亮一档
  const focusK = clamp01((N - 5794) / 14);
  const cardGlow = clamp01((N - 5699) / 12) * (1 + 0.35 * focusK) * off;

  // SKILL.md 打字机：5726 起，4 帧/字
  const typeN = N - 5726;
  const chars = typeN < 0 ? 0 : Math.min(8, Math.floor(typeN / 4) + 1);
  const titleDone = chars >= 8;
  const metaOp = softOp(N - 5750, 10);
  const metaOp2 = softOp(N - 5760, 10);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
      {/* 左下：卡盒只剩四道卡脊（抽走的那张不再出现） */}
      <div style={{position: 'absolute', inset: 0, opacity: boxDim}}>
        <SkillBox cx={220} cy={500} size={boxSize} color={GREY_LIGHT} accent={GREY_LIGHT} hide={[false, pulled, false, false]} />
      </div>

      {/* 抽出的卡：沿 45° 飞出 → 放大落位 */}
      {pn >= 0 && (
        <div
          style={{
            position: 'absolute',
            left: pt.x - CARD_W / 2,
            top: pt.y - CARD_H / 2,
            width: CARD_W,
            height: CARD_H,
            opacity: cardOp,
            transform: `rotate(${cardRot.toFixed(2)}deg) scale(${cardS.toFixed(3)})`,
            transformOrigin: '50% 50%',
          }}
        >
          <GlowBlob cx={CARD_W / 2} cy={CARD_H / 2} r={165} N={N} k={cardGlow} alpha={0.2} />
          <GlowBlob cx={CARD_W / 2} cy={CARD_H / 2} r={110} N={N} k={cardGlow} alpha={0.24} />
          <Box
            x={0}
            y={0}
            w={CARD_W}
            h={CARD_H}
            r={14}
            fill="#000"
            stroke={mixHex(WHITE, PURPLE_LIGHT, clamp01((N - 5699) / 10))}
            sw={2.4}
          >
            {landed && (
              <>
                {/* SKILL.md */}
                <div style={{position: 'absolute', left: 20, top: 28, fontFamily: FONT_MONO, fontSize: 32, fontWeight: 700, color: PURPLE_LIGHT, letterSpacing: 1, lineHeight: 1, whiteSpace: 'nowrap'}}>
                  {'SKILL.md'.slice(0, chars)}
                </div>
                {titleDone && <TextBar x={20} y={68} w={245} h={2} color={PURPLE_LIGHT} opacity={0.9} fill={clamp01((N - 5758) / 12)} />}

                {/* name / description 两行（技能文件的 front matter 语义） */}
                <div style={{opacity: metaOp}}>
                  <MonoLabel x={20} y={86} size={18} color={GREY} opacity={0.95}>name</MonoLabel>
                  <TextBar x={84} y={96} w={176} h={3} color={GREY_LIGHT} fill={clamp01((N - 5752) / 12)} />
                </div>
                <div style={{opacity: metaOp2}}>
                  <MonoLabel x={20} y={116} size={18} color={GREY} opacity={0.95}>description</MonoLabel>
                  <TextBar x={20} y={134} w={230} h={3} color={GREY_LINE} fill={clamp01((N - 5762) / 12)} />
                  <TextBar x={20} y={152} w={200} h={3} color={GREY_LINE} fill={clamp01((N - 5766) / 12)} />
                  <TextBar x={20} y={170} w={158} h={3} color={GREY_LINE} fill={clamp01((N - 5770) / 12)} />
                </div>

                {/* 右上：循环箭头持续微旋 */}
                {N >= 5699 && <SpinIcon cx={270} cy={30} size={26} rot={(N - 5699) * 6} color={PURPLE_LIGHT} />}
              </>
            )}
          </Box>
        </div>
      )}

      {/* 卡外的小灰字：按需读取（替代分镜的 ≈100 tokens） */}
      <GreyNote x={1040} y={440} size={22} opacity={softOp(N - 5700, 12)}>
        按需读取
      </GreyNote>

      {/* 取景框：只读这一张 */}
      {N >= 5794 && (
        <CornerBrackets x={700} y={210} w={320} h={220} p={clamp01((N - 5794) / 16)} color={PURPLE_LIGHT} arms={30} sw={2.4} opacity={0.95} />
      )}
      </CameraRig>

      {/* 注意力聚焦：S72 起四周缓缓压暗，只留卡面（相机推到 1.15 后卡心在屏幕 893,314） */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: clamp01((N - 5794) / 26),
          background: 'radial-gradient(ellipse 520px 380px at 893px 314px, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 55%, rgba(0,0,0,0.62) 100%)',
        }}
      />
    </div>
  );
};
