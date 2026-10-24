import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {CText, GREY_LINE, PURPLE_LIGHT, WHITE, glowOffK, softOp, SoftIn} from '../../ui';
import {FONT_HEAVY, clamp01} from '../../common';
import {BarChartIcon, Bracket, DataBadge, DbCylinderIcon, FlyAbility, MAP_COUNTER_Y, MapStage, Package, PulseRing, TableIcon, easeOutK} from './parts';

/**
 * SC52 数据插件｜12720–12990（270 帧，第 6 章收尾）｜「装上一个数据插件 / 厨师可能获得表格处理 /
 *   数据库查询和图表生成能力 / 插件解决的是 / “怎么一次装齐一组能力？”」
 * 与 SC51 同一张厨房地图、同一只包（开场是没绑带的空包，12728 起重新裹带 → 平行的「同一套动作」）。
 * 12728 数据角标贴上包面；12771 表格、12820 数据库、12823 柱状图依次弹出飞进右侧能力栏；
 * 12901 能力栏被四角框住、底部亮起从包到台面再横贯到能力栏的搬运光带；12940 落大字「一次装齐」。
 * 主角：大字「一次装齐」96px（白字紫描边 + 紫光），全片最后一次「一次装齐」的强调。
 * 本镜没有 GlitchIn（全组唯一留给 SC50），大字用 4 帧 soften + 缩放落定替代分镜里的 glitch。
 * 末 8 帧匀速离场（12983–12990）；12944 起版面全部停住，章末停留约 38 帧。
 */
const F0 = 12720;
const TO = 12990;

const PKG = {x: 245, y: 330, size: 168};
const MOUTH: [number, number] = [PKG.x, PKG.y - PKG.size * 0.28];

const HEAD = {cx: 1028, cy: 224};
const DIV_X = 790;
const ROW = {iconX: 850, labelX: 894, y: [306, 386, 466], ruleX2: 1180};
const CTRL: [number, number] = [560, 176];

// 搬运光带：包底 → 台面下沿 → 横贯到能力栏下方
const BAND = {x0: 245, y0: MAP_COUNTER_Y, y1: 606, x1: 1040};
const BAND_LEN = BAND.y1 - BAND.y0 + (BAND.x1 - BAND.x0); // 1010

/** 章末离场：最后 8 帧匀速压到 0；首步就掉 12.5%，收得干脆（大字占的画面大，慢起手会显得拖） */
const exitK = (N: number) => (N <= TO - 8 ? 1 : Math.max(0, 1 - (N - (TO - 8)) / 8));

const bandPt = (d: number): [number, number] => {
  const dd = ((d % BAND_LEN) + BAND_LEN) % BAND_LEN;
  if (dd <= BAND.y1 - BAND.y0) return [BAND.x0, BAND.y0 + dd];
  return [BAND.x0 + (dd - (BAND.y1 - BAND.y0)), BAND.y1];
};

