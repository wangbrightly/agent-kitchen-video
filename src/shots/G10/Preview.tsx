import React from 'react';
import {Stage} from '../../Main';
import {SHOTS_OVERLAY, SHOTS_OVERLAY_TOP, BG_OVERLAY} from '../../overlay';
import {SHOTS_G10, BG_G10, FOOTAGE_G10} from './index';
export const PreviewG10: React.FC = () => <Stage shots={[...SHOTS_OVERLAY, ...SHOTS_G10, ...SHOTS_OVERLAY_TOP]} bg={[...BG_OVERLAY, ...BG_G10]} footage={FOOTAGE_G10} />;
