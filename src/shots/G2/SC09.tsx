import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GlowBlob, type CamKey} from '../../fx';
import {BellIcon, BrainIcon, CardBoxIcon, CrateIcon, KnifeIcon, SheetIcon, SocketIcon} from '../../icons';
import {CText, PURPLE, WHITE, GREY_MID, GREY_LIGHT, SoftIn, exitOp, firstOp, glowOffK, mixHex, scaleIn, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, powOutRemain} from '../../common';
import {Bracket} from './parts';

/**
 * SC09 差别在哪｜2079–2242｜「差别不一定在大脑，而在于它被安排做什么，又被允许使用什么。」
 * 主角：岗位说明 SheetIcon 180 @ (390,455)，紫柔光（2139 起）。
 * 配角：中央脑 160（2079 首帧即在、2098–2109 由白转灰）、右排 5 枚 60px 小工具、
 *       两条向上生长的括号线、两侧 30px 标签。
 * 运镜：整组从 (700,360) 平移到 (640,360)，2087–2105 共 18 帧（不进末拍）。
 * 持续动作：括号线向上生长；右排工具 2195 起从左向右展开。
 */
const F0 = 2079;
const TO = 2242;

const CAM: CamKey[] = [
  {f: F0, x: 700, y: 360, s: 1},
  {f: 2087, x: 700, y: 360, s: 1},
  {f: 2105, x: 640, y: 360, s: 1},
  {f: TO, x: 640, y: 360, s: 1},
];

const TOOLS = [
  {kind: 'knife' as const},
  {kind: 'card' as const},
  {kind: 'bell' as const},
  {kind: 'socket' as const},
  {kind: 'crate' as const},
];

export const SC09: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 脑：首帧即在（firstOp ≈57%），2098–2109 白 → 灰
  const bN = N - F0;
  const bS = 0.94 + 0.06 * scaleIn(bN, 18);
  const bOp = firstOp(bN, 8);
  const brainGrey = clamp01((N - 2098) / 11);
  const brainColor = mixHex(WHITE, GREY_MID, brainGrey);
  const brainAccent = mixHex(PURPLE, GREY_MID, brainGrey);
  const brainGlow = clamp01(bN / 8) * 0.9 * (1 - brainGrey) * off;

  // 岗位说明：2135 起 20 帧上浮 60px 落位
  const sN = N - 2135;
  const sDy = 60 * powOutRemain(sN, 20, 2.5);
  const sOp = softOp(sN, 8);
  const sheetGlow = clamp01((N - 2139) / 10) * off;

  // 右侧：2195 起展开（clip 从左向右 6 帧），到 2201 全部落位
  const rN = N - 2195;
  const rowP = clamp01(rN / 6);
  const rowDy = 16 * powOutRemain(rN, 6, 2.5);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        {/* 中央脑：紫光随「差别不一定在大脑」退去 */}
        {bN >= 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: bOp, transform: `scale(${bS.toFixed(3)})`, transformOrigin: '640px 300px'}}>
            <GlowBlob cx={640} cy={300} r={126} N={N} k={brainGlow} alpha={0.26} />
            <BrainIcon cx={640} cy={300} size={160} color={brainColor} accent={brainAccent} />
          </div>
        )}

        {/* 左：岗位说明（主角） */}
        {sN >= 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: sOp, transform: `translateY(${sDy.toFixed(2)}px)`}}>
            <GlowBlob cx={390} cy={455} r={156} N={N} k={sheetGlow} alpha={0.24} />
            <SheetIcon cx={390} cy={455} size={180} color={WHITE} accent={PURPLE} />
          </div>
        )}
        <SoftIn N={N} f0={2139} len={12} dy={16}>
          <CText cx={390} cy={580} size={30} weight={600} family={FONT_HEAVY} color={WHITE} letterSpacing={2}>
            安排做什么
          </CText>
        </SoftIn>
        {/* 左括号慢长到下一拍（2139→2195），让「安排做什么」的动词动作持续到 2201 句 */}
        <Bracket x={270} yTop={350} yBot={560} dir={1} p={clamp01((N - 2139) / 56)} color={GREY_LIGHT} sw={2} arm={18} />

        {/* 右：允许使用的一排工具（配角，不发光） */}
        <SoftIn N={N} f0={2195} len={6} dy={10}>
          <CText cx={926} cy={580} size={30} weight={600} family={FONT_HEAVY} color={WHITE} letterSpacing={2}>
            允许用什么
          </CText>
        </SoftIn>
        {rN >= 0 && (
          <div
            style={{
              position: 'absolute',
              left: 790,
              top: 425,
              width: 300,
              height: 60,
              overflow: 'hidden',
              clipPath: `inset(0 ${((1 - rowP) * 100).toFixed(1)}% 0 0)`,
              opacity: softOp(rN, 6),
              transform: `translateY(${rowDy.toFixed(2)}px)`,
            }}
          >
            {TOOLS.map((t, i) => {
              const cx = 30 + i * 58;
              return (
                <React.Fragment key={t.kind}>
                  {t.kind === 'knife' && <KnifeIcon cx={cx} cy={30} size={60} color={WHITE} accent={GREY_LIGHT} />}
                  {t.kind === 'card' && <CardBoxIcon cx={cx} cy={30} size={60} color={WHITE} accent={GREY_LIGHT} />}
                  {t.kind === 'bell' && <BellIcon cx={cx} cy={30} size={60} color={WHITE} accent={GREY_LIGHT} />}
                  {t.kind === 'socket' && <SocketIcon cx={cx} cy={30} size={60} color={WHITE} accent={GREY_LIGHT} />}
                  {t.kind === 'crate' && <CrateIcon cx={cx} cy={30} size={60} color={WHITE} accent={GREY_LIGHT} />}
                </React.Fragment>
              );
            })}
          </div>
        )}
        <Bracket x={1110} yTop={350} yBot={560} dir={-1} p={clamp01((N - 2195) / 6)} color={GREY_LIGHT} sw={2} arm={18} />
      </CameraRig>
    </div>
  );
};
