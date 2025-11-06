import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { StockAlert } from '../../../../shared/models/stock-alert.model';

@Component({
  selector: 'app-inventory-analysis',
  standalone: false,
  templateUrl: './inventory-analysis.component.html',
  styleUrl: './inventory-analysis.component.css'
})
export class InventoryAnalysisComponent {
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('turnoverChart') turnoverChartRef!: ElementRef<HTMLCanvasElement>;
  private categoryChart!: Chart;
  private turnoverChart!: Chart;

  stockAlerts: StockAlert[] = [
    { product: 'Amoxicillin', category: 'Antibiotic', currentStock: 0, status: 'Stock-Out' },
    { product: 'Paracetamol', category: 'Pain Relief', currentStock: 12000, status: 'Overstock' },
    { product: 'Vitamin C', category: 'Vitamins', currentStock: 250, status: 'Low Stock' },
    { product: 'Ibuprofen', category: 'Pain Relief', currentStock: 35, status: 'Low Stock' }
  ];

  constructor(private router: Router) {}

  ngAfterViewInit() {
    // Category Chart
    const categoryCtx = this.categoryChartRef.nativeElement.getContext('2d');
    this.categoryChart = new Chart(categoryCtx!, {
      type: 'bar',
      data: {
        labels: ['Antibiotics', 'Pain Relief', 'Vitamins', 'Cough & Cold', 'Others'],
        datasets: [{
          label: 'Stock Units',
          data: [4200, 6700, 3100, 2800, 1500],
          backgroundColor: ['#8B1538', '#10B981', '#3B82F6', '#F59E0B', '#6B7280']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });

    // Turnover Chart
    const turnoverCtx = this.turnoverChartRef.nativeElement.getContext('2d');
    this.turnoverChart = new Chart(turnoverCtx!, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Turnover Ratio',
          data: [4.8, 5.1, 5.0, 5.3, 5.2, 5.4, 5.6, 5.3, 5.1, 5.0, 4.9, 5.2],
          borderColor: '#D4AF37',
          backgroundColor: 'rgba(212,175,55,0.2)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
