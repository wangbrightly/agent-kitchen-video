import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {BellIcon, CardBoxIcon} from '../../icons';
import {CText, GREY_LINE, GREY_MID, PURPLE_LIGHT, WHITE, exitOp, glowOffK, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, easeInOutPow} from '../../common';
import {StickyNoteIcon} from '../G1/parts';
import {Bracket, CheckBadgeIcon, CodeBadge, FileAbilityIcon, FlyAbility, MAP_COUNTER_Y, MagnifierIcon, MapStage, Package, PlugGlyph, PulseRing, easeOutK, qPoint} from './parts';

/**
 * SC51 能力安装包｜12373–12719（347 帧）｜「它更像一个能力安装包 / 把一组相关资源 / 一次性送进厨房 /
 *   装上一个代码插件 / 厨师可能获得读写文件 / 运行测试和代码检查能力」
 * 三段动作撑住长镜头：
 *   ① 打包（12373–12412）：包从 SC50 的位置抬到画面中央，提手 + 绑带 + 蝴蝶结 21 帧裹上；
 *   ② 收资源 → 送进厨房（12439–12498）：四枚资源小件收进包里，包沿弧线飞进左侧厨房地图、落在台面上（缩到 168）；
 *   ③ 装上代码插件（12533–12658）：包面出现代码角标，右侧能力栏立起，三枚能力依次从包口弹出、飞到位。
 * 主角：木箱包（240，带提手时轮廓约 180px，紫柔光）；厨房地图复用 G1 的 KitchenLineArt。
 * 本镜没有 GlitchIn（全组唯一留给 SC50）；动画只有一次性事件，不做漂浮/呼吸。
 */
const F0 = 12373;
const TO = 12719;

// 包：抬到中央 → 飞进地图左段台面
const P0 = {x: 640, y: 300, size: 240};
const P1 = {x: 245, y: 330, size: 168};
const MOUTH: [number, number] = [P1.x, P1.y - P1.size * 0.28];

// 右侧能力栏
const HEAD = {cx: 1028, cy: 224};
const DIV_X = 790;
const ROW = {iconX: 850, labelX: 894, y: [306, 386, 466], ruleX2: 1180};
const CTRL: [number, number] = [560, 176];

const CHIPS: Array<{kind: 'card' | 'note' | 'plug' | 'bell'; from: [number, number]}> = [
  {kind: 'card', from: [400, 130]},
  {kind: 'note', from: [880, 130]},
  {kind: 'plug', from: [390, 500]},
  {kind: 'bell', from: [890, 500]},
];

const ChipGlyph: React.FC<{kind: string; cx: number; cy: number; size: number; opacity: number}> = ({kind, cx, cy, size, opacity}) => {
  if (kind === 'card') return <CardBoxIcon cx={cx} cy={cy} size={size} color={WHITE} accent={GREY_MID} opacity={opacity} />;
  if (kind === 'note') return <StickyNoteIcon cx={cx} cy={cy} size={size} color={WHITE} accent={GREY_MID} opacity={opacity} />;
  if (kind === 'plug') return <PlugGlyph cx={cx} cy={cy} size={size} color={WHITE} accent={GREY_MID} opacity={opacity} />;
  return <BellIcon cx={cx} cy={cy} size={size} color={WHITE} accent={GREY_MID} opacity={opacity} />;
};

