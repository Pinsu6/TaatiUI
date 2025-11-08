import { Component } from '@angular/core';
import { Customer } from '../../shared/models/customer.model';
import { CustomerService } from '../../core/services/customer.service';
import { CustomerFilter } from '../../shared/models/customer-filter.model';
import { PagedResult } from '../../shared/models/paged-result.model';
import { debounceTime, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-customers',
  standalone: false,
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent {
  lastUpdate: string = new Date().toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  searchQuery: string = '';
  showExportModal = false;
  isExporting = false;
  exportErrorMessage: string | null = null;
  selectedStatus: string = 'all';
  customers: Customer[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  pageNumber: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;
  pageSizes: number[] = [5, 10, 25, 50, 100];

  private searchSubject = new Subject<string>();
  private subscriptions: Subscription = new Subscription();

  constructor(private customerService: CustomerService) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.searchSubject.pipe(debounceTime(300)).subscribe(search => {
        this.searchQuery = search;
        this.pageNumber = 1;
        this.loadCustomers();
      })
    );
    this.loadCustomers();
  }

  openExportModal() { this.showExportModal = true; }
  closeExportModal() {
    this.showExportModal = false;
    this.isExporting = false;
    this.exportErrorMessage = null;
  }

  export(format: 'pdf' | 'excel' | 'csv') {
    let payload: any;

    if (format === 'excel') {
      payload = {
        pageNumber: 1,
        pageSize: 1
      };
    } else if (format === 'pdf') {
      payload = {
        pageNumber: 1,
        pageSize: 1
      };
    } else {
      const isActive = this.selectedStatus === 'active' ? true :
        this.selectedStatus === 'inactive' ? false : undefined;

      payload = {
        pageNumber: 2147483647,
        pageSize: 100,
        search: this.searchQuery || 'string',
        isActive: isActive ?? true
      };
    }

    this.isExporting = true;
    this.exportErrorMessage = null;

    this.customerService.exportCustomers(format, payload).subscribe({
      next: (blob) => {
        this.downloadFile(blob, format);
        this.isExporting = false;
        this.closeExportModal();
      },
      error: (error) => {
        this.exportErrorMessage = error.message || 'Failed to export customers.';
        this.isExporting = false;
      }
    });
  }

  private downloadFile(blob: Blob, format: 'pdf' | 'excel' | 'csv'): void {
    const extension = format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv';
    const fileName = `customers-${new Date().toISOString()}.${extension}`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const isActive = this.selectedStatus === 'active' ? true
      : this.selectedStatus === 'inactive' ? false
        : undefined;

    const filter: CustomerFilter = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      search: this.searchQuery || undefined,
      isActive
    };

    this.subscriptions.add(
      this.customerService.getPaged(filter).subscribe({
        next: (pagedResult: PagedResult<Customer>) => {
          this.customers = pagedResult.data;
          this.totalCount = pagedResult.totalCount;
          this.totalPages = pagedResult.totalPages;
          this.hasNextPage = pagedResult.hasNextPage;
          this.hasPreviousPage = pagedResult.hasPreviousPage;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.isLoading = false;
          this.customers = [];
        }
      })
    );
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onStatusChange(): void {
    this.pageNumber = 1;
    this.loadCustomers();
  }

  onPageSizeChange(): void {
    this.pageNumber = 1;
    this.loadCustomers();
  }
  getVisiblePages(): number[] {
    const window = 5;                     // always show 5 numbers
    let start = Math.max(1, this.pageNumber - Math.floor((window - 1) / 2));
    const end = Math.min(this.totalPages, start + window - 1);

    // adjust start if we hit the right edge
    if (end === this.totalPages) {
      start = Math.max(1, this.totalPages - window + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
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

  refresh(): void {
    this.loadCustomers();
  }
}
