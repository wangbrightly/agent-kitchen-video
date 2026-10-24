import React from 'react';
import {Stage} from '../../Main';
import {SHOTS_OVERLAY, SHOTS_OVERLAY_TOP, BG_OVERLAY} from '../../overlay';
import {SHOTS_G13, BG_G13, FOOTAGE_G13} from './index';
export const PreviewG13: React.FC = () => <Stage shots={[...SHOTS_OVERLAY, ...SHOTS_G13, ...SHOTS_OVERLAY_TOP]} bg={[...BG_OVERLAY, ...BG_G13]} footage={FOOTAGE_G13} />;
