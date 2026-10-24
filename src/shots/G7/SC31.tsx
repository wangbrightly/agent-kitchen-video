import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {ChefIcon} from '../../icons';
import {GREY_LIGHT, MonoText, PURPLE_LIGHT, WHITE, abs, exitOp, glowOffK, softOp} from '../../ui';
import {clamp01, powOutRemain, slideIn} from '../../common';
import {Caret, DashPolyline, GlowDot, TICKET_STROKE, TicketCard, TypeBar, polyLen, textW, typeSlice, type Pt} from './parts';

/**
 * SC31 三张单子｜7646–7853｜「“检查这个项目里的错误” / “把这段文字翻译成英文” / 人按铃 / 厨师开始工作」
 * 左侧三张 340 宽的小票斜叠（−4°/2°/6°），右侧 ChefIcon 200 起身接单，中间一条虚线把票送到厨师手上。
 * 主角：三张小票（340×190，紫描边），讲到哪张亮哪张。
 * 配角：厨师（先灰着待命，7784 起身亮紫）、虚线连接 + 沿线跑的紫点（持续动作）。
 * 运镜：视差 —— 票层（近）与厨师层（远）以不同速率缓慢左移放大，7800 停（不进末拍）。
 * 无 GlitchIn（不在白名单）；末拍 7810 落位，7845 起淡出，稳定 35 帧。
 */
const F0 = 7646;
const TO = 7853;

const W = 340;
const H = 190;

// 票：t0 落在各句字幕起点 −3 帧
const TK = [
  {x: 175, y: 196, rot: -4, head: '/检查错误', t0: 7651, bars: [252, 214, 156]},
  {x: 315, y: 272, rot: 2, head: '/翻译', t0: 7706, bars: [236, 196, 168]},
  {x: 455, y: 348, rot: 6, head: '/整理数据', t0: 7775, bars: [248, 210, 148]},
];

const CHEF = {cx: 930, cy: 355, size: 200, t0: 7784};

// 虚线：从最外一张票的右沿送到厨师右手
const LINK: Pt[] = [
  [800, 498],
  [862, 470],
  [876, 404],
];
const LINK_LEN = polyLen(LINK);

