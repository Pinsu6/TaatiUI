import { Component } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { Router } from '@angular/router';
import { PagedResult } from '../../shared/models/paged-result.model';
import { ProductFilter } from '../../shared/models/product-filter.model';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  searchTerm = '';
  selectedCategory = 'All Categories';
  categories = ['All Categories', 'Antibiotics', 'Painkillers', 'Vitamins', 'Others'];  // Static for now

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

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.searchSubject.pipe(debounceTime(300)).subscribe(term => {
        this.searchTerm = term;
        this.pageNumber = 1;
        this.loadProducts();
      })
    );
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const drugTypeId = this.selectedCategory === 'All Categories' ? undefined
      : this.getCategoryId(this.selectedCategory);

    const filter: ProductFilter = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      drugTypeId
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

  onCategoryChange(): void {
    this.pageNumber = 1;
    this.loadProducts();  // FIXED: Explicit reload
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
    this.loadProducts();
  }

  viewProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }

  private getCategoryId(name: string): number | undefined {
    const map: Record<string, number> = {
      'Antibiotics': 1,  // Match your DB IDs
      'Painkillers': 2,
      'Vitamins': 3,
      'Others': 4
    };
    return map[name];
  }
}
