import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, GlowBlob, type CamKey} from '../../fx';
import {Box, GREY_LIGHT, GREY_LINE, PURPLE, PURPLE_LIGHT, WHITE, exitOp, glowOffK, mixHex, softOp} from '../../ui';
import {FONT_HEAVY, FONT_ORB, clamp01} from '../../common';
import {BigCard} from './parts';

/**
 * SC21 技能是一整套流程｜5006–5271
 * 四张卡沿用 SC20 的落位；中间那张（程序错误）被推近到画面中心并翻面，背面是四步流程。
 * 主角：翻面后的流程卡 250×170（相机推近到 1.33 后屏幕 ≈332×226）；四节点紫描边。
 * 运镜：5014–5044 推近 (640,360,1) → (535,385,1.33)，结束在翻面前。
 * 节拍：5057 翻面（S64 块首 5063 的 −6）/ 5115 先做什么 / 5143 再做什么 / 5170 异常 / 5205 交付。
 * 持续动作：流程骨架 draw-on、节点依次落位、连线光点循环；无 GlitchIn。
 */
const F0 = 5006;
const TO = 5271;

const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 5014, x: 640, y: 360, s: 1},
  {f: 5044, x: 535, y: 385, s: 1.33},
  {f: TO, x: 535, y: 385, s: 1.33},
];

const OTHERS = [
  {title: '如何整理一份表格', x: 255},
  {title: '如何生成一份周报', x: 815},
  {title: '如何处理一封客户投诉', x: 1095},
];

const STEPS = [
  {label: '先做什么', f0: 5115},
  {label: '再做什么', f0: 5143},
  {label: '遇到异常怎么办', f0: 5170},
  {label: '最后如何交付结果', f0: 5205},
];

// 流程卡的世界坐标（卡面 250×170 @ (535,385)）
const CARD_X = 410;
const CARD_Y = 300;
const CARD_W = 250;
const CARD_H = 170;
// 卡内局部坐标（Box 子元素相对卡面左上角）
const NODE_X = 42;
const ROWS = [32, 68, 104, 140];
const LABEL_X = 62;

export const SC21: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  const dim = 1 - 0.88 * clamp01((N - 5014) / 14);
  const flipP = clamp01((N - 5057) / 12);
  const sx = Math.abs(Math.cos(Math.PI * flipP));
  const showBack = flipP >= 0.5;
  const glowK = clamp01((N - 5014) / 12) * off;

  // 连线光点：5205 后每 60 帧跑一趟
  const dotN = N - 5205;
  const dotT = dotN < 0 ? 0 : (dotN % 60) / 60;
  const dotY = ROWS[0] + (ROWS[3] - ROWS[0]) * dotT;

  // 翻面后先把流程骨架画出来（5069–5099），四节点再依次落位
  const spineP = clamp01((N - 5069) / 30);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        {/* 台面线（与 SC20 同一条世界线） */}
        <div style={{position: 'absolute', left: 100, top: 470, width: 1080, height: 1.4, background: GREY_LINE, opacity: 0.34}} />

        {/* 其余三张卡：让位、变暗；最右那张随推近淡出，避免在画布右缘留下白边碎片 */}
        {OTHERS.map((c) => {
          const edgeFade = c.x === 1095 ? 1 - clamp01((N - 5014) / 24) : 1;
          return (
            <div key={c.title} style={{position: 'absolute', left: c.x - 125, top: 385 - 85, width: 250, height: 170, opacity: 0.9 * dim * edgeFade}}>
              <BigCard w={250} h={170} title={c.title} chars={c.title.length} titleSize={22} lineFill={[1, 1, 1]} />
            </div>
          );
        })}

        {/* 主角卡：原位翻面（相机负责推近，翻面只做 scaleX） */}
        <GlowBlob cx={535} cy={385} r={210} N={N} k={glowK} alpha={0.2} />
        <GlowBlob cx={535} cy={385} r={145} N={N} k={glowK} alpha={0.24} />
        <div
          style={{
            position: 'absolute',
            left: CARD_X,
            top: CARD_Y,
            width: CARD_W,
            height: CARD_H,
            transform: `scaleX(${sx.toFixed(4)})`,
            transformOrigin: '50% 50%',
          }}
        >
          {!showBack ? (
            <BigCard
              w={CARD_W}
              h={CARD_H}
              title="如何排查一个程序错误"
              chars={10}
              titleSize={22}
              lineFill={[1, 1, 1]}
              active
              glowK={0}
            />
          ) : (
            <Box x={0} y={0} w={CARD_W} h={CARD_H} r={10} fill="#000" stroke={PURPLE_LIGHT} sw={2}>
              {/* 流程骨架 */}
              {N >= 5069 && (
                <div style={{position: 'absolute', left: NODE_X - 1, top: ROWS[0] + 10, width: 2, height: (ROWS[3] - 10 - (ROWS[0] + 10)) * spineP, background: GREY_LINE, opacity: 0.75}} />
              )}

              {/* 四步流程：节点 + 标签 + 连接线 */}
              {STEPS.map((st, i) => {
                const n = N - st.f0;
                if (n < 0) return null;
                const nextF = STEPS[i + 1]?.f0 ?? TO;
                const activeK = clamp01(n / 11) * (1 - clamp01((N - nextF) / 11));
                const nodeS = 0.45 + 0.55 * softOp(n, 12);
                const labelOp = softOp(n, 8);
                const nodeFill = mixHex('#000000', PURPLE, activeK);
                const labelCol = mixHex(GREY_LIGHT, WHITE, activeK);
                return (
                  <React.Fragment key={st.label}>
                    {i > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: NODE_X - 1,
                          top: ROWS[i - 1] + 10,
                          width: 2,
                          height: (ROWS[i] - 10 - (ROWS[i - 1] + 10)) * clamp01((N - st.f0) / 12),
                          background: PURPLE,
                          opacity: 0.9,
                        }}
                      />
                    )}
                    {/* 节点圆 */}
                    <div
                      style={{
                        position: 'absolute',
                        left: NODE_X - 10,
                        top: ROWS[i] - 10,
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        background: nodeFill,
                        border: `2px solid ${PURPLE_LIGHT}`,
                        transform: `scale(${nodeS.toFixed(3)})`,
                        transformOrigin: '50% 50%',
                        boxShadow: activeK > 0.05 ? '0 0 12px rgba(161,117,241,.65)' : undefined,
                      }}
                    >
                      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_ORB, fontSize: 11, fontWeight: 700, color: WHITE}}>{i + 1}</div>
                    </div>
                    {/* 步骤标签 */}
                    <div
                      style={{
                        position: 'absolute',
                        left: LABEL_X,
                        top: ROWS[i] - 11,
                        width: 175,
                        fontFamily: FONT_HEAVY,
                        fontSize: 19,
                        fontWeight: 600,
                        lineHeight: '22px',
                        color: labelCol,
                        opacity: labelOp,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {st.label}
                    </div>
                  </React.Fragment>
                );
              })}

              {/* 连线光点 */}
              {N >= 5205 && (
                <div style={{position: 'absolute', left: NODE_X - 3, top: dotY - 3, width: 6, height: 6, borderRadius: 3, background: WHITE, boxShadow: '0 0 8px 2px rgba(161,117,241,.85)'}} />
              )}
            </Box>
          )}
        </div>
      </CameraRig>
    </div>
  );
};
