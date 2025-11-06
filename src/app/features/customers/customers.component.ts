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
  searchQuery: string = '';
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
