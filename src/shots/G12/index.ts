// 构建组 G12 的镜头清单（SC53–SC57，《AI 厨房》第 7 章：把所有东西放回厨房）
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC53} from './SC53';
import {SC54} from './SC54';
import {SC55} from './SC55';
import {SC56} from './SC56';
import {SC57} from './SC57';

export const SHOTS_G12: ShotDef[] = [
  {id: 'SC53', from: 13036, to: 13273, Comp: SC53},
  {id: 'SC54', from: 13274, to: 13560, Comp: SC54},
  {id: 'SC55', from: 13561, to: 13828, Comp: SC55},
  {id: 'SC56', from: 13829, to: 14084, Comp: SC56},
  {id: 'SC57', from: 14085, to: 14254, Comp: SC57},
];

export const BG_G12: BgSpec[] = [];
export const FOOTAGE_G12: FootageSpec[] = [];
