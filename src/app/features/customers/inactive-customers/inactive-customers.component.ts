import { Component, OnDestroy, OnInit } from '@angular/core';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { Customer } from '../../../shared/models/customer.model';
import { Subscription } from 'rxjs';
import { CustomerService } from '../../../core/services/customer.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';

@Component({
  selector: 'app-inactive-customers',
  standalone: false,
  templateUrl: './inactive-customers.component.html',
  styleUrl: './inactive-customers.component.css'
})
export class InactiveCustomersComponent implements OnInit, OnDestroy {

  inactiveCustomers: Customer[] = [];
  selectedCustomers: number[] = [];
  selectAllMode = false; // Track if "Select All" across pages is active

  // Pagination
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;
  pageSizes = [5, 10, 25, 50, 100];

  // Filters
  inactiveDays?: number = 60; // default: inactive for 60+ days

  // UI States
  isLoading = true;
  errorMessage = '';

  private subscriptions = new Subscription();

  constructor(private customerService: CustomerService, private whatsAppService: WhatsappService) { }

  ngOnInit(): void {
    this.loadInactiveCustomers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadInactiveCustomers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.subscriptions.add(
      this.customerService.getInactivePaged({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        day: this.inactiveDays || undefined
      }).subscribe({
        next: (result: PagedResult<Customer>) => {
          this.inactiveCustomers = result.data;
          this.totalCount = result.totalCount;
          this.totalPages = result.totalPages;
          this.hasNextPage = result.hasNextPage;
          this.hasPreviousPage = result.hasPreviousPage;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load inactive customers';
          this.isLoading = false;
          this.inactiveCustomers = [];
        }
      })
    );
  }

  // === Selection Logic ===
  toggleSelection(customerId: number) {
    if (this.selectedCustomers.includes(customerId)) {
      this.selectedCustomers = this.selectedCustomers.filter(id => id !== customerId);
    } else {
      this.selectedCustomers.push(customerId);
    }
    // If deselecting, turn off select all mode
    if (!this.selectedCustomers.includes(customerId)) {
      this.selectAllMode = false;
    }
  }

  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.selectAllMode = true;

      // Optimistically select current page items so UI updates instantly
      const currentPageIds = this.inactiveCustomers.map(c => c.id);
      this.selectedCustomers = [...new Set([...this.selectedCustomers, ...currentPageIds])];

      // Select all customers across all pages in background
      this.customerService.getInactivePaged({
        pageNumber: 1,
        pageSize: this.totalCount > 0 ? this.totalCount : 10000, // Try to get all
        day: this.inactiveDays || undefined
      }).subscribe({
        next: (result: PagedResult<Customer>) => {
          this.selectedCustomers = result.data.map(c => c.id);
          console.log(`Loaded ${this.selectedCustomers.length} customers for selection`);
        },
        error: (err) => {
          console.error('Failed to load all customers for selection', err);
          // We keep selectAllMode = true so visuals are correct
          // But we might only have partial IDs in selectedCustomers
        }
      });
    } else {
      this.selectedCustomers = [];
      this.selectAllMode = false;
    }
  }

  isAllSelected(): boolean {
    if (this.selectAllMode) return true;
    return this.inactiveCustomers.length > 0 &&
      this.inactiveCustomers.every(c => this.selectedCustomers.includes(c.id));
  }

  isIndeterminate(): boolean {
    const currentPageSelected = this.inactiveCustomers.filter(c => this.selectedCustomers.includes(c.id)).length;
    return currentPageSelected > 0 && currentPageSelected < this.inactiveCustomers.length && !this.selectAllMode;
  }

  isCustomerSelected(customerId: number): boolean {
    // If select all mode is active, all customers are selected
    // Otherwise, check if the customer ID is in the selectedCustomers array
    return this.selectAllMode || this.selectedCustomers.includes(customerId);
  }

  sendMessage() {
    // If in select all mode but IDs not loaded yet (or partial load), warn user
    if (this.selectAllMode && this.selectedCustomers.length < this.totalCount) {
      const retry = confirm(
        `Warning: Only ${this.selectedCustomers.length} out of ${this.totalCount} customers are currently loaded for sending.\n` +
        `This might be due to a network issue or loading delay.\n\n` +
        `Do you want to try loading them again?`
      );

      if (retry) {
        // Retry loading
        this.isLoading = true;
        this.customerService.getInactivePaged({
          pageNumber: 1,
          pageSize: this.totalCount,
          day: this.inactiveDays || undefined
        }).subscribe({
          next: (result) => {
            this.selectedCustomers = result.data.map(c => c.id);
            this.isLoading = false;
            this.sendMessage(); // Recursive call after success
          },
          error: (err) => {
            this.isLoading = false;
            alert('Failed to load customers: ' + err.message);
          }
        });
      }
      return;
    }

    if (this.selectedCustomers.length === 0) return;

    const confirmed = confirm(
      `Send reminder to ${this.selectedCustomers.length} inactive customer(s)?\n\n` +
      this.inactiveCustomers
        .filter(c => this.selectedCustomers.includes(c.id))
        .map(c => `• ${c.name} (${c.cusCode})`)
        .join('\n')
    );

    if (!confirmed) return;

    this.whatsAppService.sendInactiveReminder(this.selectedCustomers).subscribe({
      next: (response) => {
        if (response.success) {
          const data = response.data;
          alert(
            `Reminder Sent!\n\n` +
            `Successful: ${data.totalSuccessful}\n` +
            `Failed: ${data.totalFailed}\n\n` +
            `Check WhatsApp gateway for details.`
          );
        } else {
          alert('Failed: ' + (response.message || 'Unknown error'));
        }
        this.selectedCustomers = []; // Clear selection
        this.selectAllMode = false;
      },
      error: (err) => {
        alert('Error sending message: ' + (err.error?.message || err.message));
        console.error(err);
      }
    });
  }

  // === Pagination ===
  onPageSizeChange() {
    this.pageNumber = 1;
    this.loadInactiveCustomers();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.pageNumber) {
      this.pageNumber = page;
      this.loadInactiveCustomers();
    }
  }

  previousPage() {
    if (this.hasPreviousPage) {
      this.pageNumber--;
      this.loadInactiveCustomers();
    }
  }

  nextPage() {
    if (this.hasNextPage) {
      this.pageNumber++;
      this.loadInactiveCustomers();
    }
  }

  getVisiblePages(): number[] {
    const window = 5;
    let start = Math.max(1, this.pageNumber - Math.floor((window - 1) / 2));
    let end = Math.min(this.totalPages, start + window - 1);
    if (end === this.totalPages) {
      start = Math.max(1, this.totalPages - window + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  refresh() {
    this.loadInactiveCustomers();
  }
}
