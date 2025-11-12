import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomerDetailDto } from '../../../shared/models/customer-detail-dto.model';

@Component({
  selector: 'app-customer-details',
  standalone: false,
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.css'
})
export class CustomerDetailsComponent {
   @ViewChild('purchaseTrend') purchaseTrendRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categorySplit') categorySplitRef!: ElementRef<HTMLCanvasElement>;

  customer: CustomerDetailDto | null = null;
  isLoading = true;
  errorMessage = '';
  private purchaseTrendChart!: Chart;
  private categorySplitChart!: Chart;
  private subscription!: Subscription;
  private chartInitAttempts = 0;
  private readonly MAX_CHART_INIT_ATTEMPTS = 10;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadCustomer(id);
    }
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is initialized
    setTimeout(() => {
      this.initCharts();
      // Update charts if customer is already loaded
      if (this.customer) {
        this.updateCharts();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.purchaseTrendChart) {
      this.purchaseTrendChart.destroy();
    }
    if (this.categorySplitChart) {
      this.categorySplitChart.destroy();
    }
  }

  private loadCustomer(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.subscription = this.customerService.getById(id).subscribe({
      next: (detail: CustomerDetailDto) => {
        this.customer = detail;
        this.isLoading = false;
        // Update charts after data is loaded
        setTimeout(() => {
          this.updateCharts();
        }, 100);
      },
      error: (err) => {
        console.error('Error loading customer:', err);
        this.errorMessage = err.message || 'Failed to load customer';
        this.isLoading = false;
      }
    });
  }

  // Getters for template
  get customerName(): string {
    if (!this.customer) return 'Unknown Customer';
    return `${this.customer.cusFirstname || ''} ${this.customer.cusLastname || ''}`.trim() || 'Unknown Customer';
  }

  get customerId(): number {
    return this.customer?.customerId || 0;
  }

  get customerStatus(): string {
    return this.customer?.bitIsActive ? 'Active' : 'Inactive';
  }

  retry(): void {
    if (this.customer?.customerId) {
      this.loadCustomer(this.customer.customerId);
    }
  }
  formatOrderTotal(total: number): string {
    return 'SLL ' + total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatCurrency(amount: number): string {
    return 'SLL ' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  private initCharts(): void {
    if (!this.purchaseTrendRef?.nativeElement || !this.categorySplitRef?.nativeElement) {
      if (this.chartInitAttempts < this.MAX_CHART_INIT_ATTEMPTS) {
        this.chartInitAttempts++;
        setTimeout(() => this.initCharts(), 100);
      }
      return;
    }
    
    // Reset attempts counter on success
    this.chartInitAttempts = 0;

    // Purchase Trend Chart
    const purchaseTrendCtx = this.purchaseTrendRef.nativeElement.getContext('2d');
    if (!purchaseTrendCtx) {
      console.error('Could not get canvas context for purchase trend chart');
      return;
    }

    // Destroy existing chart if it exists
    if (this.purchaseTrendChart) {
      this.purchaseTrendChart.destroy();
    }

    this.purchaseTrendChart = new Chart(purchaseTrendCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Monthly Spend (SLL)',
          data: [],
          borderColor: '#8B1538',
          backgroundColor: 'rgba(139,21,56,0.2)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) { 
                return value >= 1000 ? value.toLocaleString() : value; 
              }
            }
          }
        }
      }
    });

    // Category Split Chart
    const categorySplitCtx = this.categorySplitRef.nativeElement.getContext('2d');
    if (!categorySplitCtx) {
      console.error('Could not get canvas context for category split chart');
      return;
    }

    // Destroy existing chart if it exists
    if (this.categorySplitChart) {
      this.categorySplitChart.destroy();
    }

    this.categorySplitChart = new Chart(categorySplitCtx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ['#8B1538', '#10B981', '#3B82F6', '#F59E0B'],
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });

    // Update charts if customer data is already loaded
    if (this.customer) {
      this.updateCharts();
    }
  }

  private updateCharts(): void {
    // Update Purchase Trend Chart
    if (this.customer?.purchaseTrend && this.customer.purchaseTrend.length > 0) {
      const trendData = this.customer.purchaseTrend;
      const labels = trendData.map(item => item.month);
      const data = trendData.map(item => item.amount);

      if (this.purchaseTrendChart) {
        this.purchaseTrendChart.data.labels = labels;
        this.purchaseTrendChart.data.datasets[0].data = data;
        this.purchaseTrendChart.update('none');
      }
    }

    // Update Category Split Chart
    if (this.customer?.categorySplit && this.customer.categorySplit.length > 0) {
      const categoryData = this.customer.categorySplit;
      const labels = categoryData.map(item => item.category);
      const data = categoryData.map(item => item.amount);
      
      // Generate colors for categories
      const colors = this.generateColors(categoryData.length);

      if (this.categorySplitChart) {
        this.categorySplitChart.data.labels = labels;
        this.categorySplitChart.data.datasets[0].data = data;
        this.categorySplitChart.data.datasets[0].backgroundColor = colors;
        this.categorySplitChart.update('none');
      }
    }
  }

  private generateColors(count: number): string[] {
    const baseColors = ['#8B1538', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}
