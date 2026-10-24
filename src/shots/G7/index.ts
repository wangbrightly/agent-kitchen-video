// 构建组 G7 的镜头清单（SC29–SC33，《AI 厨房》第 4 章「命令与钩子」开头）
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC29} from './SC29';
import {SC30} from './SC30';
import {SC31} from './SC31';
import {SC32} from './SC32';
import {SC33} from './SC33';

export const SHOTS_G7: ShotDef[] = [
  {id: 'SC29', from: 7241, to: 7504, Comp: SC29},
  {id: 'SC30', from: 7505, to: 7645, Comp: SC30},
  {id: 'SC31', from: 7646, to: 7853, Comp: SC31},
  {id: 'SC32', from: 7854, to: 8072, Comp: SC32},
  {id: 'SC33', from: 8073, to: 8332, Comp: SC33},
];

export const BG_G7: BgSpec[] = [];
export const FOOTAGE_G7: FootageSpec[] = [];
