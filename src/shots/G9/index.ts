// 构建组 G9 的镜头清单（SC39–SC43，《AI 厨房》第 5 章：标准接口）
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC39} from './SC39';
import {SC40} from './SC40';
import {SC41} from './SC41';
import {SC42} from './SC42';
import {SC43} from './SC43';

export const SHOTS_G9: ShotDef[] = [
  {id: 'SC39', from: 9608, to: 9826, Comp: SC39},
  {id: 'SC40', from: 9827, to: 10119, Comp: SC40},
  {id: 'SC41', from: 10120, to: 10284, Comp: SC41},
  {id: 'SC42', from: 10285, to: 10503, Comp: SC42},
  {id: 'SC43', from: 10504, to: 10684, Comp: SC43},
];

export const BG_G9: BgSpec[] = [];
export const FOOTAGE_G9: FootageSpec[] = [];
