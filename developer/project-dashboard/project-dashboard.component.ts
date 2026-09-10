import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { HighchartsChartComponent } from 'highcharts-angular';
import { catalog, options, type ProjectDashboardData, type ProjectChartKey, type ChartTheme } from './project-chart-options';

@Component({
  selector: 'parameter-project-dashboard',
  standalone: true,
  imports: [HighchartsChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section dir="rtl" aria-label="نمودارهای داشبورد پروژه" class="project-charts">
      @for (card of cards(); track card.key) {
        <article [class.wide]="card.key === 'scurve' || card.key === 'rial'">
          <header><h3>{{card.title}}</h3><button type="button" (click)="showDetail(card.key, details)" [attr.aria-label]="'جزئیات '+card.title">جزئیات</button></header>
          <highcharts-chart [options]="card.options" />
        </article>
      }
    </section>
    <dialog #details (close)="selected.set(null)" (cancel)="selected.set(null)">
      @if (detail(); as card) {
        <header><h3>{{card.title}}</h3><button type="button" (click)="details.close()">بازگشت به داشبورد</button></header>
        <highcharts-chart [options]="card.options" class="detail-chart" />
      }
    </dialog>
  `,
  styles: [`
    :host{display:block;color:var(--text-900,#323338);font-family:Vazirmatn,Tahoma,sans-serif}
    .project-charts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.wide{grid-column:span 2}
    article{min-width:0;background:var(--surface,#fff);border:1px solid var(--border,#e4e6f2);border-radius:8px;padding:12px}
    header{display:flex;align-items:center;justify-content:space-between;gap:12px}h3{font:600 13px/1.7 Vazirmatn,Tahoma,sans-serif;margin:0}
    button{font:inherit;color:var(--mon-blue,#0073ea);background:transparent;border:0;cursor:pointer;padding:6px}button:focus-visible{outline:2px solid currentColor}
    highcharts-chart{width:100%;height:260px;display:block}.detail-chart{height:440px}
    dialog{width:min(1000px,94vw);max-height:90dvh;overflow:auto;border:1px solid var(--border,#e4e6f2);border-radius:8px;background:var(--surface,#fff);color:inherit}dialog::backdrop{background:#17233b66}
    @media(max-width:1000px){.project-charts{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.project-charts{grid-template-columns:1fr}.wide{grid-column:auto}}
  `],
})
export class ProjectDashboardComponent {
  readonly data = input.required<ProjectDashboardData>();
  readonly theme = input<ChartTheme>({});
  readonly selected = signal<ProjectChartKey|null>(null);
  readonly cards = computed(() => catalog.map(card => ({...card, options:options(card.key,this.data(),this.theme())})));
  readonly detail = computed(() => this.cards().find(card => card.key === this.selected()));
  showDetail(key:ProjectChartKey, dialog:HTMLDialogElement):void {this.selected.set(key);dialog.showModal();}
}
