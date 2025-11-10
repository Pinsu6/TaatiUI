import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { HelperService } from '../../../../core/services/helper.service';
import { ProductInsightsDto } from '../../../../shared/models/product-insights-dto.model';
import { ProductInsightDto } from '../../../../shared/models/product-insight-dto.model';
import { AIRecommendation } from '../../../../shared/models/ai-recommendation.model';
import { HelperDrugTypeDto } from '../../../../shared/models/helper-drug-type-dto.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-product-insights',
  standalone: false,
  templateUrl: './product-insights.component.html',
  styleUrl: './product-insights.component.css'
})
export class ProductInsightsComponent implements OnInit, OnDestroy {
  @ViewChild('skuChart') skuChartRef!: ElementRef<HTMLCanvasElement>;
  private skuChart!: Chart;
  private destroy$ = new Subject<void>();

  productInsightsData!: ProductInsightsDto;
  products: ProductInsightDto[] = [];
  aiRecommendations: AIRecommendation[] = [];
  drugTypes: HelperDrugTypeDto[] = [];
  selectedDrugTypeId: number | null = null;
  startDate: string = '';
  endDate: string = '';
  
  loading = true;
  error: string | null = null;

  // Export modal state
  showExportModal = false;
  isExporting = false;
  exportErrorMessage: string | null = null;

  // KPI values
  topProductName = '';
  topProductRevenue = 0;
  fastestGrowingName = '';
  fastestGrowingGrowth = 0;
  slowestMovingName = '';
  slowestMovingGrowth = 0;
  newLaunchesCount = 0;

  constructor(
    private router: Router,
    private analyticsService: AnalyticsService,
    private helperService: HelperService
  ) {}

  ngOnInit() {
    this.loadProductInsights();
    this.loadDrugTypes();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.skuChart) {
      this.skuChart.destroy();
    }
  }

  loadProductInsights() {
    this.loading = true;
    this.error = null;
    this.analyticsService.getProductInsights()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.productInsightsData = data;
          this.updateKPIs(data);
          this.updateProducts(data);
          this.updateAIRecommendations(data);
          this.loading = false;
          // Initialize charts after data is loaded
          this.initializeChartsWhenReady();
        },
        error: (err) => {
          this.error = err.message || 'Failed to load product insights';
          this.loading = false;
          console.error('Error loading product insights:', err);
        }
      });
  }

  refresh() {
    this.loadProductInsights();
  }

  applyFilters() {
    const filterData = {
      drugTypeId: this.selectedDrugTypeId,
      startDate: this.startDate,
      endDate: this.endDate
    };

    console.log('Applying filters:', filterData);
    
    this.loading = true;
    this.error = null;
    
    this.analyticsService.getProductInsightsWithFilters(filterData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.productInsightsData = data;
          this.updateKPIs(data);
          this.updateProducts(data);
          this.updateAIRecommendations(data);
          this.loading = false;
          // Reinitialize charts with new data
          this.initializeChartsWhenReady();
        },
        error: (err) => {
          this.error = err.message || 'Failed to load filtered product insights';
          this.loading = false;
          console.error('Error loading filtered product insights:', err);
        }
      });
  }

  openExportModal() {
    this.showExportModal = true;
  }

  closeExportModal() {
    this.showExportModal = false;
    this.isExporting = false;
    this.exportErrorMessage = null;
  }

  export(format: 'pdf' | 'excel' | 'csv') {
    // Only pass pageNumber=1 and pageSize=1, nothing else
    const payload = {
      pageNumber: 1,
      pageSize: 1
    };

    this.isExporting = true;
    this.exportErrorMessage = null;

    this.analyticsService.exportProductInsights(format, payload).subscribe({
      next: (blob) => {
        this.downloadFile(blob, format);
        this.isExporting = false;
        this.closeExportModal();
      },
      error: (error) => {
        this.exportErrorMessage = error.message || 'Failed to export product insights.';
        this.isExporting = false;
      }
    });
  }

  private downloadFile(blob: Blob, format: 'excel' | 'csv' | 'pdf'): void {
    let extension = 'xlsx';
    if (format === 'csv') {
      extension = 'csv';
    } else if (format === 'pdf') {
      extension = 'pdf';
    }
    const fileName = `product-insights-${new Date().toISOString()}.${extension}`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private updateKPIs(data: ProductInsightsDto) {
    this.topProductName = data.kpis.topProductName;
    this.topProductRevenue = data.kpis.topProductRevenue;
    this.fastestGrowingName = data.kpis.fastestGrowingName;
    this.fastestGrowingGrowth = data.kpis.fastestGrowingGrowth;
    this.slowestMovingName = data.kpis.slowestMovingName;
    this.slowestMovingGrowth = data.kpis.slowestMovingGrowth;
    this.newLaunchesCount = data.kpis.newLaunchesCount;
  }

  private updateProducts(data: ProductInsightsDto) {
    this.products = data.products || [];
  }

  private updateAIRecommendations(data: ProductInsightsDto) {
    this.aiRecommendations = data.aiRecommendations || [];
  }

  ngAfterViewInit() {
    // If data is already loaded, initialize charts
    if (this.productInsightsData && !this.loading) {
      this.initializeChartsWhenReady();
    }
  }

  private initializeChartsWhenReady(attempts = 0) {
    const maxAttempts = 10;
    if (this.skuChartRef && this.productInsightsData) {
      this.initializeCharts();
    } else if (attempts < maxAttempts) {
      setTimeout(() => {
        this.initializeChartsWhenReady(attempts + 1);
      }, 50);
    } else {
      console.warn('Chart initialization failed: ViewChild references not available');
    }
  }

  private initializeCharts() {
    if (!this.skuChartRef || !this.productInsightsData) {
      return;
    }

    // Destroy existing charts if they exist
    if (this.skuChart) {
      this.skuChart.destroy();
    }

    // SKU Chart
    const skuCtx = this.skuChartRef.nativeElement.getContext('2d');
    if (skuCtx && this.productInsightsData.topSkus) {
      const topSkus = this.productInsightsData.topSkus.slice(0, 10); // Top 10
      const labels = topSkus.map(sku => sku.name);
      const revenueData = topSkus.map(sku => sku.revenue);

      this.skuChart = new Chart(skuCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Revenue (SLL)',
            data: revenueData,
            backgroundColor: '#8B1538'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
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
    }
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `SLL ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `SLL ${(value / 1000).toFixed(1)}K`;
    }
    return `SLL ${value.toLocaleString()}`;
  }

  formatGrowth(value: number): string {
    if (value > 0) {
      return `+${value.toFixed(1)}%`;
    } else if (value < 0) {
      return `${value.toFixed(1)}%`;
    }
    return '0%';
  }

  formatStatus(status: string): string {
    // Convert "FastMoving" to "Fast Moving", "SlowMoving" to "Slow Moving", etc.
    return status.replace(/([A-Z])/g, ' $1').trim();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  loadDrugTypes() {
    this.helperService.getDrugTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (drugTypes) => {
          this.drugTypes = drugTypes;
        },
        error: (err) => {
          console.error('Error loading drug types:', err);
          // Don't show error to user, just log it
        }
      });
  }
}
