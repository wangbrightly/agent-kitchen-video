import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlowBlob} from '../../fx';
import {Box, CText, GREY, GREY_LINE, GREY_MID, PURPLE_LIGHT, WHITE, exitOp, mixHex, scaleIn, softOp} from '../../ui';
import {clamp01} from '../../common';
import {DigitalIcon} from './parts';

/**
 * SC14 五件数字工具｜3437–3644｜「读取文件、搜索网页、运行代码、查询数据库、发送邮件。」
 * 主区 y175–620（顶部 rail 由 overlay 画，本镜头不碰）。
 * 主角：当前那一枚数字工具，140 框 × 1.25 = 175，紫描边 + 紫柔光。
 * 配角：五枚 140 灰框（文件 / 网页 / 终端 / 数据库 / 邮件）+ 26px 中文标签。
 * 出现帧：3445+3i 五枚错峰 scaleIn；点亮 3445 / 3481 / 3523 / 3559 / 3594（末枚 6 帧收口，保末拍 30 帧）。
 * 持续：已点亮图标内部一条 40 帧往返的扫描线。
 */
const F0 = 3437;
const TO = 3644;

const ITEMS: Array<{kind: 'file' | 'web' | 'terminal' | 'db' | 'mail'; label: string; x: number; entry: number; lit: number; next: number}> = [
  {kind: 'file', label: '读取文件', x: 220, entry: 3445, lit: 3445, next: 3481},
  {kind: 'web', label: '搜索网页', x: 420, entry: 3448, lit: 3481, next: 3523},
  {kind: 'terminal', label: '运行代码', x: 620, entry: 3451, lit: 3523, next: 3559},
  {kind: 'db', label: '查询数据库', x: 820, entry: 3454, lit: 3559, next: 3594},
  {kind: 'mail', label: '发送邮件', x: 1020, entry: 3457, lit: 3594, next: 9999},
];

const BOX = 140;

export const SC14: React.FC = () => {
  const N = useCurrentFrame() + F0;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      {ITEMS.map((it, i) => {
        const en = N - it.entry;
        if (en < 0) return null;
        const s = scaleIn(en, 16);
        const op = softOp(en, 10);
        // 末枚 6 帧收口，其余 11 帧（保证离场前留够 30 帧稳定期）
        const litLen = i === ITEMS.length - 1 ? 6 : 11;
        const k = clamp01((N - it.lit) / litLen) * (1 - clamp01((N - it.next) / 11));
        const color = mixHex(GREY_MID, PURPLE_LIGHT, k);
        const stroke = mixHex(GREY_LINE, PURPLE_LIGHT, k);
        const labelColor = mixHex(GREY, WHITE, k);
        const scale = (1 + 0.25 * k) * s;
        const top = 400 - BOX / 2;
        // 扫描线：40 帧往返一次（只出现在已点亮的框内）
        const tri = ((N - it.lit) % 40) / 40;
        const scanT = tri < 0.5 ? tri * 2 : 2 - tri * 2;

        return (
          <React.Fragment key={it.kind}>
            {k > 0.02 && <GlowBlob cx={it.x} cy={400} r={104} k={k} alpha={0.34} />}
            <div style={{position: 'absolute', inset: 0, opacity: op, transform: `scale(${scale.toFixed(3)})`, transformOrigin: `${it.x}px 400px`}}>
              <Box x={it.x - BOX / 2} y={top} w={BOX} h={BOX} r={10} fill="#000" stroke={stroke} sw={k > 0.02 ? 2.6 : 1.8} />
              <DigitalIcon cx={it.x} cy={400} size={84} kind={it.kind} color={color} accent={color} />
              {/* 扫描线：裁剪在框内 */}
              <div style={{position: 'absolute', left: it.x - BOX / 2 + 5, top: top + 5, width: BOX - 10, height: BOX - 10, borderRadius: 8, overflow: 'hidden', opacity: k * 0.9}}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: (BOX - 10 - 3) * scanT,
                    width: '100%',
                    height: 3,
                    background: `linear-gradient(90deg, rgba(161,117,241,0) 0%, ${PURPLE_LIGHT} 22%, ${PURPLE_LIGHT} 78%, rgba(161,117,241,0) 100%)`,
                    boxShadow: '0 0 8px 2px rgba(102,45,248,.6)',
                  }}
                />
              </div>
            </div>
            {/* 标签不参与放大，五行基线始终对齐 */}
            <CText cx={it.x} cy={512} size={26} weight={700} color={labelColor} letterSpacing={2} opacity={0.96 * op}>
              {it.label}
            </CText>
          </React.Fragment>
        );
      })}
    </div>
  );
};
