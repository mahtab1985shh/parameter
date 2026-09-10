import { provideHighcharts } from 'highcharts-angular';

/** Add provideProjectCharts() to the host application's app.config providers. */
export function provideProjectCharts() {
  return provideHighcharts({
    instance: () => import('highcharts/esm/highcharts').then(m => m.default),
    modules: () => [
      import('highcharts/esm/highcharts-more'),
      import('highcharts/esm/modules/accessibility'),
    ],
  });
}
