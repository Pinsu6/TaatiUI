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
  @ViewChild('regionSplit') regionSplitRef!: ElementRef<HTMLCanvasElement>;
  product: ProductDetailDto | null = null;
  isLoading = true;
  errorMessage = '';
  orders: any[] = [
    { orderId: '#ORD145', date: '18-Sep-2025', customer: 'Sunrise Pharmacy', quantity: 250, total: 'SLL 12,500' },
    { orderId: '#ORD143', date: '15-Sep-2025', customer: 'Good Health Store', quantity: 180, total: 'SLL 9,000' },
    { orderId: '#ORD138', date: '10-Sep-2025', customer: 'City Medics', quantity: 120, total: 'SLL 6,000' }
  ];
  stockMovements: any[] = [
    { date: 'Sep 15, 2025', description: '+5,000 units restocked' },
    { date: 'Sep 10, 2025', description: '-1,200 units sold' },
    { date: 'Aug 25, 2025', description: '-800 units sold' }
  ];
  alerts: any[] = [
    { message: 'High demand detected — Consider increasing stock in October.' },
    { message: 'Discount campaign scheduled for October (Buy 10, Get 1 Free).' }
  ];
  private salesChart!: Chart;
  private regionChart!: Chart;
  private sub = new Subscription();
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
    this.initCharts(); // dummy charts – you can replace data later
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.salesChart?.destroy();
    this.regionChart?.destroy();
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
    if (!this.product?.stockSummary || !this.product.pricing) return 0;
    return (this.product.stockSummary.totalSold || 0) * (this.product.pricing.salePrice || 0);
  }

  get formattedTotalRevenue(): string {
    return this.totalRevenue.toLocaleString();
  }

  get formattedTotalRevenueM(): string {
    return (this.totalRevenue / 1000000).toFixed(2) + 'M';
  }

  /* ----------------------------------------------------- */
  private initCharts(): void {
    // ---- Sales Trend (dummy) ----
    const sCtx = this.salesTrendRef.nativeElement.getContext('2d')!;
    this.salesChart = new Chart(sCtx, {
      type: 'line',
      data: {
        labels: ['Apr','May','Jun','Jul','Aug','Sep'],
        datasets: [{ label: 'Units Sold', data: [1800,2200,2000,2500,2300,2650],
          borderColor: '#8B1538', backgroundColor: 'rgba(139,21,56,0.2)', fill: true, tension: 0.3 }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
    // ---- Regional Split (dummy) ----
    const rCtx = this.regionSplitRef.nativeElement.getContext('2d')!;
    this.regionChart = new Chart(rCtx, {
      type: 'doughnut',
      data: {
        labels: ['Freetown','Bo','Kenema','Makeni'],
        datasets: [{ data: [45,20,25,10],
          backgroundColor: ['#8B1538','#10B981','#3B82F6','#F59E0B'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
