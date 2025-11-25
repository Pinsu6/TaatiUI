import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomerService } from '../../../core/services/customer.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { Customer } from '../../../shared/models/customer.model';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { WhatsAppBroadcastResponse } from '../../../shared/models/whatsapp-broadcast-response.model';

@Component({
  selector: 'app-whatsapp-order-summary',
  standalone: false,
  templateUrl: './whatsapp-order-summary.component.html',
  styleUrl: './whatsapp-order-summary.component.css'
})
export class WhatsappOrderSummaryComponent implements OnInit, OnDestroy {
  customers: Customer[] = [];
  selectedCustomers: number[] = [];

  // Pagination
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;
  pageSizes = [5, 10, 25, 50, 100];

  // Filters
  summaryDays = 30;

  // UI
  isLoading = true;
  isSending = false;
  errorMessage = '';

  private subscriptions = new Subscription();

  constructor(
    private readonly customerService: CustomerService,
    private readonly whatsappService: WhatsappService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.subscriptions.add(
      this.customerService.getPaged({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize
      }).subscribe({
        next: (result: PagedResult<Customer>) => {
          this.customers = result.data;
          this.totalCount = result.totalCount;
          this.totalPages = result.totalPages;
          this.hasNextPage = result.hasNextPage;
          this.hasPreviousPage = result.hasPreviousPage;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load customers';
          this.isLoading = false;
          this.customers = [];
        }
      })
    );
  }

  refresh(): void {
    this.loadCustomers();
  }

  // Selection helpers
  toggleSelection(customerId: number): void {
    if (this.selectedCustomers.includes(customerId)) {
      this.selectedCustomers = this.selectedCustomers.filter(id => id !== customerId);
    } else {
      this.selectedCustomers.push(customerId);
    }
  }

  toggleSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedCustomers = this.customers.map(c => c.id);
    } else {
      this.selectedCustomers = [];
    }
  }

  isAllSelected(): boolean {
    return this.customers.length > 0 && this.customers.every(c => this.selectedCustomers.includes(c.id));
  }

  sendOrderSummary(): void {
    if (this.selectedCustomers.length === 0 || this.isSending) {
      return;
    }

    const sanitizedDays = Math.max(0, this.summaryDays || 0);
    const confirmed = confirm(
      `Send WhatsApp order summary for the last ${sanitizedDays} day(s) to ` +
      `${this.selectedCustomers.length} customer(s)?`
    );

    if (!confirmed) {
      return;
    }

    this.isSending = true;

    this.whatsappService.sendOrderSummary({
      customerIds: this.selectedCustomers,
      days: sanitizedDays
    }).subscribe({
      next: (response) => {
        this.isSending = false;
        if (response.success && response.data) {
          const data: WhatsAppBroadcastResponse = response.data;
          alert(
            `WhatsApp order summary triggered!\n\n` +
            `Sent: ${data.totalSent}\n` +
            `Failed: ${data.totalFailed}`
          );
        } else {
          alert(response.message || 'Failed to send order summary');
        }
        this.selectedCustomers = [];
      },
      error: (err) => {
        this.isSending = false;
        alert('Error sending order summary: ' + (err.error?.message || err.message));
      }
    });
  }

  // Pagination helpers
  onPageSizeChange(): void {
    this.pageNumber = 1;
    this.loadCustomers();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.pageNumber) {
      this.pageNumber = page;
      this.loadCustomers();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.pageNumber--;
      this.loadCustomers();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.pageNumber++;
      this.loadCustomers();
    }
  }

  getVisiblePages(): number[] {
    const windowSize = 5;
    let start = Math.max(1, this.pageNumber - Math.floor((windowSize - 1) / 2));
    let end = Math.min(this.totalPages, start + windowSize - 1);

    if (end === this.totalPages) {
      start = Math.max(1, this.totalPages - windowSize + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }
}

