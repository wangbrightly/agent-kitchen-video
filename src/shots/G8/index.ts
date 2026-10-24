// 构建组 G8 的镜头清单（SC34–SC38，《AI 厨房》第 4 章「命令与钩子」后半）
import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC34} from './SC34';
import {SC35} from './SC35';
import {SC36} from './SC36';
import {SC37} from './SC37';
import {SC38} from './SC38';

export const SHOTS_G8: ShotDef[] = [
  {id: 'SC34', from: 8333, to: 8570, Comp: SC34},
  {id: 'SC35', from: 8571, to: 8856, Comp: SC35},
  {id: 'SC36', from: 8857, to: 9151, Comp: SC36},
  {id: 'SC37', from: 9152, to: 9397, Comp: SC37},
  {id: 'SC38', from: 9398, to: 9562, Comp: SC38},
];

export const BG_G8: BgSpec[] = [];
export const FOOTAGE_G8: FootageSpec[] = [];
