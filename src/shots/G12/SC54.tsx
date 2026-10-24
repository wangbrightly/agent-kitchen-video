import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, type CamKey} from '../../fx';
import {exitOp} from '../../ui';
import {clamp01} from '../../common';
import {
  AT,
  AgentLink,
  AgentPill,
  BadgeItem,
  BrainOnMap,
  CardBoxItem,
  ChefOnMap,
  ChefRings,
  KitchenMap,
  KnifeItem,
  LABELS,
  MapCallout,
  curK,
} from './parts';

/**
 * SC54 岗位 · 工具 · 技能｜13274–13560（287 帧）
 * 地图保持不动（白描边），推近到 (640,400) 1.12（13278 起 30 帧）：
 *   13282 胸牌（SheetIcon 70）→ 13325 「系统提示词」
 *   13379 右手上的刀 → 13419 「Tool」
 *   13449 台面左边的菜谱盒 → 13495 「Skill」
 * 每件 11 帧由灰点亮；当前项 = 紫描边 + 聚光虚线圈 + 柔光 + 标签紫下划线，上一件同时让位。
 * 持续动作：当前项的虚线圈慢转、引线上的紫点沿弧长跑、已点亮标签的下划线 54 帧呼吸。
 */
const F0 = 13274;
const TO = 13560;

const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 13278, x: 640, y: 360, s: 1},
  {f: 13308, x: 640, y: 400, s: 1.12},
  {f: TO, x: 640, y: 400, s: 1.12},
];

export const SC54: React.FC = () => {
  const N = useCurrentFrame() + F0;

  const chefCur = curK(N, AT.chef, AT.badge);
  const badgeCur = curK(N, AT.badge, AT.knife);
  const knifeCur = curK(N, AT.knife, AT.cardbox);
  const cardCur = curK(N, AT.cardbox, AT.note);
  // SC53 的厨师柔光延续到胸牌点亮，再用 14 帧让位
  const chefGlow = 1 - clamp01((N - AT.badge) / 14);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        <KitchenMap N={N} whiteK={1} />

        <ChefOnMap N={N} f={AT.chef} cur={chefCur} glowK={chefGlow} />
        <ChefRings N={N} f={AT.chef} pulse={0} feetAccent={chefCur} topAccent={0} />
        <BrainOnMap N={N} f={AT.brain} />
        <AgentLink N={N} cur={0} dim={0} />

        {/* 三件：胸牌 / 刀 / 菜谱盒 */}
        <BadgeItem N={N} cur={badgeCur} dim={0} />
        <KnifeItem N={N} cur={knifeCur} dim={0} />
        <CardBoxItem N={N} cur={cardCur} dim={0} />

        {/* 标签：每枚在自己的字幕块首出现 */}
        <MapCallout N={N} f={AT.llm} spec={LABELS.llm} cur={0} dim={0} />
        <MapCallout N={N} f={AT.prompt} spec={LABELS.prompt} cur={badgeCur} dim={0} />
        <MapCallout N={N} f={AT.tool} spec={LABELS.tool} cur={knifeCur} dim={0} />
        <MapCallout N={N} f={AT.skill} spec={LABELS.skill} cur={cardCur} dim={0} />

        <AgentPill N={N} f={AT.agentTag} dim={0} />
      </CameraRig>
    </div>
  );
};
