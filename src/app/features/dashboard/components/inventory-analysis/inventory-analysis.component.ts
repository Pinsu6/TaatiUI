import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { InventoryAnalyticsDto } from '../../../../shared/models/inventory-analytics-dto.model';
import { StockAlert } from '../../../../shared/models/stock-alert.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-analysis',
  standalone: false,
  templateUrl: './inventory-analysis.component.html',
  styleUrl: './inventory-analysis.component.css'
})
export class InventoryAnalysisComponent implements OnInit, OnDestroy {
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('turnoverChart') turnoverChartRef!: ElementRef<HTMLCanvasElement>;
  private categoryChart!: Chart;
  private turnoverChart!: Chart;
  private destroy$ = new Subject<void>();

  inventoryAnalyticsData!: InventoryAnalyticsDto;
  stockAlerts: StockAlert[] = [];
  
  showExportModal = false;
  isExporting = false;
  exportErrorMessage: string | null = null;

  loading = true;
  error: string | null = null;

  // KPI values
  totalStockValue = 0;
  stockOuts = 0;
  overstockAlerts = 0;
  avgTurnover = 0;

  // Pagination for Stock Alerts
  currentPage = 1;
  itemsPerPage = 10;
  isStockAlertsTableExpanded = true;

  constructor(
    private router: Router,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.loadInventoryAnalytics();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
    if (this.turnoverChart) {
      this.turnoverChart.destroy();
    }
  }

  loadInventoryAnalytics() {
    this.loading = true;
    this.error = null;
    this.analyticsService.getInventoryAnalytics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.inventoryAnalyticsData = data;
          this.updateKPIs(data);
          this.updateStockAlerts(data);
          this.loading = false;
          // Initialize charts after data is loaded
          this.initializeChartsWhenReady();
        },
        error: (err) => {
          this.error = err.message || 'Failed to load inventory analytics';
          this.loading = false;
          console.error('Error loading inventory analytics:', err);
        }
      });
  }

  refresh() {
    this.loadInventoryAnalytics();
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
    const payload = {};

    this.isExporting = true;
    this.exportErrorMessage = null;

    this.analyticsService.exportInventoryAnalytics(format, payload).subscribe({
      next: (blob) => {
        this.downloadFile(blob, format);
        this.isExporting = false;
        this.closeExportModal();
      },
      error: (error) => {
        this.exportErrorMessage = error.message || 'Failed to export inventory analytics.';
        this.isExporting = false;
      }
    });
  }

  private downloadFile(blob: Blob, format: 'pdf' | 'excel' | 'csv'): void {
    const extension = format === 'excel' ? 'xlsx' : format;
    const fileName = `inventory-analysis-${new Date().toISOString()}.${extension}`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private updateKPIs(data: InventoryAnalyticsDto) {
    this.totalStockValue = data.kpis.totalStockValue;
    this.stockOuts = data.kpis.stockOuts;
    this.overstockAlerts = data.kpis.overstockAlerts;
    this.avgTurnover = data.kpis.avgTurnover;
  }

  private updateStockAlerts(data: InventoryAnalyticsDto) {
    this.stockAlerts = data.stockAlerts || [];
    // Reset pagination when stock alerts are updated
    this.currentPage = 1;
  }

  ngAfterViewInit() {
    // If data is already loaded, initialize charts
    if (this.inventoryAnalyticsData && !this.loading) {
      this.initializeChartsWhenReady();
    }
  }

  private initializeChartsWhenReady(attempts = 0) {
    const maxAttempts = 10;
    if (this.categoryChartRef && this.turnoverChartRef && this.inventoryAnalyticsData) {
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
    if (!this.categoryChartRef || !this.turnoverChartRef || !this.inventoryAnalyticsData) {
      return;
    }

    // Destroy existing charts if they exist
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
    if (this.turnoverChart) {
      this.turnoverChart.destroy();
    }

    // Category Chart
    const categoryCtx = this.categoryChartRef.nativeElement.getContext('2d');
    if (categoryCtx && this.inventoryAnalyticsData.stockByCategory) {
      const stockByCategory = this.inventoryAnalyticsData.stockByCategory;
      const labels = stockByCategory.map(item => item.category || 'Uncategorized');
      const stockData = stockByCategory.map(item => item.stockUnits);

      const colors = ['#8B1538', '#10B981', '#3B82F6', '#F59E0B', '#6B7280', '#8B5CF6', '#EC4899', '#14B8A6'];
      const backgroundColor = labels.map((_, index) => colors[index % colors.length]);

      this.categoryChart = new Chart(categoryCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Stock Units',
            data: stockData,
            backgroundColor: backgroundColor
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
    }

    // Turnover Chart
    const turnoverCtx = this.turnoverChartRef.nativeElement.getContext('2d');
    if (turnoverCtx && this.inventoryAnalyticsData.turnoverRatio) {
      const turnoverData = this.inventoryAnalyticsData.turnoverRatio;
      const labels = turnoverData.map(item => item.month);
      const ratioData = turnoverData.map(item => item.ratio);

      this.turnoverChart = new Chart(turnoverCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Turnover Ratio',
            data: ratioData,
            borderColor: '#D4AF37',
            backgroundColor: 'rgba(212,175,55,0.2)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } },
          scales: {
            y: {
              ticks: {
                callback: (v: any) => v.toFixed(2)
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

  formatTurnover(value: number): string {
    if (value === 0) {
      return '0x';
    }
    return `${value.toFixed(1)}x`;
  }

  formatStatus(status: string): string {
    // Convert status format for display
    return status.replace(/([A-Z])/g, ' $1').trim();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // Pagination methods
  get paginatedStockAlerts(): StockAlert[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.stockAlerts.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.stockAlerts.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.stockAlerts.length);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  toggleStockAlertsTable() {
    this.isStockAlertsTableExpanded = !this.isStockAlertsTableExpanded;
  }
}
