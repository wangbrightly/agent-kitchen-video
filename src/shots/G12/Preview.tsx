import React from 'react';
import {Stage} from '../../Main';
import {SHOTS_OVERLAY, SHOTS_OVERLAY_TOP, BG_OVERLAY} from '../../overlay';
import {SHOTS_G12, BG_G12, FOOTAGE_G12} from './index';
export const PreviewG12: React.FC = () => <Stage shots={[...SHOTS_OVERLAY, ...SHOTS_G12, ...SHOTS_OVERLAY_TOP]} bg={[...BG_OVERLAY, ...BG_G12]} footage={FOOTAGE_G12} />;
