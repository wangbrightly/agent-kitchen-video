import React from 'react';
import {abs, PURPLE, WHITE} from './ui';

/**
 * 本片的厨房语义图元。全部黑填充 + 白描边 3px，尺寸按 size 等比缩放（画布 1280×720）。
 * 约定：每个图元都能单独当主角（≥170px 带紫柔光），也能缩到 60–110px 当配角。
 * S(描边色, 线宽, 填充色)：填充色默认 none。
 */
type Props = {cx: number; cy: number; size?: number; color?: string; accent?: string; opacity?: number};

const S = (c: string, w = 3, fill = 'none') => ({
  stroke: c,
  strokeWidth: w,
  fill,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

const Frame: React.FC<{cx: number; cy: number; size: number; children: React.ReactNode; opacity?: number}> = ({cx, cy, size, children, opacity = 1}) => (
  <div style={{...abs(cx - size / 2, cy - size / 2, size, size), opacity}}>
    <svg width="100%" height="100%" viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {children}
    </svg>
  </div>
);

/** 大脑：两条裂沟 + 中央纵裂 */
export const BrainIcon: React.FC<Props> = ({cx, cy, size = 170, color = WHITE, accent = PURPLE, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M50 16C37 16 27 25 25 37 15 41 13 55 20 63 18 74 27 84 39 84H61C73 84 82 74 80 63 87 55 85 41 75 37 73 25 63 16 50 16Z" {...S(color, 3, '#000')} />
    <path d="M50 18V83" {...S(color, 2.4)} />
    <path d="M50 34C42 36 34 33 28 38M50 52C41 54 33 50 26 55M50 68C43 70 36 67 30 71" {...S(accent, 2.2)} />
    <path d="M50 34C58 36 66 33 72 38M50 52C59 54 67 50 74 55M50 68C57 70 64 67 70 71" {...S(color, 1.8)} />
  </Frame>
);

/** 厨师：木人偶，圆头 + 球形关节 */
export const ChefIcon: React.FC<Props> = ({cx, cy, size = 190, color = WHITE, accent = PURPLE, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <circle cx="50" cy="15" r="11" {...S(color, 3, '#000')} />
    <path d="M50 26V34" {...S(accent, 3)} />
    <rect x="34" y="34" width="32" height="30" rx="8" {...S(color, 3, '#000')} />
    <circle cx="30" cy="40" r="6.5" {...S(color, 2.4, '#000')} />
    <circle cx="70" cy="40" r="6.5" {...S(color, 2.4, '#000')} />
    <path d="M27 47 22 62M73 47 78 62" {...S(color, 3)} />
    <circle cx="22" cy="66" r="4.5" {...S(color, 2.2, '#000')} />
    <circle cx="78" cy="66" r="4.5" {...S(color, 2.2, '#000')} />
    <path d="M43 64V80M57 64V80" {...S(color, 3)} />
    <circle cx="43" cy="66" r="4" {...S(color, 2.2, '#000')} />
    <circle cx="57" cy="66" r="4" {...S(color, 2.2, '#000')} />
    <path d="M36 88H46M54 88H64" {...S(color, 3.4)} />
  </Frame>
);

/** 刀：斜刃 + 圆柄 */
export const KnifeIcon: React.FC<Props> = ({cx, cy, size = 150, color = WHITE, accent = PURPLE, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M12 66 54 40C58 37 62 40 60 45L24 72Z" {...S(color, 3, '#000')} />
    <path d="M20 63 50 45" {...S(accent, 2.2)} />
    <rect x="58" y="30" width="30" height="12" rx="6" {...S(color, 3, '#000')} transform="rotate(-32 73 36)" />
    <circle cx="86" cy="22" r="3" fill={accent} />
  </Frame>
);

/** 菜谱卡盒：盒子里插着一叠卡，只露出卡脊 */
export const CardBoxIcon: React.FC<Props> = ({cx, cy, size = 170, color = WHITE, accent = PURPLE, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    {[26, 39, 52, 65].map((x, i) => (
      <g key={x}>
        <rect x={x} y={26 + (i % 2) * 4} width="11" height="34" {...S(color, 2.2, '#000')} />
        <rect x={x + 1.5} y={22 + (i % 2) * 4} width="8" height="6" {...S(i === 1 ? accent : color, 2, i === 1 ? accent : '#000')} />
      </g>
    ))}
    <rect x="16" y="56" width="68" height="30" rx="4" {...S(color, 3, '#000')} />
    <path d="M22 66H78M22 74H62" {...S(color, 2)} />
  </Frame>
);

/** 冰箱：门上一排便签 */
export const FridgeIcon: React.FC<Props> = ({cx, cy, size = 175, color = WHITE, accent = PURPLE, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <rect x="24" y="8" width="52" height="84" rx="6" {...S(color, 3, '#000')} />
    <path d="M24 40H76" {...S(color, 2.4)} />
    <path d="M68 24V34" {...S(color, 3)} />
    {[[29, 45], [44, 47], [59, 44]].map(([x, y], i) => (
      <g key={`${x}-${y}`}>
        <rect x={x} y={y} width="15" height="17" {...S(i === 0 ? accent : color, 2.2, i === 0 ? accent : '#000')} />
        <path d={`M${x + 3} ${y + 6}H${x + 12}M${x + 3} ${y + 11}H${x + 9}`} {...S(i === 0 ? '#000' : color, 1.6)} />
      </g>
    ))}
  </Frame>
);

/** 铜铃：点菜铃 */
export const BellIcon: React.FC<Props> = ({cx, cy, size = 160, color = WHITE, accent = PURPLE, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <ellipse cx="50" cy="74" rx="34" ry="8" {...S(color, 3, '#000')} />
    <path d="M20 70C20 48 32 34 50 34S80 48 80 70Z" {...S(color, 3, '#000')} />
    <path d="M26 70C26 52 36 41 50 41" {...S(accent, 2.2)} />
    <path d="M50 34V24" {...S(color, 3)} />
    <circle cx="50" cy="19" r="6" {...S(color, 3, '#000')} />
  </Frame>
);

/** 烟感 + 恒温器：表盘、顶上铃铛、垂下探针 */
export const AlarmIcon: React.FC<Props> = ({cx, cy, size = 175, color = WHITE, accent = PURPLE, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <rect x="20" y="26" width="60" height="42" rx="4" {...S(color, 3, '#000')} />
    <circle cx="50" cy="47" r="14" {...S(accent, 2.4, '#000')} />
    <path d="M50 47 57 41" {...S(accent, 2.4)} />
    <path d="M54 22C54 15 60 12 66 12S74 17 74 22Z" {...S(color, 2.4, '#000')} />
    <path d="M50 68V88" {...S(color, 2.6)} />
    <circle cx="50" cy="92" r="5" {...S(color, 2.4, '#000')} />
  </Frame>
);

/** 标准插座板：一排孔 + 一条送料轨 */
export const SocketIcon: React.FC<Props> = ({cx, cy, size = 175, color = WHITE, accent = PURPLE, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <rect x="12" y="20" width="76" height="48" rx="5" {...S(color, 3, '#000')} />
    {[26, 44, 62].map((x, i) => (
      <g key={x}>
        <circle cx={x} cy="44" r="7.5" {...S(i === 0 ? accent : color, 2.4, '#000')} />
        <circle cx={x} cy="44" r="2" fill={i === 0 ? accent : color} />
      </g>
    ))}
    <rect x="14" y="74" width="72" height="6" rx="3" {...S(color, 2.2, '#000')} />
    <path d="M50 80V88" {...S(accent, 2.4)} />
  </Frame>
);

/** 木箱：打开的一箱家伙 */
export const CrateIcon: React.FC<Props> = ({cx, cy, size = 175, color = WHITE, accent = PURPLE, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <path d="M30 40 24 30M50 38V22M70 40 76 30" {...S(accent, 2.6)} />
    <path d="M18 46H82V86H18Z" {...S(color, 3, '#000')} />
    <path d="M18 62H82M34 46V86M66 46V86" {...S(color, 2)} />
    <path d="M18 46 10 36H74L82 46" {...S(color, 2.4, '#000')} />
  </Frame>
);

/** 岗位说明：一张写了规矩的纸 */
export const SheetIcon: React.FC<Props> = ({cx, cy, size = 170, color = WHITE, accent = PURPLE, opacity = 1}) => (
  <Frame cx={cx} cy={cy} size={size} opacity={opacity}>
    <rect x="26" y="10" width="48" height="80" rx="3" {...S(color, 3, '#000')} />
    <path d="M36 26H64M36 38H64M36 50H56" {...S(color, 2.2)} />
    <path d="M36 64 42 70 54 58" {...S(accent, 2.6)} />
    <rect x="42" y="6" width="16" height="8" rx="2" {...S(color, 2.2, '#000')} />
  </Frame>
);
