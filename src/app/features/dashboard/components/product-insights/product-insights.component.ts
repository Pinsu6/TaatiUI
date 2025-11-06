import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Product } from '../../../../shared/models/product.model';
import { AIRecommendation } from '../../../../shared/models/ai-recommendation.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-insights',
  standalone: false,
  templateUrl: './product-insights.component.html',
  styleUrl: './product-insights.component.css'
})
export class ProductInsightsComponent {
  @ViewChild('skuChart') skuChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lifecycleChart') lifecycleChartRef!: ElementRef<HTMLCanvasElement>;
  private skuChart!: Chart;
  private lifecycleChart!: Chart;

  products: Product[] = [
    // { id: 1, name: 'Amoxicillin', category: 'Antibiotic', revenue: 1200000, growth: '+10%', status: 'Fast Moving', price:"100", stock:true, description: 'Antibiotic for bacterial infections.', totalSales: 10450, totalRevenue: 1045000, currentStock: 7500, turnoverRate: '4.2x / Year',sku:''},
    // { id: 2, name: 'Paracetamol', category: 'Pain Relief', revenue: 950000, growth: '+8%', status: 'Fast Moving' , price:"100", stock:true, description: 'Antibiotic for bacterial infections.', totalSales: 10450, totalRevenue: 1045000, currentStock: 7500, turnoverRate: '4.2x / Year',sku:'' },
    // { id: 3, name: 'Cough Syrup', category: 'Cough & Cold', revenue: 600000, growth: '-5%', status: 'Slow Moving' , price:"100", stock:true, description: 'Antibiotic for bacterial infections.', totalSales: 10450, totalRevenue: 1045000, currentStock: 7500, turnoverRate: '4.2x / Year',sku:'' },
    // { id: 4, name: 'Vitamin C', category: 'Vitamins', revenue: 800000, growth: '+32%', status: 'New' , price:"100", stock:true,  description: 'Antibiotic for bacterial infections.', totalSales: 10450, totalRevenue: 1045000, currentStock: 7500, turnoverRate: '4.2x / Year',sku:''}
  ];

  aiRecommendations: AIRecommendation[] = [
    { product: 'Amoxicillin', stock: 200, demand: 500, forecast: 600, recommendation: 'Reorder 400 units' },
    { product: 'Cough Syrup', stock: 1000, demand: 150, forecast: 120, recommendation: 'Avoid Reorder' },
    { product: 'Vitamin C', stock: 300, demand: 400, forecast: 480, recommendation: 'Increase Stock (+20%)' }
  ];

  constructor(private router: Router) {}

  ngAfterViewInit() {
    // SKU Chart
    const skuCtx = this.skuChartRef.nativeElement.getContext('2d');
    this.skuChart = new Chart(skuCtx!, {
      type: 'bar',
      data: {
        labels: ['Amoxicillin', 'Paracetamol', 'Vitamin C', 'Ibuprofen', 'Cough Syrup', 'Antacid', 'Aspirin', 'Zinc', 'Multivitamin', 'Cetirizine'],
        datasets: [{
          label: 'Revenue (SLL)',
          data: [1200000, 950000, 800000, 700000, 600000, 550000, 500000, 480000, 460000, 440000],
          backgroundColor: '#8B1538'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            ticks: {
              callback: (v: any) => v.toLocaleString()
            }
          }
        }
      }
    });

    // Lifecycle Chart
    const lifecycleCtx = this.lifecycleChartRef.nativeElement.getContext('2d');
    this.lifecycleChart = new Chart(lifecycleCtx!, {
      type: 'line',
      data: {
        labels: ['Launch', 'Growth', 'Maturity', 'Decline'],
        datasets: [{
          label: 'Sales (Dummy)',
          data: [200000, 800000, 1200000, 600000],
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