export const SC31: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 视差：7646 起 154 帧，票层左移 30 / 放 1.03；厨师层左移 6 / 放 1.008，7800 停
  const par = clamp01((N - 7650) / 150);
  const tkShift = -30 * par;
  const tkScale = 1 + 0.03 * par;
  const chefShift = -6 * par;
  const chefScale = 1 + 0.008 * par;

  // 厨师：先灰着待命，7784 起身 + 变白 + 紫光
  const chefN = N - CHEF.t0;
  const rise = 46 * powOutRemain(chefN, 21, 2.6);
  const chefOp = 0.2 + 0.8 * softOp(chefN, 8);
  const chefGlow = clamp01(chefN / 12);

  // 虚线：7775 起 22 帧 draw-on
  const linkP = clamp01((N - 7775) / 22);

  // 沿线跑的光点：7800 起每 44 帧一趟，到达时厨师手上闪一下
  const runP = N < 7800 ? 0 : (((N - 7800) % 44) + 1) / 44;
  const dotOn = linkP >= 1;
  const dotAt: Pt = (() => {
    const target = LINK_LEN * clamp01(runP);
    let acc = 0;
    for (let i = 1; i < LINK.length; i++) {
      const [ax, ay] = LINK[i - 1];
      const [bx, by] = LINK[i];
      const L = Math.hypot(bx - ax, by - ay);
      if (acc + L >= target) {
        const k = L > 0 ? (target - acc) / L : 0;
        return [ax + (bx - ax) * k, ay + (by - ay) * k] as Pt;
      }
      acc += L;
    }
    return LINK[LINK.length - 1];
  })();
  const arrive = dotOn ? Math.sin(Math.PI * clamp01((runP - 0.78) / 0.22)) : 0;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* 远层：厨师 */}
      <div style={{position: 'absolute', inset: 0, transform: `translate(${chefShift.toFixed(2)}px, 0) scale(${chefScale.toFixed(4)})`, transformOrigin: '640px 360px'}}>
        <GlowBlob cx={CHEF.cx} cy={CHEF.cy} r={200} N={N} k={(chefGlow * off + 0.5 * arrive) * 0.5} alpha={0.2} />
        <GlowBlob cx={CHEF.cx} cy={CHEF.cy} r={132} N={N} k={(chefGlow * off + 0.5 * arrive) * 0.6} alpha={0.24} />
        <div style={{position: 'absolute', inset: 0, opacity: chefOp, transform: `translateY(${rise.toFixed(2)}px)`}}>
          <ChefIcon
            cx={CHEF.cx}
            cy={CHEF.cy}
            size={CHEF.size}
            color={chefN >= 0 ? WHITE : GREY_LIGHT}
            accent={chefN >= 0 ? PURPLE_LIGHT : '#6E6E70'}
            opacity={chefN >= 0 ? 1 : 0.7}
          />
        </div>
      </div>

      {/* 近层：三张小票 */}
      <div style={{position: 'absolute', inset: 0, transform: `translate(${tkShift.toFixed(2)}px, 0) scale(${tkScale.toFixed(4)})`, transformOrigin: '640px 360px'}}>
        {TK.map((t, i) => {
          const n = N - t.t0;
          if (n < 0) return null;
          const ease = slideIn(n, 18, 2.4);
          const op = softOp(n, 5);
          const dx = -160 * (1 - ease);
          const dy = 90 * (1 - ease);
          const rot = t.rot * ease;

          // 票头打字机：飞入后 10 帧起，每字 3 帧
          const headN = n - 10;
          const head = typeSlice(t.head, headN, 3);
          const typing = headN >= 0 && head.length < t.head.length;
          // 三条值条：票头写完后逐条填充
          const barStart = 10 + t.head.length * 3 + 4;
          const barP = t.bars.map((_, j) => clamp01((n - (barStart + j * 9)) / 8));
          const actBar = barP.findIndex((p) => p > 0 && p < 1);

          // 讲到哪张亮哪张：下一张到来的 20 帧内退成 idle
          const nextT = TK[i + 1]?.t0 ?? 1e9;
          const lit = i === TK.length - 1 ? 1 : clamp01((nextT + 8 - N) / 20);
          const stroke = lit > 0.5 ? TICKET_STROKE.live : TICKET_STROKE.idle;

          return (
            <div key={i} style={{...abs(t.x, t.y, W, H), opacity: op, transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`, transformOrigin: '50% 50%'}}>
              <TicketCard x={0} y={0} w={W} h={H} glowK={lit * 0.5 * off} stroke={stroke} headY={68}>
                <MonoText x={22} y={18} size={28} color={lit > 0.5 ? PURPLE_LIGHT : GREY_LIGHT} opacity={0.55 + 0.45 * lit}>
                  {head}
                </MonoText>
                <div style={{...abs(W - 52, 22, 12, 12), borderRadius: 2, border: `1.5px solid ${stroke}`, opacity: 0.75}} />
                {t.bars.map((bw, j) => (
                  <TypeBar key={j} x={22} y={100 + j * 30} w={bw} p={barP[j]} h={5} color={GREY_LIGHT} opacity={0.55 + 0.3 * lit} />
                ))}
                {typing ? <Caret x={22 + textW(head, 28)} y={14} N={N} h={30} /> : null}
                {!typing && actBar >= 0 ? <Caret x={24 + t.bars[actBar] * barP[actBar]} y={94 + actBar * 30} N={N} h={16} /> : null}
              </TicketCard>
            </div>
          );
        })}

        {/* 虚线连接：票 → 厨师 */}
        {linkP > 0 ? <DashPolyline pts={LINK} p={linkP} color={PURPLE_LIGHT} sw={2.2} opacity={0.85} /> : null}
        {dotOn ? <GlowDot cx={dotAt[0]} cy={dotAt[1]} r={5} color={WHITE} opacity={0.95} /> : null}
      </div>
    </div>
  );
};
