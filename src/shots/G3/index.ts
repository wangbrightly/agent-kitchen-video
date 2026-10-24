// 构建组 G3 的镜头清单（SC10–SC14，《AI 厨房》第 2 章「岗位与工具」）
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC10} from './SC10';
import {SC11} from './SC11';
import {SC12} from './SC12';
import {SC13} from './SC13';
import {SC14} from './SC14';

export const SHOTS_G3: ShotDef[] = [
  {id: 'SC10', from: 2288, to: 2609, Comp: SC10},
  {id: 'SC11', from: 2610, to: 2910, Comp: SC11},
  {id: 'SC12', from: 2911, to: 3143, Comp: SC12},
  {id: 'SC13', from: 3144, to: 3436, Comp: SC13},
  {id: 'SC14', from: 3437, to: 3644, Comp: SC14},
];

export const BG_G3: BgSpec[] = [];
export const FOOTAGE_G3: FootageSpec[] = [];
