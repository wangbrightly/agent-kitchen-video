import React from 'react';
import {Composition} from 'remotion';
import {W, H, FPS, TOTAL_FRAMES} from './common';
import {Video} from './Main';
import {PreviewOverlay} from './overlay/Preview';
import {PreviewG1} from './shots/G1/Preview';
import {PreviewG2} from './shots/G2/Preview';
import {PreviewG3} from './shots/G3/Preview';
import {PreviewG4} from './shots/G4/Preview';
import {PreviewG5} from './shots/G5/Preview';
import {PreviewG6} from './shots/G6/Preview';
import {PreviewG7} from './shots/G7/Preview';
import {PreviewG8} from './shots/G8/Preview';
import {PreviewG9} from './shots/G9/Preview';
import {PreviewG10} from './shots/G10/Preview';
import {PreviewG11} from './shots/G11/Preview';
import {PreviewG12} from './shots/G12/Preview';
import {PreviewG13} from './shots/G13/Preview';

// 主合成 Video + 覆盖层预览 + 13 个构建组预览（预览合成 = 覆盖层 + 本组镜头，无音频）
export const Root: React.FC = () => (
  <>
    <Composition id="Video" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Overlay" component={PreviewOverlay} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G1" component={PreviewG1} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G2" component={PreviewG2} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G3" component={PreviewG3} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G4" component={PreviewG4} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G5" component={PreviewG5} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G6" component={PreviewG6} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G7" component={PreviewG7} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G8" component={PreviewG8} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G9" component={PreviewG9} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G10" component={PreviewG10} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G11" component={PreviewG11} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G12" component={PreviewG12} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="G13" component={PreviewG13} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
