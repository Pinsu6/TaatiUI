import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Customer } from '../../shared/models/customer.model';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { CustomerDto } from '../../shared/models/customer-dto.model';
import { CustomerFilter } from '../../shared/models/customer-filter.model';
import { PagedResult } from '../../shared/models/paged-result.model';
import { CustomerDetailDto } from '../../shared/models/customer-detail-dto.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

 private readonly apiUrl = 'https://localhost:44367/api/customer';
  // private readonly apiUrl = 'http://localhost:5272/api/customer';
   //private readonly apiUrl = 'https://api.tatipharma.com/api/customer';
    // GET /api/customer with query params

  constructor(private http: HttpClient) {}

  getPaged(filter: CustomerFilter): Observable<PagedResult<Customer>> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.search) {
      params = params.set('search', filter.search);
    }
    if (filter.isActive !== undefined) {
      params = params.set('isActive', filter.isActive.toString());
    }

    return this.http.get<ApiResponse<PagedResult<CustomerDto>>>(this.apiUrl, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return {
              data: this.mapToCustomers(response.data.data),
              totalCount: response.data.totalCount,
              pageNumber: response.data.pageNumber,
              pageSize: response.data.pageSize,
              totalPages: Math.ceil(response.data.totalCount / response.data.pageSize),
              hasNextPage: response.data.pageNumber < Math.ceil(response.data.totalCount / response.data.pageSize),
              hasPreviousPage: response.data.pageNumber > 1
            };
          } else {
            throw new Error(response.message || 'Failed to fetch customers');
          }
        }),
        catchError(this.handleError)
      );
  }

  private mapToCustomers(dtos: CustomerDto[]): Customer[] {
  return dtos.map(dto => ({
    id: dto.customerId,
    cusCode: dto.cusCode || '',
    name: `${dto.cusFirstname || ''} ${dto.cusLastname || ''}`.trim() || 'Unknown',
    email: dto.cusEmail || '',
    phone: dto.cusMobileno || '',
    status: dto.bitIsActive === true ? 'active' : 'inactive',  // Explicit boolean check
    company: '',  // Still dummy – extend later
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
    licenseExpiry: dto.licenseExpiry ?? null,
    creditlim: dto.creditlim ?? 0,
    creditdays: dto.creditdays ?? 0,
    dateCreated: dto.dateCreated || '',
    bitIsActive: dto.bitIsActive ?? false,  // Default to false if undefined
    storeAmtremain: dto.storeAmtremain ?? 0,
    storeAmtused: dto.storeAmtused ?? 0,
    customerType: null,  // Not in list API yet
    employee: null,      // Not in list API yet
    totalOrders: 0,
    lifetimeValue: 0,
    lastPurchase: dto.dateCreated || '',
    activePolicies: 0,
    orderHistory: [],
    engagement: []
  }));
}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMsg = 'An unexpected error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMsg = error.error.message;
    } else {
      if (error.error && error.error.errors && Array.isArray(error.error.errors)) {
        errorMsg = error.error.errors.join(', ');
      } else {
        errorMsg = error.error?.message || `Error Code: ${error.status}`;
      }
    }
    return throwError(() => new Error(errorMsg));
  }

  getById(id: number): Observable<CustomerDetailDto> {
  return this.http.get<ApiResponse<CustomerDetailDto>>(`${this.apiUrl}/${id}`)
    .pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch customer');
        }
      }),
      catchError(this.handleError)
    );
}
}
