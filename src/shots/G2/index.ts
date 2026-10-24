// 构建组 G2 的镜头清单（SC06–SC09，《AI 厨房》第 1 章下半）
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC06} from './SC06';
import {SC07} from './SC07';
import {SC08} from './SC08';
import {SC09} from './SC09';

export const SHOTS_G2: ShotDef[] = [
  {id: 'SC06', from: 1427, to: 1624, Comp: SC06},
  {id: 'SC07', from: 1625, to: 1892, Comp: SC07},
  {id: 'SC08', from: 1893, to: 2078, Comp: SC08},
  {id: 'SC09', from: 2079, to: 2242, Comp: SC09},
];

export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
