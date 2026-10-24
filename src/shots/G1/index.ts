// 构建组 G1 的镜头清单（SC01–SC05，《AI 厨房》第 1 章）
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC01} from './SC01';
import {SC02} from './SC02';
import {SC03} from './SC03';
import {SC04} from './SC04';
import {SC05} from './SC05';

export const SHOTS_G1: ShotDef[] = [
  {id: 'SC01', from: 78, to: 303, Comp: SC01},
  {id: 'SC02', from: 304, to: 488, Comp: SC02},
  {id: 'SC03', from: 489, to: 840, Comp: SC03},
  {id: 'SC04', from: 841, to: 1098, Comp: SC04},
  {id: 'SC05', from: 1099, to: 1426, Comp: SC05},
];

export const BG_G1: BgSpec[] = [];
export const FOOTAGE_G1: FootageSpec[] = [];
