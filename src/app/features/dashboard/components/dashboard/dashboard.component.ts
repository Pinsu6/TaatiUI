import { AfterViewInit, Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import * as L from 'leaflet';
import { Pharmacy } from '../../../../shared/models/pharmacy.model';
import { RefreshService } from '../../../../core/services/refresh.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { HelperService } from '../../../../core/services/helper.service';
import { DashboardDto } from '../../../../shared/models/dashboard-dto.model';
import { TopPharmacyDto } from '../../../../shared/models/top-pharmacy-dto.model';
import { HelperProductDto } from '../../../../shared/models/helper-product-dto.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoriesChart') categoriesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('map') mapRef!: ElementRef<HTMLDivElement>;
  private salesChart!: Chart;
  private categoriesChart!: Chart;
  private map!: L.Map;
  private destroy$ = new Subject<void>();

  dashboardData!: DashboardDto;
  pharmacies: Pharmacy[] = [];
  products: HelperProductDto[] = [];
  selectedProductId: number | null = null;
  
  loading = true;
  error: string | null = null;

  // KPI values
  totalSalesYtd = 0;
  salesGrowth = 0;
  activePharmacies = 0;
  totalCustomers = 0;
  orderFulfillment = 0;
  fulfillmentChange = 0;

  constructor(
    private refreshService: RefreshService,
    private analyticsService: AnalyticsService,
    private helperService: HelperService
  ) {
    this.refreshService.refresh$.subscribe(() => {
      if (!this.loading) {
        this.loadDashboard();
      }
    });
  }

  ngOnInit() {
    this.loadDashboard();
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) {
      this.map.remove();
    }
    if (this.salesChart) {
      this.salesChart.destroy();
    }
    if (this.categoriesChart) {
      this.categoriesChart.destroy();
    }
  }

  loadDashboard() {
    this.loading = true;
    this.error = null;
    this.analyticsService.getDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.updateKPIs(data);
          this.updatePharmacies(data);
          this.loading = false;
          // Initialize charts after data is loaded
          setTimeout(() => {
            this.initializeChartsWhenReady();
          }, 100);
        },
        error: (err) => {
          this.error = err.message || 'Failed to load dashboard data';
          this.loading = false;
          console.error('Error loading dashboard:', err);
        }
      });
  }

  private updateKPIs(data: DashboardDto) {
    this.totalSalesYtd = data.kpis.totalSalesYtd;
    this.salesGrowth = data.kpis.salesGrowth;
    this.activePharmacies = data.kpis.activePharmacies;
    this.totalCustomers = data.kpis.totalCustomers;
    this.orderFulfillment = data.kpis.orderFulfillment;
    this.fulfillmentChange = data.kpis.fulfillmentChange;
  }

  private updatePharmacies(data: DashboardDto) {
    // Convert TopPharmacyDto to Pharmacy model
    // Note: We don't have lat/lon in the API response, so we'll use default coordinates
    // In a real scenario, you'd need to geocode the regions or have coordinates in the API
    this.pharmacies = data.topPharmacies.map((pharmacy, index) => ({
      name: pharmacy.name,
      region: pharmacy.region,
      revenue: pharmacy.revenue,
      // Default coordinates for Sierra Leone - in production, you'd geocode these
      lat: 8.4657 + (index * 0.1),
      lon: -13.2317 + (index * 0.1)
    }));
  }

  ngAfterViewInit() {
    // If data is already loaded, initialize charts
    if (this.dashboardData && !this.loading) {
      this.initializeChartsWhenReady();
    }
  }

  private initializeChartsWhenReady(attempts = 0) {
    const maxAttempts = 10;
    if (this.salesChartRef && this.categoriesChartRef && this.mapRef && this.dashboardData) {
      this.initializeCharts();
      this.initializeMap();
    } else if (attempts < maxAttempts) {
      setTimeout(() => {
        this.initializeChartsWhenReady(attempts + 1);
      }, 50);
    } else {
      console.warn('Chart/Map initialization failed: ViewChild references not available');
    }
  }

  private initializeCharts() {
    if (!this.salesChartRef || !this.categoriesChartRef || !this.dashboardData) {
      return;
    }

    // Destroy existing charts if they exist
    if (this.salesChart) {
      this.salesChart.destroy();
    }
    if (this.categoriesChart) {
      this.categoriesChart.destroy();
    }

    // Revenue Performance Chart
    const salesCtx = this.salesChartRef.nativeElement.getContext('2d');
    if (salesCtx && this.dashboardData.revenuePerformance) {
      const revenueData = this.dashboardData.revenuePerformance;
      const labels = revenueData.map(item => item.month);
      const retailData = revenueData.map(item => item.retail);
      const wholesaleData = revenueData.map(item => item.wholesale);

      this.salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Retail Sales',
              data: retailData,
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
              data: wholesaleData,
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
                callback: function(value: any) { return value >= 1000 ? value.toLocaleString() : value; }
              }
            }
          }
        }
      });
    }

    // Product Categories Chart
    const categoriesCtx = this.categoriesChartRef.nativeElement.getContext('2d');
    if (categoriesCtx && this.dashboardData.productCategories) {
      const categories = this.dashboardData.productCategories;
      const labels = categories.map(item => item.category || 'Uncategorized');
      const shareData = categories.map(item => item.share);

      const colors = ['#8B1538', '#D4AF37', '#10B981', '#7C3AED', '#F97316', '#8B5CF6', '#EC4899', '#14B8A6'];
      const backgroundColor = labels.map((_, index) => colors[index % colors.length]);

      this.categoriesChart = new Chart(categoriesCtx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: shareData,
            hoverOffset: 6,
            backgroundColor: backgroundColor
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }

  private initializeMap() {
    if (!this.mapRef || !this.dashboardData) {
      return;
    }

    // Remove existing map if it exists
    if (this.map) {
      this.map.remove();
    }

    // Initialize Leaflet Map
    this.map = L.map(this.mapRef.nativeElement, { zoomControl: true }).setView([8.4844, -13.2344], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add markers for top pharmacies or regional performance
    if (this.dashboardData.regionalPerformance && this.dashboardData.regionalPerformance.length > 0) {
      // Use regional performance data for map markers
      this.dashboardData.regionalPerformance.forEach((region, index) => {
        // Default coordinates - in production, you'd geocode the region names
        const lat = 8.4657 + (index * 0.2);
        const lon = -13.2317 + (index * 0.2);
        const marker = L.circleMarker([lat, lon], {
          radius: 8,
          fillColor: '#8B1538',
          color: '#fff',
          weight: 1,
          fillOpacity: 0.9
        }).addTo(this.map);
        marker.bindPopup(`<strong>${region.region}</strong><br/>Revenue: SLL ${region.revenue.toLocaleString()}`);
      });
    } else if (this.pharmacies.length > 0) {
      // Fallback to pharmacies if regional data is not available
      this.pharmacies.forEach(p => {
        const marker = L.circleMarker([p.lat, p.lon], {
          radius: 8,
          fillColor: '#8B1538',
          color: '#fff',
          weight: 1,
          fillOpacity: 0.9
        }).addTo(this.map);
        marker.bindPopup(`<strong>${p.name}</strong><br/>Revenue: SLL ${p.revenue.toLocaleString()}`);
      });
    }
  }

  refreshCharts() {
    // Reload dashboard data instead of just updating charts
    this.loadDashboard();
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

  formatFulfillment(value: number): string {
    return `${value.toFixed(1)}%`;
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

}
