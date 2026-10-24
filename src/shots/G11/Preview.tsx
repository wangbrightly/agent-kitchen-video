import React from 'react';
import {Stage} from '../../Main';
import {SHOTS_OVERLAY, SHOTS_OVERLAY_TOP, BG_OVERLAY} from '../../overlay';
import {SHOTS_G11, BG_G11, FOOTAGE_G11} from './index';
export const PreviewG11: React.FC = () => <Stage shots={[...SHOTS_OVERLAY, ...SHOTS_G11, ...SHOTS_OVERLAY_TOP]} bg={[...BG_OVERLAY, ...BG_G11]} footage={FOOTAGE_G11} />;
