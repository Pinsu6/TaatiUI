import { Component, OnDestroy } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { Router } from '@angular/router';
import { PagedResult } from '../../shared/models/paged-result.model';
import { ProductFilter } from '../../shared/models/product-filter.model';
import { debounceTime, Subject, Subscription, takeUntil } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { HelperService } from '../../core/services/helper.service';
import { HelperDrugTypeDto } from '../../shared/models/helper-drug-type-dto.model';

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnDestroy {
  lastUpdate: string = new Date().toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  searchTerm = '';
  selectedDrugTypeId: number | null = null;
  drugTypes: HelperDrugTypeDto[] = [];
  showExportModal = false;
  isExporting = false;
  exportErrorMessage: string | null = null;

  products: Product[] = [];
  isLoading = true;
  errorMessage = '';

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;
  pageSizes = [5, 10, 25, 50, 100];

  private searchSubject = new Subject<string>();
  private subscriptions = new Subscription();
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private router: Router,
    private helperService: HelperService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.searchSubject.pipe(debounceTime(300)).subscribe(term => {
        this.searchTerm = term;
        this.pageNumber = 1;
        this.loadProducts();
      })
    );
    this.loadProducts();
    this.loadDrugTypes();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filter: ProductFilter = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      drugTypeId: this.selectedDrugTypeId || undefined
    };

    this.subscriptions.add(
      this.productService.getPaged(filter).subscribe({
        next: (result: PagedResult<Product>) => {
          this.products = result.data;
          this.totalCount = result.totalCount;
          this.totalPages = result.totalPages;
          this.hasNextPage = result.hasNextPage;
          this.hasPreviousPage = result.hasPreviousPage;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load products';
          this.isLoading = false;
        }
      })
    );
  }

  onSearchChange(event: Event): void {
  const value = (event.target as HTMLInputElement).value.trim();
  this.searchSubject.next(value);
}

  onDrugTypeChange(): void {
    this.pageNumber = 1;
    this.loadProducts();
  }

  onPageSizeChange(): void {
    this.pageNumber = 1;
    this.loadProducts();
  }

  getVisiblePages(): number[] {
    const window = 5;
    let start = Math.max(1, this.pageNumber - Math.floor((window - 1) / 2));
    const end = Math.min(this.totalPages, start + window - 1);
    if (end === this.totalPages) start = Math.max(1, this.totalPages - window + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.loadProducts();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.pageNumber--;
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.pageNumber++;
      this.loadProducts();
    }
  }

  refresh(): void {
    this.lastUpdate = new Date().toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    this.loadProducts();
  }

  viewProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }

  openExportModal() { 
    this.showExportModal = true; 
  }

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
      payload = {
        pageNumber: 2147483647,
        pageSize: 100,
        search: this.searchTerm || 'string',
        drugTypeId: this.selectedDrugTypeId || undefined
      };
    }

    this.isExporting = true;
    this.exportErrorMessage = null;

    this.productService.exportProducts(format, payload).subscribe({
      next: (blob) => {
        this.downloadFile(blob, format);
        this.isExporting = false;
        this.closeExportModal();
      },
      error: (error) => {
        this.exportErrorMessage = error.message || 'Failed to export products.';
        this.isExporting = false;
      }
    });
  }

  private downloadFile(blob: Blob, format: 'pdf' | 'excel' | 'csv'): void {
    const extension = format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv';
    const fileName = `products-${new Date().toISOString()}.${extension}`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  loadDrugTypes() {
    this.helperService.getDrugTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (drugTypes) => {
          this.drugTypes = drugTypes;
        },
        error: (err) => {
          console.error('Error loading drug types:', err);
          // Don't show error to user, just log it
        }
      });
  }
}
