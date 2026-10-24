import React from 'react';
import {Stage} from '../../Main';
import {SHOTS_OVERLAY, SHOTS_OVERLAY_TOP, BG_OVERLAY} from '../../overlay';
import {SHOTS_G9, BG_G9, FOOTAGE_G9} from './index';
export const PreviewG9: React.FC = () => <Stage shots={[...SHOTS_OVERLAY, ...SHOTS_G9, ...SHOTS_OVERLAY_TOP]} bg={[...BG_OVERLAY, ...BG_G9]} footage={FOOTAGE_G9} />;
