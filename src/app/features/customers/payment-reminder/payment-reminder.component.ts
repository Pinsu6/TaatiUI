import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomerService } from '../../../core/services/customer.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { Customer } from '../../../shared/models/customer.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Component({
  selector: 'app-payment-reminder',
  standalone: false,
  templateUrl: './payment-reminder.component.html',
  styleUrl: './payment-reminder.component.css'
})
export class PaymentReminderComponent implements OnInit, OnDestroy {
  customers: Customer[] = [];

  // selection via checkboxes (same feel as order summary page)
  selectedCustomers: number[] = [];

  // global fields applied to selected customers
  outstandingAmount: number | null = null;
  to: string = '';

  // Pagination
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;
  pageSizes = [5, 10, 25, 50, 100];

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

  sendPaymentReminder(): void {
    if (this.selectedCustomers.length === 0) {
      alert('Please select at least one customer.');
      return;
    }

    const amount = this.outstandingAmount ?? 0;
    const manualTo = (this.to || '').trim();

    if (amount <= 0) {
      const proceedZero = confirm('Outstanding amount is 0 or not set. Do you still want to send a reminder?');
      if (!proceedZero) {
        return;
      }
    }

    const confirmed = confirm(
      `Send payment reminder to ${this.selectedCustomers.length} customer(s)?\n\n` +
      `Outstanding Amount: ₹${amount.toFixed(2)}\n` +
      (manualTo ? `Override To: ${manualTo}\n` : 'To: will use each pharmacy primary WhatsApp number from database.\n')
    );

    if (!confirmed || this.isSending) {
      return;
    }

    this.isSending = true;

    let success = 0;
    let failed = 0;
    let skippedNoNumber = 0;
    const ids = [...this.selectedCustomers];

    const sendForIndex = (index: number) => {
      if (index >= ids.length) {
        this.isSending = false;
        alert(
          `Payment reminders processed!\n\n` +
          `Successful: ${success}\n` +
          `Failed: ${failed}\n` +
          `Skipped (no WhatsApp number): ${skippedNoNumber}`
        );
        this.selectedCustomers = [];
        return;
      }

      const id = ids[index];
      const customer = this.customers.find(c => c.id === id);
      const recipient = manualTo || customer?.phone || customer?.cusMobileno || '';

      if (!recipient) {
        skippedNoNumber++;
        sendForIndex(index + 1);
        return;
      }

      this.whatsappService.sendPaymentReminder({
        customerId: id,
        outstandingAmount: amount,
        to: recipient
      }).subscribe({
        next: (response) => {
          if (response.success) {
            success++;
          } else {
            failed++;
          }
        },
        error: () => {
          failed++;
        },
        complete: () => {
          sendForIndex(index + 1);
        }
      });
    };

    sendForIndex(0);
  }

  // === Selection helpers (checkbox style, like order summary) ===
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
    return this.customers.length > 0 &&
      this.customers.every(c => this.selectedCustomers.includes(c.id));
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


