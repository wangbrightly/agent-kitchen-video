// 构建组 G11 的镜头清单（SC49–SC52，《AI 厨房》第 6 章「整箱采购」）
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC49} from './SC49';
import {SC50} from './SC50';
import {SC51} from './SC51';
import {SC52} from './SC52';

export const SHOTS_G11: ShotDef[] = [
  {id: 'SC49', from: 11961, to: 12175, Comp: SC49},
  {id: 'SC50', from: 12176, to: 12372, Comp: SC50},
  {id: 'SC51', from: 12373, to: 12719, Comp: SC51},
  {id: 'SC52', from: 12720, to: 12990, Comp: SC52},
];

export const BG_G11: BgSpec[] = [];
export const FOOTAGE_G11: FootageSpec[] = [];