export const SC52: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 重新打包（同一套 21 帧裹带动作）
  const strapP = clamp01((N - 12728) / 21);
  const handleP = clamp01((N - 12733) / 14);
  const knotP = clamp01((N - 12747) / 10);

  // 数据角标贴到包面
  const stampN = N - 12728;
  const stampS = clamp01(0.1 + 1.9 * easeOutK(stampN / 10, 2));
  const glowK = (0.2 + (stampN >= 0 && stampN < 20 ? 0.1 : 0)) * off;

  const headOp = softOp(N - 12728, 10);
  const divP = clamp01((N - 12728) / 12);

  // 搬运光带：12901 画出，之后两枚光点持续从左往右跑
  const bandN = N - 12901;
  const vP = clamp01(bandN / 5);
  const hP = clamp01((bandN - 5) / 10);
  const dotN = N - 12918;
  const dot = (phase: number) => (dotN < 0 ? null : bandPt(dotN * 8 + phase));

  // 大字：12940 起 4 帧浮入 + 缩放落定（12944 版面即停住，留足章末停留）
  const textN = N - 12940;
  const textS = 1 + 0.06 * (1 - easeOutK(textN / 4, 2));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitK(N)}}>
      {/* 厨房地图 */}
      <MapStage N={N} opacity={0.7 * softOp(N - F0, 10)} />

      {/* 包的紫柔光（不呼吸） */}
      <GlowBlob cx={PKG.x} cy={PKG.y} r={PKG.size * 0.95} k={glowK} alpha={0.26} />
      <GlowBlob cx={PKG.x} cy={PKG.y} r={PKG.size * 0.62} k={glowK} alpha={0.24} />

      {/* 包：空包 → 21 帧裹带 → 数据角标 */}
      <Package cx={PKG.x} cy={PKG.y} size={PKG.size} strapP={strapP} handleP={handleP} knotP={knotP} />
      {stampN >= 0 ? <DataBadge cx={PKG.x} cy={PKG.y - 4} size={44} opacity={stampS} /> : null}
      <PulseRing cx={PKG.x} cy={PKG.y} p={clamp01((N - 12729) / 14)} r={40} opacity={0.7} />
      {stampN >= 0 ? <GlowBlob cx={PKG.x} cy={PKG.y} r={60} k={0.16 * (1 - clamp01((stampN - 10) / 20)) * off} alpha={0.28} /> : null}

      {/* ---- 右侧能力栏 ---- */}
      <div style={{position: 'absolute', left: DIV_X, top: 190, width: 1.6, height: 330 * divP, background: '#3A3A3A'}} />
      {N >= 12728 ? (
        <>
          <div style={{position: 'absolute', inset: 0, opacity: headOp}}>
            <DataBadge cx={905} cy={HEAD.cy} size={46} />
            <CText cx={HEAD.cx} cy={HEAD.cy} size={40} weight={800} family={FONT_HEAVY} color={WHITE} letterSpacing={1}>
              数据插件
            </CText>
          </div>
          <div style={{position: 'absolute', left: 900, top: 252, width: 260 * clamp01((N - 12734) / 12), height: 2, background: PURPLE_LIGHT, opacity: 0.8, boxShadow: '0 0 12px 2px rgba(102,45,248,.45)'}} />
        </>
      ) : null}

      {/* 三枚数据能力：弹出 → 弧线飞入能力栏 */}
      <FlyAbility
        N={N}
        f={12771}
        from={MOUTH}
        to={[ROW.iconX, ROW.y[0]]}
        ctrl={CTRL}
        label="表格处理"
        labelX={ROW.labelX}
        labelY={ROW.y[0]}
        ruleX2={ROW.ruleX2}
        draw={(cx, cy, size, accent) => <TableIcon cx={cx} cy={cy} size={size} color={WHITE} accent={accent} />}
      />
      <FlyAbility
        N={N}
        f={12820}
        from={MOUTH}
        to={[ROW.iconX, ROW.y[1]]}
        ctrl={CTRL}
        label="数据库查询"
        labelX={ROW.labelX}
        labelY={ROW.y[1]}
        ruleX2={ROW.ruleX2}
        draw={(cx, cy, size, accent) => <DbCylinderIcon cx={cx} cy={cy} size={size} color={WHITE} accent={accent} />}
      />
      <FlyAbility
        N={N}
        f={12823}
        from={MOUTH}
        to={[ROW.iconX, ROW.y[2]]}
        ctrl={CTRL}
        label="图表生成"
        labelX={ROW.labelX}
        labelY={ROW.y[2]}
        ruleX2={ROW.ruleX2}
        draw={(cx, cy, size, accent) => <BarChartIcon cx={cx} cy={cy} size={size} color={WHITE} accent={accent} />}
      />

      {/* 「插件解决的是」：把三行能力框住 */}
      <Bracket x={812} y={274} w={376} h={224} p={clamp01((N - 12901) / 14)} color={PURPLE_LIGHT} sw={2.4} arm={26} opacity={0.75} />

      {/* ---- 搬运光带：从包底落到台面下沿，再横贯到能力栏下方 ---- */}
      <svg width={1280} height={720} viewBox="0 0 1280 720" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <line x1={BAND.x0} y1={BAND.y0} x2={BAND.x0} y2={BAND.y0 + (BAND.y1 - BAND.y0) * vP} stroke={PURPLE_LIGHT} strokeWidth="1.4" opacity={0.26} />
        <line x1={BAND.x0} y1={BAND.y1} x2={BAND.x0 + (BAND.x1 - BAND.x0) * hP} y2={BAND.y1} stroke={PURPLE_LIGHT} strokeWidth="1.4" opacity={0.2} />
      </svg>
      {[0, Math.round(BAND_LEN / 2)].map((phase, i) => {
        const p = dot(phase);
        if (!p) return null;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: p[0] - 26, top: p[1] - 26, width: 52, height: 52, borderRadius: '50%', background: 'radial-gradient(circle, rgba(161,117,241,0.5) 0%, rgba(102,45,248,0.14) 42%, rgba(0,0,0,0) 70%)'}} />
            <div style={{position: 'absolute', left: p[0] - 4, top: p[1] - 4, width: 8, height: 8, borderRadius: 4, background: WHITE, boxShadow: '0 0 10px 3px rgba(161,117,241,.75)'}} />
          </React.Fragment>
        );
      })}

      {/* ---- 「一次装齐」：章末大字（96px，白字紫描边） ---- */}
      <SoftIn N={N} f0={12940} len={4} dy={14}>
        <CText
          cx={640}
          cy={548}
          size={96}
          weight={900}
          family={FONT_HEAVY}
          color={WHITE}
          letterSpacing={8}
          shadow="0 0 26px rgba(102,45,248,.6), 0 0 6px rgba(161,117,241,.6)"
          style={{transform: `translate(-50%,-50%) scale(${textS.toFixed(3)})`, transformOrigin: '50% 50%', WebkitTextStroke: `2.2px ${PURPLE_LIGHT}`, paintOrder: 'stroke fill'}}
        >
          一次装齐
        </CText>
      </SoftIn>
      <div style={{position: 'absolute', left: 150, top: MAP_COUNTER_Y, width: 55 * clamp01((N - 12750) / 12), height: 1.4, background: GREY_LINE, opacity: 0.7}} />
    </div>
  );
};
