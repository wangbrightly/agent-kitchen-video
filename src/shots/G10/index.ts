// 构建组 G10 的镜头清单（SC44–SC48，第 5 章收尾 + 第 6 章起手）
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC44} from './SC44';
import {SC45} from './SC45';
import {SC46} from './SC46';
import {SC47} from './SC47';
import {SC48} from './SC48';

export const SHOTS_G10: ShotDef[] = [
  {id: 'SC44', from: 10685, to: 10985, Comp: SC44},
  {id: 'SC45', from: 10986, to: 11212, Comp: SC45},
  {id: 'SC46', from: 11213, to: 11454, Comp: SC46},
  {id: 'SC47', from: 11500, to: 11752, Comp: SC47},
  {id: 'SC48', from: 11753, to: 11960, Comp: SC48},
];

export const BG_G10: BgSpec[] = [];
export const FOOTAGE_G10: FootageSpec[] = [];
