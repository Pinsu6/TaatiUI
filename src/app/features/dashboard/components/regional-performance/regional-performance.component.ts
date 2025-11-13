import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import * as L from 'leaflet';
import { Region } from '../../../../shared/models/region.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-regional-performance',
  standalone: false,
  templateUrl: './regional-performance.component.html',
  styleUrl: './regional-performance.component.css'
})
export class RegionalPerformanceComponent {
  @ViewChild('regionChart') regionChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('map') mapRef!: ElementRef<HTMLDivElement>;
  private regionChart!: Chart;
  private map!: L.Map;

  regions: Region[] = [
    { name: 'Western Area', lat: 8.4657, lon: -13.2317, revenue: 6200000, growth: 12, city: 'Freetown', orders: 1240 },
    { name: 'Northern Province', lat: 8.9450, lon: -11.4250, revenue: 4300000, growth: 9, city: 'Makeni', orders: 620 },
    { name: 'Southern Province', lat: 7.9640, lon: -11.7389, revenue: 3800000, growth: -3, city: 'Bo', orders: 500 },
    { name: 'Eastern Province', lat: 7.8790, lon: -11.0810, revenue: 2400000, growth: 5, city: 'Kenema', orders: 340 }
  ];

  constructor(private router: Router) {}

  ngAfterViewInit() {
    this.initializeVisualizations();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  loadRegionalPerformance() {
    this.initializeVisualizations();
  }

  private initializeVisualizations() {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map(this.mapRef.nativeElement).setView([8.4844, -13.2344], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.regions.forEach(r => {
      const marker = L.circleMarker([r.lat, r.lon], {
        radius: 10,
        fillColor: '#8B1538',
        color: '#fff',
        weight: 2,
        fillOpacity: 0.9
      }).addTo(this.map);
      marker.bindPopup(`<strong>${r.name}</strong><br/>Revenue: SLL ${r.revenue.toLocaleString()}`);
    });

    if (this.regionChart) {
      this.regionChart.destroy();
    }

    const regionCtx = this.regionChartRef.nativeElement.getContext('2d');
    if (!regionCtx) {
      return;
    }

    this.regionChart = new Chart(regionCtx, {
      type: 'bar',
      data: {
        labels: this.regions.map(r => r.name),
        datasets: [{
          label: 'Revenue (SLL)',
          data: this.regions.map(r => r.revenue),
          backgroundColor: ['#8B1538', '#10B981', '#7C3AED', '#D4AF37']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            ticks: {
              callback: (value: any) => value.toLocaleString()
            }
          }
        }
      }
    });
  }
}
