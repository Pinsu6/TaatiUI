import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { SalesRegion } from '../../../../shared/models/sales-region.model';

@Component({
  selector: 'app-sales-analytics',
  standalone: false,
  templateUrl: './sales-analytics.component.html',
  styleUrl: './sales-analytics.component.css'
})
export class SalesAnalyticsComponent {
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('productsChart') productsChartRef!: ElementRef<HTMLCanvasElement>;
  private trendChart!: Chart;
  private productsChart!: Chart;

  regions: SalesRegion[] = [
    { name: 'Western Area', revenue: 6200000, orders: 1240, growth: 12 },
    { name: 'Northern Province', revenue: 4300000, orders: 960, growth: 9 },
    { name: 'Southern Province', revenue: 3800000, orders: 880, growth: -3 },
    { name: 'Eastern Province', revenue: 2400000, orders: 640, growth: 5 }
  ];

  constructor(private router: Router) {}

  ngAfterViewInit() {
    // Monthly Sales Trend Chart
    const trendCtx = this.trendChartRef.nativeElement.getContext('2d');
    this.trendChart = new Chart(trendCtx!, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Retail',
            data: [210000, 220000, 230000, 250000, 260000, 280000, 290000, 300000, 320000, 340000, 350000, 370000],
            borderColor: '#8B1538',
            backgroundColor: 'rgba(139,21,56,0.2)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Wholesale',
            data: [150000, 160000, 170000, 175000, 180000, 200000, 210000, 220000, 230000, 240000, 250000, 260000],
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245,158,11,0.2)',
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        scales: {
          y: {
            ticks: {
              callback: (value: any) => value.toLocaleString()
            }
          }
        }
      }
    });

    // Top Products Chart
    const productsCtx = this.productsChartRef.nativeElement.getContext('2d');
    this.productsChart = new Chart(productsCtx!, {
      type: 'bar',
      data: {
        labels: ['Amoxicillin', 'Paracetamol', 'Vitamin C', 'Ibuprofen', 'Cough Syrup'],
        datasets: [{
          label: 'Revenue (SLL)',
          data: [1200000, 950000, 800000, 700000, 600000],
          backgroundColor: ['#8B1538', '#D4AF37', '#10B981', '#3B82F6', '#F97316']
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: {
              callback: (value: any) => value.toLocaleString()
            }
          }
        }
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
