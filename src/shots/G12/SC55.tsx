import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, type CamKey} from '../../fx';
import {
  AT,
  AgentLink,
  AgentPill,
  AlarmItem,
  BadgeItem,
  BellItem,
  BrainOnMap,
  CardBoxItem,
  ChefOnMap,
  ChefRings,
  KitchenMap,
  KnifeItem,
  LABELS,
  MapCallout,
  NoteItem,
  curK,
  exitOpEase,
} from './parts';

/**
 * SC55 记忆 · 命令 · 钩子｜13561–13828（268 帧）
 * 与 SC54 同一张白描边地图，切回全景 1.0（SC54 推近后的新机位，硬切换景别）：
 *   13569 冰箱门上的便签 → 13602 「Memory」
 *   13645 台面右段的铜铃 → 13668 「Command」
 *   13716 墙上的烟感与恒温器 → 13766 「Hook」
 * 当前项紫描边 + 聚光虚线圈 + 柔光；烟感的表盘扫描线一直转（分镜「探针持续扫」）。
 */
const F0 = 13561;
const TO = 13828;

const CAM: CamKey[] = [{f: F0, x: 640, y: 360, s: 1}];

export const SC55: React.FC = () => {
  const N = useCurrentFrame() + F0;

  const cardCur = curK(N, AT.cardbox, AT.note);
  const noteCur = curK(N, AT.note, AT.bell);
  const bellCur = curK(N, AT.bell, AT.alarm);
  const alarmCur = curK(N, AT.alarm, AT.socket);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOpEase(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        <KitchenMap N={N} whiteK={1} />

        <ChefOnMap N={N} f={AT.chef} cur={0} glowK={0} />
        <ChefRings N={N} f={AT.chef} pulse={0} feetAccent={0} topAccent={0} />
        <BrainOnMap N={N} f={AT.brain} />
        <AgentLink N={N} cur={0} dim={0} />

        {/* SC54 的三件继续留在图上（已点亮、无光） */}
        <BadgeItem N={N} cur={0} dim={0} />
        <KnifeItem N={N} cur={0} dim={0} />
        <CardBoxItem N={N} cur={cardCur} dim={0} />

        {/* 本镜三件 */}
        <NoteItem N={N} cur={noteCur} dim={0} />
        <BellItem N={N} cur={bellCur} dim={0} />
        <AlarmItem N={N} cur={alarmCur} dim={0} />

        <MapCallout N={N} f={AT.llm} spec={LABELS.llm} cur={0} dim={0} />
        <MapCallout N={N} f={AT.prompt} spec={LABELS.prompt} cur={0} dim={0} />
        <MapCallout N={N} f={AT.tool} spec={LABELS.tool} cur={0} dim={0} />
        <MapCallout N={N} f={AT.skill} spec={LABELS.skill} cur={cardCur} dim={0} />
        <MapCallout N={N} f={AT.memory} spec={LABELS.memory} cur={noteCur} dim={0} />
        <MapCallout N={N} f={AT.command} spec={LABELS.command} cur={bellCur} dim={0} />
        <MapCallout N={N} f={AT.hook} spec={LABELS.hook} cur={alarmCur} dim={0} />

        <AgentPill N={N} f={AT.agentTag} dim={0} />
      </CameraRig>
    </div>
  );
};
