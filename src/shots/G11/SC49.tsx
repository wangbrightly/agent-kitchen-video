import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GlowBlob, type CamKey} from '../../fx';
import {BellIcon, CardBoxIcon, CrateIcon, KnifeIcon} from '../../icons';
import {CText, GREY_LIGHT, PURPLE, PURPLE_LIGHT, WHITE, exitOp, glowOffK, mixHex, softOp} from '../../ui';
import {FONT_HEAVY, clamp01, easeInOutPow} from '../../common';
import {StickyNoteIcon} from '../G1/parts';
import {PlugGlyph, PulseRing, flashK, qPoint} from './parts';

/**
 * SC49 箱里有什么｜11961–12175｜「几张技能卡 / 一些记忆模板 / 连接外部服务的配置 / 自动触发规则」
 * 紧接 G10 SC48 的木箱：首帧木箱仍是 CrateIcon 280 @ (940,400)（SC48 的收势），刀还浮在箱口上方。
 * 11961–11991 相机推近 1.0→1.15；同时木箱用 26 帧移到画面中央、缩到 240（一次性位移，不循环）。
 * 四件小物在各自字幕块起始帧从箱口沿弧线浮出，落到箱子上方一字排开；到位后停住不动。
 * 主角：木箱（屏幕墨迹约 177px，紫柔光）；配角：四件 110 的小物 + 24px 标签。
 * 本镜没有 GlitchIn（白名单外）；推近期间只有第一件小物起步，其余三件在 12009 后错峰。
 */
const F0 = 11961;
const TO = 12175;

// 推近：以画面中央偏下为轴，1.0→1.15（30 帧，落在末拍前）
const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 11991, x: 640, y: 420, s: 1.15},
  {f: TO, x: 640, y: 420, s: 1.15},
];

// 木箱：SC48 的落位 (940,400)@280 → SC49 的居中 (640,452)@240
const crateAt = (N: number) => {
  const t = easeInOutPow(2.2)(clamp01((N - F0) / 26));
  return {x: 940 - 300 * t, y: 400 + 52 * t, size: 280 - 40 * t};
};

const SLOT_X = [392.5, 557.5, 722.5, 887.5];
const SLOT_Y = 280;
const ITEM_SIZE = 110;
const ITEMS: Array<{at: number; label: string; kind: 'card' | 'note' | 'plug' | 'bell'}> = [
  {at: 11969, label: '技能卡', kind: 'card'},
  {at: 12009, label: '记忆模板', kind: 'note'},
  {at: 12054, label: '配置', kind: 'plug'},
  {at: 12111, label: '触发规则', kind: 'bell'},
];
const FLY = 18;

/** 箱口（小物起步点）：木箱 viewBox 的上沿附近 */
const mouthOf = (c: {x: number; y: number; size: number}) => ({x: c.x, y: c.y - c.size * 0.28});

const ItemGlyph: React.FC<{kind: string; cx: number; cy: number; size: number; color: string; accent: string; opacity: number}> = ({kind, cx, cy, size, color, accent, opacity}) => {
  if (kind === 'card') return <CardBoxIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  if (kind === 'note') return <StickyNoteIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  if (kind === 'plug') return <PlugGlyph cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
  return <BellIcon cx={cx} cy={cy} size={size} color={color} accent={accent} opacity={opacity} />;
};

