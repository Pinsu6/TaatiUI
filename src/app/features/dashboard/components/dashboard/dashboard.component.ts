import { AfterViewInit, Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import * as L from 'leaflet';
import { Pharmacy } from '../../../../shared/models/pharmacy.model';
import { RefreshService } from '../../../../core/services/refresh.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { DashboardDto } from '../../../../shared/models/dashboard-dto.model';
import { TopPharmacyDto } from '../../../../shared/models/top-pharmacy-dto.model';
import { HelperProductDto } from '../../../../shared/models/helper-product-dto.model';
import { HelperCityDto } from '../../../../shared/models/helper-city-dto.model';
import { HelperDrugTypeDto } from '../../../../shared/models/helper-drug-type-dto.model';
import { ProductCategoryDto } from '../../../../shared/models/product-category-dto.model';
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
  @ViewChild('map') mapRef!: ElementRef<HTMLDivElement>;
  private salesChart!: Chart;
  private map!: L.Map;
  private destroy$ = new Subject<void>();

  dashboardData!: DashboardDto;
  pharmacies: Pharmacy[] = [];
  products: HelperProductDto[] = [];
  selectedProductId: number | null = null;
  cities: HelperCityDto[] = [];
  selectedCity: string | null = null;
  selectedTimePeriod: string = 'Last 30 days';
  drugTypes: HelperDrugTypeDto[] = [];
  categoryShares: ProductCategoryDto[] = [];

  private readonly defaultCategoryShares: ProductCategoryDto[] = [
    { category: 'Drug', share: 34.5 },
    { category: 'Cosmetic', share: 22.1 },
    { category: 'Food', share: 16.4 },
    { category: 'Non-Rx/OTC', share: 12.7 },
    { category: 'OTHER', share: 8.1 },
    { category: 'Solar Equipment', share: 6.2 }
  ];

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
    private analyticsService: AnalyticsService
  ) {
    this.refreshService.refresh$.subscribe(() => {
      if (!this.loading) {
        this.loadDashboard();
      }
    });
  }

  ngOnInit() {
    this.loadDashboard();
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
          this.updateCategoryShares(data);
          // Update products, cities, drugTypes from dashboard API response
          if (data.products) {
            this.products = data.products;
          }
          if (data.cities) {
            // Deduplicate cities: normalize names like "Kenema" and "kenema city" -> "Kenema"
            // "Bo" and "Bo city" -> "Bo", "Kambia" and "Kambia 1" -> "Kambia"
            const cityMap = new Map<string, HelperCityDto>();
            data.cities.forEach(city => {
              const normalizedName = city.cityName
                .toLowerCase()
                .replace(/\s+(city|1)$/i, '') // Remove " city" or " 1" suffix
                .trim();

              // Keep the first occurrence (usually the cleaner name)
              if (!cityMap.has(normalizedName)) {
                cityMap.set(normalizedName, {
                  ...city,
                  cityName: city.cityName.replace(/\s+(city|1)$/i, '').trim() || city.cityName
                });
              }
            });
            this.cities = Array.from(cityMap.values());
          }
          if (data.drugTypes) {
            this.drugTypes = data.drugTypes;
          }
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

  applyFilters() {
    const filterData = {
      timePeriod: this.selectedTimePeriod || 'Last 30 days',
      city: this.selectedCity,
      productId: this.selectedProductId
    };

    console.log('Applying filters:', filterData);

    this.loading = true;
    this.error = null;

    this.analyticsService.getDashboardWithFilters(filterData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.updateKPIs(data);
          this.updatePharmacies(data);
          this.updateCategoryShares(data);
          // Update products, cities, drugTypes from dashboard API response
          if (data.products) {
            this.products = data.products;
          }
          if (data.cities) {
            // Deduplicate cities
            const cityMap = new Map<string, HelperCityDto>();
            data.cities.forEach(city => {
              const normalizedName = city.cityName
                .toLowerCase()
                .replace(/\s+(city|1)$/i, '')
                .trim();

              if (!cityMap.has(normalizedName)) {
                cityMap.set(normalizedName, {
                  ...city,
                  cityName: city.cityName.replace(/\s+(city|1)$/i, '').trim() || city.cityName
                });
              }
            });
            this.cities = Array.from(cityMap.values());
          }
          if (data.drugTypes) {
            this.drugTypes = data.drugTypes;
          }
          this.loading = false;
          // Reinitialize charts with new data
          setTimeout(() => {
            this.initializeChartsWhenReady();
          }, 100);
        },
        error: (err) => {
          this.error = err.message || 'Failed to load filtered dashboard data';
          this.loading = false;
          console.error('Error loading filtered dashboard:', err);
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
    if (this.salesChartRef && this.mapRef && this.dashboardData) {
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
    if (!this.salesChartRef || !this.dashboardData) {
      return;
    }

    // Destroy existing charts if they exist
    if (this.salesChart) {
      this.salesChart.destroy();
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
              borderWidth: 3,
              tension: 0.4,
              borderColor: '#8B1538',
              backgroundColor: (ctx: any) => {
                const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
                g.addColorStop(0, 'rgba(139,21,56,0.2)');
                g.addColorStop(1, 'rgba(139,21,56,0)');
                return g;
              },
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: '#8B1538',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              fill: true
            },
            {
              label: 'Wholesale Sales',
              data: wholesaleData,
              borderWidth: 3,
              tension: 0.4,
              borderColor: '#F59E0B',
              backgroundColor: (ctx: any) => {
                const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
                g.addColorStop(0, 'rgba(245,158,11,0.2)');
                g.addColorStop(1, 'rgba(245,158,11,0)');
                return g;
              },
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: '#F59E0B',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 15,
                font: {
                  size: 12,
                  weight: 500
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              padding: 12,
              displayColors: true,
              callbacks: {
                label: function (context: any) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  const value = context.parsed.y;
                  if (value >= 1000000) {
                    label += 'SLL ' + (value / 1000000).toFixed(2) + 'M';
                  } else if (value >= 1000) {
                    label += 'SLL ' + (value / 1000).toFixed(2) + 'K';
                  } else {
                    label += 'SLL ' + value.toLocaleString();
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
              },
              ticks: {
                callback: function (value: any) {
                  if (value >= 1000000) {
                    return 'SLL ' + (value / 1000000).toFixed(1) + 'M';
                  } else if (value >= 1000) {
                    return 'SLL ' + (value / 1000).toFixed(1) + 'K';
                  }
                  return 'SLL ' + value.toLocaleString();
                },
                font: {
                  size: 11
                }
              }
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: {
                  size: 11
                }
              }
            }
          }
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
    // Use regional performance data for map markers if available
    if (this.dashboardData.regionalPerformance && this.dashboardData.regionalPerformance.length > 0) {
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
        marker.bindPopup(`<strong>${region.region}</strong>`);
      });
    } else if (this.pharmacies.length > 0) {
      // Fallback to pharmacies if regional data is not available
      this.pharmacies.forEach((p, index) => {
        // Use pharmacy coordinates or generate default ones
        const lat = p.lat || (8.4657 + (index * 0.1));
        const lon = p.lon || (-13.2317 + (index * 0.1));
        const marker = L.circleMarker([lat, lon], {
          radius: 8,
          fillColor: '#8B1538',
          color: '#fff',
          weight: 1,
          fillOpacity: 0.9
        }).addTo(this.map);
        marker.bindPopup(`<strong>${p.region}</strong>`);
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

  // Products, cities, and drugTypes are now loaded from the dashboard API response
  // No need for separate API calls

  private updateCategoryShares(data: DashboardDto) {
    if (data.productCategories && data.productCategories.length > 0) {
      this.categoryShares = [...data.productCategories].sort((a, b) => b.share - a.share);
    } else {
      this.categoryShares = this.defaultCategoryShares;
    }
  }

  getCategoryColor(category: string): string {
    const colorMap: { [key: string]: string } = {
      'Drug': '#8B1538',
      'Cosmetic': '#D4AF37',
      'Food': '#10B981',
      'Non-Rx/OTC': '#7C3AED',
      'OTHER': '#F97316',
      'Solar Equipment': '#8B5CF6'
    };
    return colorMap[category] || '#6B7280';
  }

}
