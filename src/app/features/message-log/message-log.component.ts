import { Component } from '@angular/core';
import { MessageLog } from '../../shared/models/message-log.model';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { CustomerService } from '../../core/services/customer.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-log',
  standalone: false,
  templateUrl: './message-log.component.html',
  styleUrl: './message-log.component.css'
})
export class MessageLogComponent {

  messageLogs: MessageLog[] = [];

  // Filters
  searchQuery = '';
  selectedStatus = '';
  selectedEndpoint = '';
  fromDate: string | null = null;
  toDate: string | null = null;

  // Pagination
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  // UI
  isLoading = true;
  errorMessage = '';

  private searchSubject = new Subject<string>();
  private subscriptions = new Subscription();

  constructor(private customerService: CustomerService) { }

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
      this.pageNumber = 1;
      this.loadLogs();
    });
    this.loadLogs();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const payload: any = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      search: this.searchQuery || undefined,
      status: this.selectedStatus || undefined,
      apiEndpoint: this.selectedEndpoint || undefined,
      fromDateUtc: this.fromDate ? new Date(this.fromDate).toISOString() : undefined,
      toDateUtc: this.toDate ? new Date(this.toDate + 'T23:59:59').toISOString() : undefined
    };

    this.subscriptions.add(
      this.customerService.searchMessageLogs(payload).subscribe({
        next: (result: any) => {
          console.log('API Result:', result); // Debug log
          if (result.success && result.data) {
            this.messageLogs = result.data.data;
            console.log('Message Logs:', this.messageLogs); // Debug log to see messageContent
            this.totalCount = result.data.totalCount;
            this.totalPages = result.data.totalPages;
            this.hasNextPage = result.data.hasNextPage;
            this.hasPreviousPage = result.data.hasPreviousPage;
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load message logs';
          this.isLoading = false;
        }
      })
    );
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  applyFilters(): void {
    this.pageNumber = 1;
    this.loadLogs();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedEndpoint = '';
    this.fromDate = null;
    this.toDate = null;
    this.pageNumber = 1;
    this.loadLogs();
  }

  // Pagination
  previousPage() { if (this.hasPreviousPage) { this.pageNumber--; this.loadLogs(); } }
  nextPage() { if (this.hasNextPage) { this.pageNumber++; this.loadLogs(); } }
  goToPage(page: number) { this.pageNumber = page; this.loadLogs(); }

  getVisiblePages(): number[] {
    const window = 5;
    let start = Math.max(1, this.pageNumber - Math.floor((window - 1) / 2));
    let end = Math.min(this.totalPages, start + window - 1);
    if (end === this.totalPages) start = Math.max(1, this.totalPages - window + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  refresh() {
    this.loadLogs();
  }
}