export const SC49: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);
  const crate = crateAt(N);

  // 上一镜留在箱口的刀：11961 起缩回箱内并淡出（一次性，不循环）
  const knifeT = easeInOutPow(2)(clamp01((N - F0) / 14));
  const knifeOp = 1 - clamp01((N - (F0 + 2)) / 12);
  const knifeX = 940;
  const knifeY = 252 + (crate.y - 20 - 252) * knifeT;
  const knifeS = 120 * (1 - 0.55 * knifeT);

  // 四件小物的落位闪光：用于把"当前这一件"短暂提到高亮
  const flashes = ITEMS.map((it) => flashK(N - (it.at + FLY)));
  const maxFlash = Math.max(0, ...flashes);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        {/* 木箱紫柔光（不呼吸） */}
        <GlowBlob cx={crate.x} cy={crate.y} r={crate.size * 0.95} k={(0.2 + 0.1 * maxFlash) * off} alpha={0.26} />
        <GlowBlob cx={crate.x} cy={crate.y} r={crate.size * 0.6} k={(0.22 + 0.1 * maxFlash) * off} alpha={0.24} />

        {/* 箱口的紫光：每件小物起步时亮一次 */}
        {ITEMS.map((it, i) => {
          const k = flashK(N - it.at) * 0.8;
          if (k <= 0.01) return null;
          const m = mouthOf(crate);
          return <GlowBlob key={`m${i}`} cx={m.x} cy={m.y} r={70} k={k} alpha={0.3} />;
        })}

        {/* 木箱（与 SC48 同一枚 CrateIcon） */}
        <div style={{position: 'absolute', inset: 0, transform: `scale(${(crate.size / 240).toFixed(3)})`, transformOrigin: `${crate.x}px ${crate.y}px`}}>
          <CrateIcon cx={crate.x} cy={crate.y} size={240} color={WHITE} accent={PURPLE_LIGHT} />
        </div>

        {/* SC48 留下的刀：缩回箱内 */}
        {knifeOp > 0.01 ? (
          <div style={{position: 'absolute', inset: 0, opacity: knifeOp, transform: `translate(0px, ${(knifeY - 252).toFixed(2)}px) scale(${(knifeS / 120).toFixed(3)})`, transformOrigin: `${knifeX}px 252px`}}>
            <KnifeIcon cx={knifeX} cy={252} size={120} color={WHITE} accent={PURPLE_LIGHT} />
          </div>
        ) : null}

        {/* 四件小物：从箱口浮出 → 落位 → 停住（不悬停/不呼吸） */}
        {ITEMS.map((it, i) => {
          const flyN = N - it.at;
          if (flyN < 0) return null;
          const m = mouthOf(crateAt(it.at));
          const tx = SLOT_X[i];
          const ty = SLOT_Y;
          const t = clamp01(flyN / FLY);
          const e = easeInOutPow(2.4)(t);
          // 前几件短距离直飞；第四件要从箱口跨到最右，直接从第三件头顶过会和插头、标签叠形，
          // 控制点放到右下（960, ty+100），让它贴着台面横移再从下方升进末位
          const last = i === ITEMS.length - 1;
          const cxCtl = last ? 960 : (m.x + tx) / 2;
          const cyCtl = last ? ty + 100 : Math.min(m.y, ty) - 70;
          const [px, py] = qPoint(m.x, m.y, cxCtl, cyCtl, tx, ty, e);
          const landed = flyN >= FLY;
          const f = flashes[i];
          const color = mixHex(WHITE, PURPLE_LIGHT, 0.35 * f);
          const accent = f > 0.02 ? PURPLE_LIGHT : PURPLE;
          const landGlow = landed ? 0.12 + 0.18 * f : 0.08;
          const scale = 0.72 + 0.28 * e;
          const op = softOp(flyN, 6);
          return (
            <React.Fragment key={it.kind}>
              {/* 落位前后都有一点淡紫光；当前这一件更亮 */}
              <GlowBlob cx={px} cy={py} r={ITEM_SIZE * 0.72} k={landGlow * off} alpha={0.24} />
              {landed ? <PulseRing cx={tx} cy={ty} p={clamp01((N - (it.at + FLY)) / 16)} r={ITEM_SIZE * 0.5} /> : null}
              <div style={{position: 'absolute', inset: 0, opacity: op, transform: `translate(${(px - tx).toFixed(2)}px, ${(py - ty).toFixed(2)}px) scale(${scale.toFixed(3)})`, transformOrigin: `${tx}px ${ty}px`}}>
                <ItemGlyph kind={it.kind} cx={tx} cy={ty} size={ITEM_SIZE} color={color} accent={accent} opacity={1} />
              </div>
              {/* 标签：落位时淡入；当前这一件白字，落定后回到灰 */}
              <div style={{position: 'absolute', inset: 0, opacity: softOp(N - (it.at + FLY), 8)}}>
                <CText cx={tx} cy={SLOT_Y + 72} size={24} weight={600} family={FONT_HEAVY} color={f > 0.15 ? WHITE : GREY_LIGHT} dy={-1}>
                  {it.label}
                </CText>
              </div>
            </React.Fragment>
          );
        })}
      </CameraRig>
    </div>
  );
};
