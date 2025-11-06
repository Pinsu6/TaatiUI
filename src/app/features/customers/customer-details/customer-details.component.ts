import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Customer } from '../../../shared/models/customer.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomerDetailDto } from '../../../shared/models/customer-detail-dto.model';
import { EmployeeDto } from '../../../shared/models/employee-dto.model';
import { Employee } from '../../../shared/models/employee.model';
import { CustomerTypeDto } from '../../../shared/models/customer-type-dto.model';
import { CustomerType } from '../../../shared/models/customer-type.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-customer-details',
  standalone: false,
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.css'
})
export class CustomerDetailsComponent {
   @ViewChild('purchaseTrend') purchaseTrendRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categorySplit') categorySplitRef!: ElementRef<HTMLCanvasElement>;

  customer: Customer | null = null;
  private purchaseTrendChart!: Chart;
  private categorySplitChart!: Chart;
  private subscription!: Subscription;

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
    this.initCharts();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadCustomer(id: number): void {
    this.subscription = this.customerService.getById(id).subscribe({
      next: (detail: CustomerDetailDto) => {
        this.customer = this.mapToCustomer(detail);
        this.updateCharts();  // Update charts if needed with real data
      },
      error: (err) => {
        console.error('Error loading customer:', err);
        // Handle error (e.g., show message or redirect)
      }
    });
  }

  private mapToCustomer(dto: CustomerDetailDto): Customer {
    return {
      id: dto.customerId,
      cusCode: dto.cusCode || '',
      name: `${dto.cusFirstname || ''} ${dto.cusLastname || ''}`.trim() || 'Unknown',
      email: dto.cusEmail || '',
      phone: dto.cusMobileno || '',
      status: dto.bitIsActive ? 'active' : 'inactive',
      company: dto.customerType?.cusTypeName || '',  // Use CustomerType as company proxy
      address: dto.address || '',
      cusMobileno: dto.cusMobileno || '',
      cusPhonenoO: dto.cusPhonenoO || '',
      cusPhonenoR: dto.cusPhonenoR || '',
      city: dto.city || '',
      district: dto.district || '',
      country: dto.country || '',
      pin: dto.pin || '',
      region: dto.region || '',
      pbsllicense: dto.pbsllicense || '',
      licenseType: dto.licenseType || '',
      licenseExpiry: dto.licenseExpiry || null,
      creditlim: dto.creditlim || 0,
      creditdays: dto.creditdays || 0,
      dateCreated: dto.dateCreated || '',
      bitIsActive: dto.bitIsActive,
      storeAmtremain: dto.storeAmtremain || 0,
      storeAmtused: dto.storeAmtused || 0,
      customerType: this.mapCustomerType(dto.customerType),
    employee: this.mapEmployee(dto.employee),
      // Real from API
    totalOrders: dto.totalOrders || 0,
    lifetimeValue: dto.lifetimeValue || 0,
    lastPurchase: dto.lastPurchase || 'N/A',
    activePolicies: dto.openInvoices || 0,
    orderHistory: dto.orderHistory || [],
    engagement: dto.engagement || [],  // Or dto.paymentHistory if preferred
    purchaseTrendData: dto.purchaseTrendData || []
    };
  }
  private getMonthName(month: number): string {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return names[month - 1] || 'Month ' + month;
}
  private mapCustomerType(dto: CustomerTypeDto | null | undefined): CustomerType | null {
  if (!dto) return null;
  return {
    cusTypeId: dto.cusTypeId,
    cusTypeName: dto.cusTypeName,
    bitIsActive: dto.bitIsActive ?? null,
    dateCreated: dto.dateCreated ?? null,
    bitIsDelete: dto.bitIsDelete ?? null
  };
}

private mapEmployee(dto: EmployeeDto | null | undefined): Employee | null {
  if (!dto) return null;
  return {
    employeeId: dto.employeeId,
    employeeName: dto.employeeName,
    empShort: dto.empShort,
    empPerson: dto.empPerson ?? null,
    empPosition: dto.empPosition ?? null,
    empEmail: dto.empEmail ?? null,
    empMobile: dto.empMobile ?? null,
    empAddress: dto.empAddress ?? null,
    empType: dto.empType ?? null,
    bitIsActive: dto.bitIsActive ?? null,
    dateCreated: dto.dateCreated ?? null,
    bitIsDelete: dto.bitIsDelete ?? null,
    empPassword: dto.empPassword ?? null,
    bintUserId: dto.bintUserId ?? null,
    empStartDate: dto.empStartDate ?? null
  };
}

  private initCharts(): void {
    // Purchase Trend Chart (dummy data)
    const purchaseTrendCtx = this.purchaseTrendRef.nativeElement.getContext('2d');
    this.purchaseTrendChart = new Chart(purchaseTrendCtx!, {
      type: 'line',
      data: {
        labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        datasets: [{
          label: 'Monthly Spend (₹)',
          data: [12000, 15000, 10000, 18000, 16000, 20000],
          borderColor: '#8B1538',
          backgroundColor: (ctx: any) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(139,21,56,0.2)');
            gradient.addColorStop(1, 'rgba(139,21,56,0)');
            return gradient;
          },
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
            beginAtZero: false,
            ticks: {
              callback: function(value: any) { return value >= 1000 ? value.toLocaleString() : value; }
            }
          }
        }
      }
    });

    // Category Split Chart (dummy data)
    const categorySplitCtx = this.categorySplitRef.nativeElement.getContext('2d');
    this.categorySplitChart = new Chart(categorySplitCtx!, {
      type: 'doughnut',
      data: {
        labels: ['Antibiotics', 'Pain Relief', 'Vitamins', 'Others'],
        datasets: [{
          data: [45, 25, 20, 10],
          backgroundColor: ['#8B1538', '#10B981', '#3B82F6', '#F59E0B'],
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  private updateCharts(): void {
  const trendData = this.customer?.purchaseTrendData || [];
  if (trendData.length > 0) {
    const sorted = [...trendData].sort((a: any, b: any) => a.month - b.month);
    const labels = sorted.map((d: any) => this.getMonthName(d.month));
    const data = sorted.map((d: any) => d.total);

    this.purchaseTrendChart.data.labels = labels;
    this.purchaseTrendChart.data.datasets[0].data = data;
    this.purchaseTrendChart.update();
  }

  // Category Split: Keep dummy or extend API later
}

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}
