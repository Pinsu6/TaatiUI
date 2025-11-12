import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Product } from '../../../shared/models/product.model';
import { Order } from '../../../shared/models/order.model';
import { StockMovement } from '../../../shared/models/stock-movement.model';
import { Alert } from '../../../shared/models/alert.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductResponseDto } from '../../../shared/models/product-response-dto.model';
import { Subscription } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { ProductDetailDto } from '../../../shared/models/product-detail-dto.model';

@Component({
  selector: 'app-product-details',
  standalone: false,
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {
  @ViewChild('salesTrend') salesTrendRef!: ElementRef<HTMLCanvasElement>;
  product: ProductDetailDto | null = null;
  isLoading = true;
  errorMessage = '';
  private salesChart!: Chart;
  private sub = new Subscription();
  private chartInitAttempts = 0;
  private readonly MAX_CHART_INIT_ATTEMPTS = 10;
  // Pagination state for orders
  pageSizes: number[] = [5, 10, 20, 50];
  pageSize = 10;
  pageNumber = 1;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadProduct(id);
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is initialized
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.salesChart?.destroy();
  }

  retry(): void {
    if (this.product?.drugId) this.loadProduct(this.product.drugId);
  }

  /* ----------------------------------------------------- */
  public loadProduct(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.sub.add(
      this.productService.getById(id).subscribe({
        next: (dto: ProductDetailDto) => {
          this.product = dto;
          this.isLoading = false;
          // Update chart after product data is loaded
          this.updateChart();
        },
        error: err => {
          this.errorMessage = err.message || 'Failed to load product';
          this.isLoading = false;
        }
      })
    );
  }

  // NEW: Safe getters for template computations (fixes NG2 errors)
  get totalRevenue(): number {
    // Use API value if available, otherwise calculate
    if (this.product?.totalRevenue !== undefined && this.product.totalRevenue !== null) {
      return this.product.totalRevenue;
    }
    if (!this.product?.stockSummary || !this.product.pricing) return 0;
    return (this.product.stockSummary.totalSold || 0) * (this.product.pricing.salePrice || 0);
  }

  get formattedTotalRevenue(): string {
    return this.totalRevenue.toLocaleString();
  }

  get formattedTotalRevenueM(): string {
    return (this.totalRevenue / 1000000).toFixed(2) + 'M';
  }

  get turnoverRate(): number {
    return this.product?.turnoverRate || 0;
  }

  get formattedTurnoverRate(): string {
    if (this.turnoverRate === 0) return 'N/A';
    return this.turnoverRate.toFixed(2);
  }

  get orders(): any[] {
    return this.product?.recentOrders || [];
  }

  get stockMovements(): any[] {
    return this.product?.stockMovements || [];
  }

  get alerts(): any[] {
    return this.product?.alerts || [];
  }

  formatOrderTotal(total: any): string {
    if (typeof total === 'number') {
      return 'SLL ' + total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return total || 'N/A';
  }

  /* ----------------------------------------------------- */
  private initCharts(): void {
    if (!this.salesTrendRef?.nativeElement) {
      // Try again after a short delay, but limit attempts
      if (this.chartInitAttempts < this.MAX_CHART_INIT_ATTEMPTS) {
        this.chartInitAttempts++;
        setTimeout(() => this.initCharts(), 100);
      }
      return;
    }
    
    // Reset attempts counter on success
    this.chartInitAttempts = 0;
    
    // Destroy existing chart if it exists
    if (this.salesChart) {
      this.salesChart.destroy();
    }
    
    // ---- Sales Trend ----
    const sCtx = this.salesTrendRef.nativeElement.getContext('2d');
    if (!sCtx) {
      console.error('Could not get canvas context for chart');
      return;
    }
    
    this.salesChart = new Chart(sCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{ 
          label: 'Sales Amount', 
          data: [],
          borderColor: '#8B1538', 
          backgroundColor: 'rgba(139,21,56,0.2)', 
          fill: true, 
          tension: 0.3 
        }]
      },
      options: { 
        responsive: true, 
        plugins: { legend: { position: 'bottom' } },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    
    // Update chart with data if product is already loaded
    if (this.product?.monthlySalesTrend) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    if (!this.product?.monthlySalesTrend) return;
    
    // Initialize chart if not already initialized
    if (!this.salesChart) {
      if (this.salesTrendRef?.nativeElement) {
        this.initCharts();
        return; // initCharts will call updateChart if product data is available
      }
      // If ViewChild is not available, wait a bit and try again
      setTimeout(() => {
        if (this.salesTrendRef?.nativeElement && !this.salesChart) {
          this.initCharts();
        } else if (this.salesChart) {
          this.updateChart();
        }
      }, 100);
      return;
    }
    
    const trendData = this.product.monthlySalesTrend;
    const labels = trendData.map(item => item.month);
    const data = trendData.map(item => item.amount);
    
    this.salesChart.data.labels = labels;
    this.salesChart.data.datasets[0].data = data;
    this.salesChart.update('none'); // Use 'none' mode for smoother updates
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  /* =================== Orders Pagination (match customers) =================== */
  get totalCount(): number {
    return this.orders.length || 0;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  get hasPreviousPage(): boolean {
    return this.pageNumber > 1;
  }

  get hasNextPage(): boolean {
    return this.pageNumber < this.totalPages;
  }

  get pagedOrders(): any[] {
    const start = (this.pageNumber - 1) * this.pageSize;
    return this.orders.slice(start, start + this.pageSize);
  }

  onPageSizeChange(): void {
    this.pageNumber = 1;
  }

  previousPage(): void {
    if (this.hasPreviousPage) this.pageNumber -= 1;
  }

  nextPage(): void {
    if (this.hasNextPage) this.pageNumber += 1;
  }

  goToPage(p: number): void {
    if (!Number.isFinite(p)) return;
    this.pageNumber = Math.min(Math.max(1, Math.trunc(p)), this.totalPages);
  }

  getVisiblePages(): number[] {
    const windowSize = 5;
    const total = this.totalPages;
    let start = Math.max(1, this.pageNumber - Math.floor(windowSize / 2));
    let end = start + windowSize - 1;
    if (end > total) {
      end = total;
      start = Math.max(1, end - windowSize + 1);
    }
    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }
}