export const SC51: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // ---- ① 抬到中央 + 打包 ----
  const enterT = easeOutK((N - F0) / 12, 2.2);
  const strapP = clamp01((N - 12381) / 21);
  const handleP = clamp01((N - 12386) / 14);
  const knotP = clamp01((N - 12400) / 12);

  // ---- ② 飞进厨房 ----
  const flyE = easeInOutPow(2.2)(clamp01((N - 12476) / 22));
  const flying = N >= 12476;
  const [fx, fy] = qPoint(P0.x, P0.y, 470, 140, P1.x, P1.y, flyE);
  const pkg = flying
    ? {x: fx, y: fy, size: P0.size + (P1.size - P0.size) * flyE}
    : {x: 330 + (P0.x - 330) * enterT, y: 380 + (P0.y - 380) * enterT, size: P0.size};
  // 起飞时的一闪 / 落地环
  const landK = N < 12498 ? 0 : N < 12508 ? (N - 12498) / 10 : Math.max(0, 1 - (N - 12508) / 14);
  const badgeN = N - 12533;
  const badgeS = clamp01(0.1 + 1.9 * easeOutK(badgeN / 10, 2));
  const glowK = (0.2 + 0.1 * landK + (badgeN >= 0 && badgeN < 18 ? 0.08 : 0)) * off;

  // 右侧能力栏
  const headOp = softOp(N - 12533, 10);
  const divP = clamp01((N - 12533) / 12);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 厨房地图 */}
      <MapStage N={N} opacity={0.7 * softOp(N - F0, 12)} />

      {/* 包的紫柔光（跟着包走，不呼吸） */}
      <GlowBlob cx={pkg.x} cy={pkg.y} r={pkg.size * 0.95} k={glowK} alpha={0.26} />
      <GlowBlob cx={pkg.x} cy={pkg.y} r={pkg.size * 0.62} k={glowK} alpha={0.24} />

      {/* ---- 包：打包 → 飞入地图 ---- */}
      <Package cx={pkg.x} cy={pkg.y} size={pkg.size} strapP={strapP} handleP={handleP} knotP={knotP} />
      {badgeN >= 0 ? <CodeBadge cx={P1.x} cy={P1.y - 4} size={44} opacity={badgeS} /> : null}

      {/* 包口在打包阶段的一圈紫光 */}
      <GlowBlob cx={pkg.x} cy={pkg.y - pkg.size * 0.28} r={54} k={(0.1 + 0.12 * clamp01((N - 12381) / 8) * (1 - clamp01((N - 12402) / 8))) * off} alpha={0.26} />

      {/* 落地环 + 代码角标落地环 */}
      <PulseRing cx={P1.x} cy={MAP_COUNTER_Y} p={clamp01((N - 12498) / 18)} r={64} opacity={0.85} />
      <PulseRing cx={P1.x} cy={P1.y} p={clamp01((N - 12534) / 14)} r={40} opacity={0.7} />
      {badgeN >= 0 ? <GlowBlob cx={P1.x} cy={P1.y} r={60} k={(0.16 * (1 - clamp01((badgeN - 10) / 20))) * off} alpha={0.28} /> : null}

      {/* ---- ② 四枚资源小件收进包里 ---- */}
      {CHIPS.map((c, i) => {
        const n = N - (12439 + i * 3);
        if (n < 0 || n > 22) return null;
        const t = easeInOutPow(2.4)(clamp01(n / 16));
        const [x, y] = qPoint(c.from[0], c.from[1], (c.from[0] + P0.x) / 2, (c.from[1] + P0.y) / 2 - 24, P0.x, P0.y, t);
        const op = 1 - clamp01((n - 12) / 4);
        return (
          <React.Fragment key={c.kind}>
            <GlowBlob cx={x} cy={y} r={26} k={0.12 * op * off} alpha={0.26} />
            <div style={{position: 'absolute', inset: 0, opacity: op * softOp(n, 5), transform: `scale(${(1 - 0.6 * t).toFixed(3)})`, transformOrigin: `${x}px ${y}px`}}>
              <ChipGlyph kind={c.kind} cx={x} cy={y} size={54} opacity={1} />
            </div>
          </React.Fragment>
        );
      })}
      {/* 「一组相关资源」：把包框住，飞走时撤掉 */}
      <Bracket x={495} y={190} w={290} h={270} p={clamp01((N - 12439) / 14)} color={PURPLE_LIGHT} sw={2.6} arm={30} opacity={0.8 * (1 - clamp01((N - 12476) / 8))} />

      {/* ---- ③ 右侧能力栏 ---- */}
      <div style={{position: 'absolute', left: DIV_X, top: 190, width: 1.6, height: 330 * divP, background: '#3A3A3A'}} />
      {N >= 12533 ? (
        <>
          <div style={{position: 'absolute', inset: 0, opacity: headOp}}>
            <CodeBadge cx={905} cy={HEAD.cy} size={46} />
            <CText cx={HEAD.cx} cy={HEAD.cy} size={40} weight={800} family={FONT_HEAVY} color={WHITE} letterSpacing={1}>
              代码插件
            </CText>
          </div>
          <div style={{position: 'absolute', left: 900, top: 252, width: 260 * clamp01((N - 12539) / 12), height: 2, background: PURPLE_LIGHT, opacity: 0.8, boxShadow: '0 0 12px 2px rgba(102,45,248,.45)'}} />
        </>
      ) : null}

      {/* 三枚能力：弹出 → 弧线飞到行位 → 标签 + 分隔线 */}
      <FlyAbility
        N={N}
        f={12577}
        from={MOUTH}
        to={[ROW.iconX, ROW.y[0]]}
        ctrl={CTRL}
        label="读写文件"
        labelX={ROW.labelX}
        labelY={ROW.y[0]}
        ruleX2={ROW.ruleX2}
        draw={(cx, cy, size, accent) => <FileAbilityIcon cx={cx} cy={cy} size={size} color={WHITE} accent={accent} />}
      />
      <FlyAbility
        N={N}
        f={12631}
        from={MOUTH}
        to={[ROW.iconX, ROW.y[1]]}
        ctrl={CTRL}
        label="运行测试"
        labelX={ROW.labelX}
        labelY={ROW.y[1]}
        ruleX2={ROW.ruleX2}
        draw={(cx, cy, size, accent) => <CheckBadgeIcon cx={cx} cy={cy} size={size} color={WHITE} accent={accent} />}
      />
      <FlyAbility
        N={N}
        f={12634}
        from={MOUTH}
        to={[ROW.iconX, ROW.y[2]]}
        ctrl={CTRL}
        label="代码检查"
        labelX={ROW.labelX}
        labelY={ROW.y[2]}
        ruleX2={ROW.ruleX2}
        draw={(cx, cy, size, accent) => <MagnifierIcon cx={cx} cy={cy} size={size} color={WHITE} accent={accent} />}
      />

      {/* 底部安静的地图注脚：一条台面延长线，交代「包落在了台面上」 */}
      <div style={{position: 'absolute', left: 150, top: MAP_COUNTER_Y, width: 60 * clamp01((N - 12498) / 12), height: 1.4, background: GREY_LINE, opacity: 0.7}} />
    </div>
  );
};
