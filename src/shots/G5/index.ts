// 构建组 G5 的镜头清单（SC19–SC23，《AI 厨房》第 3 章：技能与按需加载）
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC19} from './SC19';
import {SC20} from './SC20';
import {SC21} from './SC21';
import {SC22} from './SC22';
import {SC23} from './SC23';

export const SHOTS_G5: ShotDef[] = [
  {id: 'SC19', from: 4398, to: 4719, Comp: SC19},
  {id: 'SC20', from: 4720, to: 5005, Comp: SC20},
  {id: 'SC21', from: 5006, to: 5271, Comp: SC21},
  {id: 'SC22', from: 5272, to: 5604, Comp: SC22},
  {id: 'SC23', from: 5605, to: 5871, Comp: SC23},
];

export const BG_G5: BgSpec[] = [];
export const FOOTAGE_G5: FootageSpec[] = [];
