import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, type CamKey} from '../../fx';
import {exitOp} from '../../ui';
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
  CrateItem,
  KitchenMap,
  KnifeItem,
  LABELS,
  MapCallout,
  NoteItem,
  SocketItem,
  curK,
  dimK,
} from './parts';

/**
 * SC56 插座 · 木箱｜13829–14084（256 帧）
 * 同一张地图，整体 1.0→1.05 慢推（到 14042 末拍落位后停住，运镜不进末拍）：
 *   13837 墙上的标准插座 → 13871 「MCP」
 *   13919 地上的整只木箱 → 13950 「Plugin」
 *   14028 起 14 帧：十枚标签（含 Agent 胶囊）同步变灰，紫光/聚光圈/引线光点全部收掉，
 *   只留白描边的完整厨房地图。之后静止 34 帧，最后 8 帧淡出。
 */
const F0 = 13829;
const TO = 14084;

const CAM: CamKey[] = [
  {f: F0, x: 640, y: 360, s: 1},
  {f: 14042, x: 640, y: 360, s: 1.05},
  {f: TO, x: 640, y: 360, s: 1.05},
];

export const SC56: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const dim = dimK(N);
  const alarmCur = curK(N, AT.alarm, AT.socket);
  const socketCur = curK(N, AT.socket, AT.crate);
  const crateCur = curK(N, AT.crate, AT.dim);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        <KitchenMap N={N} whiteK={1} />

        <ChefOnMap N={N} f={AT.chef} cur={0} glowK={0} />
        <ChefRings N={N} f={AT.chef} pulse={0} feetAccent={0} topAccent={0} />
        <BrainOnMap N={N} f={AT.brain} />
        <AgentLink N={N} cur={0} dim={dim} />

        <BadgeItem N={N} cur={0} dim={dim} />
        <KnifeItem N={N} cur={0} dim={dim} />
        <CardBoxItem N={N} cur={0} dim={dim} />
        <NoteItem N={N} cur={0} dim={dim} />
        <BellItem N={N} cur={0} dim={dim} />
        <AlarmItem N={N} cur={alarmCur} dim={dim} />

        {/* 本镜两件 */}
        <SocketItem N={N} cur={socketCur} dim={dim} />
        <CrateItem N={N} cur={crateCur} dim={dim} />

        <MapCallout N={N} f={AT.llm} spec={LABELS.llm} cur={0} dim={dim} />
        <MapCallout N={N} f={AT.prompt} spec={LABELS.prompt} cur={0} dim={dim} />
        <MapCallout N={N} f={AT.tool} spec={LABELS.tool} cur={0} dim={dim} />
        <MapCallout N={N} f={AT.skill} spec={LABELS.skill} cur={0} dim={dim} />
        <MapCallout N={N} f={AT.memory} spec={LABELS.memory} cur={0} dim={dim} />
        <MapCallout N={N} f={AT.command} spec={LABELS.command} cur={0} dim={dim} />
        <MapCallout N={N} f={AT.hook} spec={LABELS.hook} cur={alarmCur} dim={dim} />
        <MapCallout N={N} f={AT.mcp} spec={LABELS.mcp} cur={socketCur} dim={dim} />
        <MapCallout N={N} f={AT.plugin} spec={LABELS.plugin} cur={crateCur} dim={dim} />

        <AgentPill N={N} f={AT.agentTag} dim={dim} />
      </CameraRig>
    </div>
  );
};
