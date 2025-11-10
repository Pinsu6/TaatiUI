import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { HelperService } from '../../../../core/services/helper.service';
import { AnalyticsDto } from '../../../../shared/models/analytics-dto.model';
import { SalesRegion } from '../../../../shared/models/sales-region.model';
import { HelperProductDto } from '../../../../shared/models/helper-product-dto.model';
import { HelperCityDto } from '../../../../shared/models/helper-city-dto.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sales-analytics',
  standalone: false,
  templateUrl: './sales-analytics.component.html',
  styleUrl: './sales-analytics.component.css'
})
export class SalesAnalyticsComponent implements OnInit, OnDestroy {
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('productsChart') productsChartRef!: ElementRef<HTMLCanvasElement>;
  private trendChart!: Chart;
  private productsChart!: Chart;
  private destroy$ = new Subject<void>();

  analyticsData!: AnalyticsDto;
  regions: SalesRegion[] = [];
  products: HelperProductDto[] = [];
  cities: HelperCityDto[] = [];
  selectedProductId: number | null = null;
  selectedCity: string | null = null;
  selectedTimePeriod: string = 'This Month';
  loading = true;
  error: string | null = null;

  // KPI values
  thisMonthSales = 0;
  thisQuarterSales = 0;
  ytdSales = 0;
  avgOrderValue = 0;

  constructor(
    private router: Router,
    private analyticsService: AnalyticsService,
    private helperService: HelperService
  ) {}

  ngOnInit() {
    this.loadAnalytics();
    this.loadProducts();
    this.loadCities();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.trendChart) {
      this.trendChart.destroy();
    }
    if (this.productsChart) {
      this.productsChart.destroy();
    }
  }

  loadAnalytics() {
    this.loading = true;
    this.error = null;
    this.analyticsService.getAnalytics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.analyticsData = data;
          this.updateKPIs(data);
          this.updateRegions(data);
          this.loading = false;
          // Initialize charts after view is initialized and data is loaded
          // Use setTimeout to ensure ViewChild references are available after DOM update
          this.initializeChartsWhenReady();
        },
        error: (err) => {
          this.error = err.message || 'Failed to load analytics data';
          this.loading = false;
          console.error('Error loading analytics:', err);
        }
      });
  }

  applyFilters() {
    const filterData = {
      timePeriod: this.selectedTimePeriod || 'This Month',
      city: this.selectedCity,
      productId: this.selectedProductId
    };

    console.log('Applying filters:', filterData);
    
    this.loading = true;
    this.error = null;
    
    this.analyticsService.getAnalyticsWithFilters(filterData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.analyticsData = data;
          this.updateKPIs(data);
          this.updateRegions(data);
          this.loading = false;
          // Reinitialize charts with new data
          this.initializeChartsWhenReady();
        },
        error: (err) => {
          this.error = err.message || 'Failed to load filtered analytics data';
          this.loading = false;
          console.error('Error loading filtered analytics:', err);
        }
      });
  }

  private updateKPIs(data: AnalyticsDto) {
    this.thisMonthSales = data.kpis.thisMonthSales;
    this.thisQuarterSales = data.kpis.thisQuarterSales;
    this.ytdSales = data.kpis.ytdSales;
    this.avgOrderValue = data.kpis.avgOrderValue;
  }

  private updateRegions(data: AnalyticsDto) {
    if (data.salesByRegion && data.salesByRegion.length > 0) {
      this.regions = data.salesByRegion.map(region => ({
        name: region.name || region.region || 'Unknown',
        revenue: region.revenue || 0,
        orders: region.orders || 0,
        growth: region.growth || 0
      }));
    } else {
      this.regions = [];
    }
  }

  ngAfterViewInit() {
    // If data is already loaded, initialize charts
    // Otherwise, charts will be initialized after data loads
    if (this.analyticsData && !this.loading) {
      this.initializeChartsWhenReady();
    }
  }

  private initializeChartsWhenReady(attempts = 0) {
    const maxAttempts = 10;
    if (this.trendChartRef && this.productsChartRef) {
      this.initializeCharts();
    } else if (attempts < maxAttempts) {
      // Retry after a short delay if ViewChild references aren't ready yet
      setTimeout(() => {
        this.initializeChartsWhenReady(attempts + 1);
      }, 50);
    } else {
      console.warn('Chart initialization failed: ViewChild references not available');
    }
  }

  private initializeCharts() {
    if (!this.trendChartRef || !this.productsChartRef) {
      return;
    }

    // Destroy existing charts if they exist
    if (this.trendChart) {
      this.trendChart.destroy();
    }
    if (this.productsChart) {
      this.productsChart.destroy();
    }

    // Monthly Sales Trend Chart
    const trendCtx = this.trendChartRef.nativeElement.getContext('2d');
    if (trendCtx && this.analyticsData) {
      const labels = this.analyticsData.salesTrend.map(trend => trend.month);
      const retailData = this.analyticsData.salesTrend.map(trend => trend.retail);
      const wholesaleData = this.analyticsData.salesTrend.map(trend => trend.wholesale);

      this.trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Retail',
              data: retailData,
              borderColor: '#8B1538',
              backgroundColor: 'rgba(139,21,56,0.2)',
              fill: true,
              tension: 0.3
            },
            {
              label: 'Wholesale',
              data: wholesaleData,
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
    }

    // Top Products Chart
    const productsCtx = this.productsChartRef.nativeElement.getContext('2d');
    if (productsCtx && this.analyticsData) {
      const topProducts = this.analyticsData.topProducts || [];
      const productLabels = topProducts.length > 0
        ? topProducts.map(p => p.productName || 'Unknown Product')
        : ['No Data'];
      const productData = topProducts.length > 0
        ? topProducts.map(p => p.revenue || 0)
        : [0];

      const colors = ['#8B1538', '#D4AF37', '#10B981', '#3B82F6', '#F97316', '#8B5CF6', '#EC4899', '#14B8A6'];
      const backgroundColor = productLabels.map((_, index) => colors[index % colors.length]);

      this.productsChart = new Chart(productsCtx, {
        type: 'bar',
        data: {
          labels: productLabels,
          datasets: [{
            label: 'Revenue (SLL)',
            data: productData,
            backgroundColor: backgroundColor
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
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `SLL ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `SLL ${(value / 1000).toFixed(1)}K`;
    }
    return `SLL ${value.toLocaleString()}`;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  loadProducts() {
    this.helperService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products = products;
        },
        error: (err) => {
          console.error('Error loading products:', err);
          // Don't show error to user, just log it
        }
      });
  }

  loadCities() {
    this.helperService.getCities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cities) => {
          this.cities = cities;
        },
        error: (err) => {
          console.error('Error loading cities:', err);
          // Don't show error to user, just log it
        }
      });
  }
}
