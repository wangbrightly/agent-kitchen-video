// 构建组 G13 的镜头清单（SC58–SC62，《AI 厨房》第 7 章收尾：五个部分 → 系统环 → 厨房由你搭）
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC58} from './SC58';
import {SC59} from './SC59';
import {SC60} from './SC60';
import {SC61} from './SC61';
import {SC62} from './SC62';

export const SHOTS_G13: ShotDef[] = [
  {id: 'SC58', from: 14255, to: 14524, Comp: SC58},
  {id: 'SC59', from: 14525, to: 14825, Comp: SC59},
  {id: 'SC60', from: 14826, to: 15061, Comp: SC60},
  {id: 'SC61', from: 15062, to: 15361, Comp: SC61},
  {id: 'SC62', from: 15362, to: 15648, Comp: SC62},
];

export const BG_G13: BgSpec[] = [];
export const FOOTAGE_G13: FootageSpec[] = [];
