import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { PagedResult } from '../../shared/models/paged-result.model';
import { Product } from '../../shared/models/product.model';
import { ProductFilter } from '../../shared/models/product-filter.model';
import { ApiResponse } from '../../shared/models/api-response.model';
import { ProductResponseDto } from '../../shared/models/product-response-dto.model';
import { ProductDetailDto } from '../../shared/models/product-detail-dto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  //private apiUrl = 'https://localhost:44367/api/products';
   private apiUrl = 'https://api.tatipharma.com/api/products';
  

  constructor(private http: HttpClient) {}

  getPaged(filter: ProductFilter): Observable<PagedResult<Product>> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.search) params = params.set('search', filter.search);
    if (filter.drugTypeId) params = params.set('drugTypeId', filter.drugTypeId.toString());

    return this.http.get<ApiResponse<PagedResult<ProductResponseDto>>>(this.apiUrl, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return {
              data: response.data.data.map(this.mapToProduct),
              totalCount: response.data.totalCount,
              pageNumber: response.data.pageNumber,
              pageSize: response.data.pageSize,
              totalPages: Math.ceil(response.data.totalCount / response.data.pageSize),
              hasNextPage: response.data.pageNumber < Math.ceil(response.data.totalCount / response.data.pageSize),
              hasPreviousPage: response.data.pageNumber > 1
            };
          }
          throw new Error(response.message || 'Failed to load products');
        }),
        catchError(err => { throw err; })
      );
  }

  private mapToProduct(dto: ProductResponseDto): Product {
  return {
    id: dto.drugId,
    name: dto.drugName || 'Unknown',
    quickCode: dto.drugQuickcode || 'N/A',
    brandName: dto.brandName || 'N/A',
    quantityPack: dto.quantityPack || 'N/A',
    drugTypeName: dto.drugTypeName || 'Uncategorized',
    dosageFormName: dto.dosageFormName || 'N/A',
    manufacturerName: dto.manufacturerName || 'N/A',
    // Legacy (keep for now, ignore in UI)
    sku: dto.drugCode || 'N/A',
    description: dto.drugName,  // Fallback
    category: dto.drugTypeName || 'Uncategorized',
    price: 'N/A',  // Removed
    stock: true,   // Removed
    currentStock: 0,  // Removed
    totalSales: 0,
    totalRevenue: 0,
    turnoverRate: 'N/A',
    revenue: 0,
    growth: '',
    status: dto.bitIsActive ? 'Active' : 'Inactive'
  };
}
getById(id: number): Observable<ProductDetailDto> {
    return this.http.get<ApiResponse<ProductDetailDto>>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        if (res.success && res.data) return res.data;
        throw new Error(res.message || 'Product not found');
      }),
      catchError(err => throwError(() => err))
    );
  }
}
