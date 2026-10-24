import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SocketIcon} from '../../icons';
import {Svg} from '../../ui';
import {GREY, GREY_LIGHT, GREY_LINE, GREY_MID, RED_DEEP, exitOp, softOp} from '../../ui';
import {clamp01} from '../../common';
import {IdleArcs, KitchenMini, OddPlug, PlugOutline, StrikeX, type PlugShape} from './parts';

/**
 * SC46 没有工具、也没有统一连接方式，厨房只能反复改造｜11213–11454｜第 5 章章末收束
 * 冷灰画面：上排一只空插座 + 一只虚线空插头，中间三枚虚线弧一直在空转（接不上）；
 * 下排四种形状不对的插头，各被一道红叉否掉；右下角迷你厨房线稿被两次拆改抖动。
 * 节拍：11221 没有工具 / 11238 插座接不出任何动作 / 11309 没有统一的连接方式 /
 *       11355 每接一家外部服务都要重新改造厨房。
 * 主角：空插座（260，墨迹约 177px）—— 本片唯一不加紫光的例外（章末否定段落，红叉是唯一彩色）。
 */
const F0 = 11213;
const TO = 11454;

const SOCK = {cx: 430, cy: 315, size: 260};
const EMPTY_PLUG = {cx: 800, cy: 315, size: 190};
const SHAPES: PlugShape[] = ['round', 'square', 'wide', 'angled'];
const ODD = SHAPES.map((shape, i) => ({shape, cx: 205 + i * 210, cy: 505, size: 114}));

export const SC46: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // ---- 上排：空插座 / 虚线空插头 ----
  const sockN = N - 11218;
  const sockS = clamp01(sockN / 21);
  const sockOp = sockN < 0 ? 0 : clamp01(0.12 + 1.7 * sockS);
  const topDim = 1 - 0.42 * clamp01((N - 11309) / 16);

  const plugN = N - 11238;
  const plugOp = softOp(plugN, 10);
  const plugX = EMPTY_PLUG.cx + 46 * (1 - clamp01(plugN / 16));

  const arcN = N - 11244;

  // ---- 下排：四种形状不对的插头 + 红叉 ----
  const kitchenN = N - 11352;
  const kitchenOp = softOp(kitchenN, 12);
  // 两次拆改抖动（每次 6 帧）
  const shake1 = clamp01((N - 11376) / 6);
  const shake2 = clamp01((N - 11400) / 6);
  const shake = (N >= 11376 && N < 11382 ? Math.sin(shake1 * Math.PI) : 0) + (N >= 11400 && N < 11406 ? Math.sin(shake2 * Math.PI) : 0);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {/* ================= 上排 ================= */}
      <div style={{position: 'absolute', inset: 0, opacity: topDim}}>
        {sockN >= 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: sockOp, transform: `scale(${sockS.toFixed(3)})`, transformOrigin: `${SOCK.cx}px ${SOCK.cy}px`}}>
            <SocketIcon cx={SOCK.cx} cy={SOCK.cy} size={SOCK.size} color={GREY_LIGHT} accent={GREY_MID} />
          </div>
        )}

        {plugOp > 0.01 && (
          <div style={{position: 'absolute', inset: 0, opacity: plugOp * 0.9}}>
            <PlugOutline cx={plugX} cy={EMPTY_PLUG.cy} size={EMPTY_PLUG.size} color={GREY} />
          </div>
        )}

        {/* 三枚空转虚线弧：一直在转，但什么都没接上 */}
        {arcN >= 0 && <IdleArcs cx={632} cy={315} r={66} n={arcN} period={40} color={GREY_LIGHT} opacity={0.62} />}
      </div>

      {/* ================= 下排 ================= */}
      {ODD.map((p, i) => {
        const n = N - (11309 + i * 2);
        if (n < 0) return null;
        const k = softOp(n, 8);
        return (
          <div key={p.shape} style={{position: 'absolute', inset: 0, opacity: k, transform: `translateY(${((1 - clamp01(n / 12)) * -12).toFixed(1)}px)`}}>
            <OddPlug shape={p.shape} cx={p.cx} cy={p.cy} size={p.size} color={GREY} />
          </div>
        );
      })}
      {/* 四道红叉（唯一彩色）：11313 起 2 帧错峰，各 12 帧画出 */}
      <Svg bloom={false}>
        {ODD.map((p, i) => {
          const xp = clamp01((N - (11313 + i * 2)) / 12);
          if (xp <= 0) return null;
          return <StrikeX key={p.shape} cx={p.cx} cy={p.cy} size={104} p={xp} color={RED_DEEP} sw={6} />;
        })}
      </Svg>

      {/* 右下角：迷你厨房线稿（被反复拆改） */}
      <div style={{position: 'absolute', inset: 0, opacity: kitchenOp}}>
        <KitchenMini x={955} y={330} w={260} h={200} opacity={1} shake={shake} />
      </div>

      {/* 下排的地面基线 */}
      <div style={{position: 'absolute', left: 140, top: 578, width: 860 * clamp01((N - 11312) / 20), height: 1.2, background: GREY_LINE, opacity: 0.4}} />
    </div>
  );
};
