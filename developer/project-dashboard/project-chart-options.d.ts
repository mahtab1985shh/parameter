import type * as Highcharts from 'highcharts';
export type ProjectChartKey = 'scurve'|'duration'|'cpi'|'spi'|'financial'|'physical'|'rial'|'hr'|'equip'|'temperature';
export interface ProjectDashboardData {
  scurve:{labels:string[];planned:(number|null)[];verified:(number|null)[];actual:(number|null)[]};
  duration:{active:number;inactive:number;remaining:number};
  cpi:number|null; spi:number|null;
  financial:{BCWS:number;BCWP:number;ACWP:number};
  physical:{categories:string[];planned:number[];verified:number[];actual:number[]};
  rial:{dates:string[];values:number[];amount:number;percent:number};
  hr:{drivers:number;workers:number;security:number;engineers:number;avgDuration:number};
  equip:{categories:string[];active:number[];total:number[]};
  temperature:{dates:string[];min:number[];max:number[]};
}
export interface ChartTheme { colors?:string[];fontFamily?:string;text?:string;grid?:string;surface?:string }
export const catalog:ReadonlyArray<{key:ProjectChartKey;title:string;type:string;demo:string}>;
export function options(key:ProjectChartKey,data:ProjectDashboardData,theme?:ChartTheme):Highcharts.Options;
