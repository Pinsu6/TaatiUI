
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import * as L from 'leaflet';
import { Pharmacy } from '../../../../shared/models/pharmacy.model';
import { RefreshService } from '../../../../core/services/refresh.service';


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit{
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoriesChart') categoriesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('map') mapRef!: ElementRef<HTMLDivElement>;
  private salesChart!: Chart;
  private categoriesChart!: Chart;

  pharmacies: Pharmacy[] = [
    { name: 'Alpha Pharmacy', lat: 8.4657, lon: -13.2317, revenue: 4200000 },
    { name: 'Beta Pharmacy', lat: 7.9640, lon: -11.7389, revenue: 3800000 },
    { name: 'Gamma Pharmacy', lat: 8.9450, lon: -11.4250, revenue: 3200000 },
    { name: 'Delta Pharmacy', lat: 7.8790, lon: -11.0810, revenue: 2750000 },
  ];

  constructor(private refreshService: RefreshService) {
    this.refreshService.refresh$.subscribe(() => this.refreshCharts());
  }

  ngAfterViewInit() {
    console.log('Sales Chart Ref:', this.salesChartRef);
    console.log('Categories Chart Ref:', this.categoriesChartRef);
    // Sales Chart
    const months = (() => {
      const m = [];
      const d = new Date();
      d.setMonth(d.getMonth() - 11);
      for (let i = 0; i < 12; i++) {
        m.push(d.toLocaleString('default', { month: 'short', year: 'numeric' }));
        d.setMonth(d.getMonth() + 1);
      }
      return m;
    })();

    const salesCtx = this.salesChartRef.nativeElement.getContext('2d');

    this.salesChart = new Chart(salesCtx!, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Retail Sales',
            data: [420000, 380000, 410000, 450000, 470000, 520000, 580000, 600000, 620000, 640000, 700000, 740000],
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            backgroundColor: (ctx: any) => {
              const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, 'rgba(139,21,56,0.25)');
              gradient.addColorStop(1, 'rgba(139,21,56,0)');
              return gradient;
            },
            borderColor: '#8B1538',
            pointRadius: 3
          },
          {
            label: 'Wholesale Sales',
            data: [300000, 320000, 310000, 340000, 360000, 380000, 410000, 420000, 430000, 450000, 470000, 490000],
            borderWidth: 2,
            tension: 0.3,
            borderColor: '#F59E0B',
            backgroundColor: (ctx: any) => {
              const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
              g.addColorStop(0, 'rgba(245,158,11,0.18)');
              g.addColorStop(1, 'rgba(245,158,11,0)');
              return g;
            },
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value:any) { return value >= 1000 ? value.toLocaleString() : value; }
            }
          }
        }
      }
    });

    // Categories Chart
    const categoriesCtx = this.categoriesChartRef.nativeElement.getContext('2d');
    
    this.categoriesChart = new Chart(categoriesCtx!, {
      type: 'doughnut',
      data: {
        labels: ['Antibiotics', 'Pain Relief', 'Vitamins', 'Cough & Cold', 'Others'],
        datasets: [{
          data: [38, 24, 16, 12, 10],
          hoverOffset: 6,
          backgroundColor: ['#8B1538', '#D4AF37', '#10B981', '#7C3AED', '#F97316']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });

    // Leaflet Map
    const map = L.map(this.mapRef.nativeElement, { zoomControl: true }).setView([8.4844, -13.2344], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    this.pharmacies.forEach(p => {
      const marker = L.circleMarker([p.lat, p.lon], { radius: 8, fillColor: '#8B1538', color: '#fff', weight: 1, fillOpacity: 0.9 }).addTo(map);
      marker.bindPopup(`<strong>${p.name}</strong><br/>Revenue: SLL ${p.revenue.toLocaleString()}`);
    });
  }

  refreshCharts() {
    this.salesChart.data.datasets.forEach(ds => {
      const lastIndex = ds.data.length - 1;
      const jitter = Math.round((Math.random() - 0.5) * 50000);
      ds.data[lastIndex] = Math.max(10000, (ds.data[lastIndex] as number) + jitter);
    });
    this.salesChart.update();

    this.categoriesChart.data.datasets[0].data = this.categoriesChart.data.datasets[0].data.map(v => Math.max(5, v? + Math.round((Math.random() - 0.5) * 4) :0));
    this.categoriesChart.update();

    // Optional: Trigger map marker bounce or refresh (simplified)
    const map = L.map(this.mapRef.nativeElement);
    // setTimeout(() => {
    //   map.eachLayer(layer => {
    //     if (layer instanceof L.Marker) {
    //       layer.openPopup();
    //       return false;
    //     }
    //   });
    // }, 600);
  }
}
