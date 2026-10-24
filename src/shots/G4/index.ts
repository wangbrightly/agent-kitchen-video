// 构建组 G4 的镜头清单（SC15–SC18，《AI 厨房》第 2 章的"工具调用"段）
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC15} from './SC15';
import {SC16} from './SC16';
import {SC17} from './SC17';
import {SC18} from './SC18';

export const SHOTS_G4: ShotDef[] = [
  {id: 'SC15', from: 3645, to: 3842, Comp: SC15},
  {id: 'SC16', from: 3843, to: 4008, Comp: SC16},
  {id: 'SC17', from: 4009, to: 4241, Comp: SC17},
  {id: 'SC18', from: 4242, to: 4352, Comp: SC18},
];

export const BG_G4: BgSpec[] = [];
export const FOOTAGE_G4: FootageSpec[] = [];
