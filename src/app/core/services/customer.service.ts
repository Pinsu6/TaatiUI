import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Customer } from '../../shared/models/customer.model';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { CustomerDto } from '../../shared/models/customer-dto.model';
import { CustomerFilter } from '../../shared/models/customer-filter.model';
import { PagedResult } from '../../shared/models/paged-result.model';
import { CustomerDetailDto } from '../../shared/models/customer-detail-dto.model';
import { ApiConfig } from '../config/api.config';
import { InactiveCustomerDto } from '../../shared/models/inactive-customer-dto.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private readonly apiUrl = ApiConfig.ENDPOINTS.CUSTOMER.BASE;

  constructor(private http: HttpClient) { }

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

  exportCustomers(format: 'pdf' | 'excel' | 'csv', payload: any): Observable<Blob> {
    // PDF export uses different endpoint with capital C
    const url = ApiConfig.ENDPOINTS.CUSTOMER.EXPORT(format, format === 'pdf');
    return this.http.post(url, payload, { responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<CustomerDetailDto> {
    return this.http.get<ApiResponse<CustomerDetailDto>>(ApiConfig.ENDPOINTS.CUSTOMER.BY_ID(id))
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

  // Add this method inside CustomerService class
  getInactivePaged(filter: { pageNumber: number; pageSize: number; day?: number }): Observable<PagedResult<Customer>> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.day !== undefined && filter.day !== null && filter.day > 0) {
      params = params.set('day', filter.day.toString());
    }

    const url = `${this.apiUrl}/inactive`; // https://localhost:44367/api/Customer/inactive

    return this.http.get<ApiResponse<PagedResult<InactiveCustomerDto>>>(url, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return {
              data: this.mapToInactiveCustomers(response.data.data),
              totalCount: response.data.totalCount,
              pageNumber: response.data.pageNumber,
              pageSize: response.data.pageSize,
              totalPages: response.data.totalPages || Math.ceil(response.data.totalCount / response.data.pageSize),
              hasNextPage: response.data.hasNextPage,
              hasPreviousPage: response.data.hasPreviousPage
            };
          } else {
            throw new Error(response.message || 'Failed to fetch inactive customers');
          }
        }),
        catchError(this.handleError)
      );
  }

  // Add this method right below your existing mapToCustomers()
  private mapToInactiveCustomers(dtos: InactiveCustomerDto[]): Customer[] {
    return dtos.map(dto => ({
      id: dto.customerId,
      cusCode: dto.cusCode || '',
      name: `${dto.cusFirstname || ''} ${dto.cusLastname || ''}`.trim() || 'Unknown',
      email: dto.cusEmail || '',
      phone: dto.cusMobileno || '',
      status: dto.bitIsActive === false ? 'inactive' : 'active',
      company: '',
      address: dto.address || '',
      cusMobileno: dto.cusMobileno || '',
      cusPhonenoO: dto.cusPhonenoO || '',        // fallback to empty string
      cusPhonenoR: dto.cusPhonenoR || '',        // fallback to empty string
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
      bitIsActive: dto.bitIsActive ?? false,
      storeAmtremain: dto.storeAmtremain ?? 0,
      storeAmtused: dto.storeAmtused ?? 0,
      customerType: null,
      employee: null,
      totalOrders: 0,
      lifetimeValue: 0,
      lastPurchase: dto.dateCreated || '',
      activePolicies: 0,
      orderHistory: [],
      engagement: []
    }));
  }

  searchMessageLogs(filter: any): Observable<any> {
    const url = ApiConfig.ENDPOINTS.MESSAGE_LOG.SEARCH;
    return this.http.post<ApiResponse<any>>(url, filter).pipe(
      map(res => {
        if (res.success) return res;
        throw new Error(res.message || 'Failed to search logs');
      }),
      catchError(this.handleError)
    );
  }
}
