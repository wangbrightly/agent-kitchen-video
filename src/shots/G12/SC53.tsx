import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CameraRig, type CamKey} from '../../fx';
import {exitOp, glowOffK} from '../../ui';
import {GlitchIn, clamp01, easeInOutPow} from '../../common';
import {AT, AgentLink, AgentPill, BrainOnMap, ChefOnMap, ChefRings, KitchenMap, LABELS, MapCallout, curK} from './parts';

/**
 * SC53 把所有东西放回厨房｜13036–13273｜第 7 章开场（238 帧）
 * 承接上一镜的厨房姿态：先是一整张灰线稿，13044 起 30 帧整幅由灰转白；
 * 13109 厨师点亮（Agent 胶囊 + 头顶/脚下的慢脉冲圈）→ 13170 脑落进头顶空圈
 * → 13192 「LLM」标签 + Agent→脑 的主引线（引线上持续跑紫点）。
 * 主角：厨师 ChefIcon 210（紫柔光）；当前项换到脑时，头顶圈转紫。
 * 唯一 GlitchIn：Agent（本组白名单只有这一处）。无 LightSweep / StageLine / GhostText。
 */
const F0 = 13036;
const TO = 13273;
const WHITE0 = 13044; // S160「现在」块首：整幅开始由灰转白

const CAM: CamKey[] = [{f: F0, x: 640, y: 360, s: 1}];

export const SC53: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const off = glowOffK(N, TO, 6, 8);

  // 13044（S160 块首）起 30 帧：灰 → 白。两层同源线稿交叉淡入，几何不动
  const whiteK = easeInOutPow(2.2)(clamp01((N - WHITE0) / 30)); // 13044 → 13074

  // 当前项：厨师 13109 → 13282（SC54 胸牌）；脑 13170 → 13282
  const chefCur = curK(N, AT.chef, AT.badge);
  const brainCur = curK(N, AT.brain, AT.badge);
  const chefGlow = clamp01((N - AT.chef) / 14) * off;
  const llmCur = curK(N, AT.brain, AT.badge);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: exitOp(N, TO, 8)}}>
      <CameraRig N={N} keys={CAM}>
        <KitchenMap N={N} whiteK={whiteK} />

        {/* 厨师 + 柔光 + 两个慢脉冲圈 */}
        <ChefOnMap N={N} f={AT.chef} cur={chefCur} glowK={chefGlow} />
        <ChefRings N={N} f={AT.chef} pulse={1} feetAccent={chefCur} topAccent={brainCur} />

        {/* 脑：13170 落进头顶空圈；白描边，焦点靠头顶圈转紫来给 */}
        <BrainOnMap N={N} f={AT.brain} />

        {/* Agent → 脑 的主引线 */}
        <AgentLink N={N} cur={brainCur} dim={0} />

        {/* LLM 标签 + 引线 */}
        <MapCallout N={N} f={AT.llm} spec={LABELS.llm} cur={llmCur} dim={0} />

        {/* Agent 胶囊：本组唯一 GlitchIn */}
        <GlitchIn N={N} f0={AT.agentTag - 2} rgbSplit={4} slices={3} seed={53}>
          <AgentPill N={N} f={AT.agentTag} dim={0} />
        </GlitchIn>
      </CameraRig>
    </div>
  );
};
