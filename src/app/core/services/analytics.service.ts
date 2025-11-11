import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../../shared/models/api-response.model';
import { AnalyticsDto } from '../../shared/models/analytics-dto.model';
import { ProductInsightsDto } from '../../shared/models/product-insights-dto.model';
import { InventoryAnalyticsDto } from '../../shared/models/inventory-analytics-dto.model';
import { DashboardDto } from '../../shared/models/dashboard-dto.model';
import { ApiConfig } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly apiUrl = ApiConfig.ENDPOINTS.ANALYTICS.BASE;

  constructor(private http: HttpClient) {}

  getAnalytics(): Observable<AnalyticsDto> {
    return this.http.get<ApiResponse<AnalyticsDto>>(this.apiUrl)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to fetch analytics');
          }
        }),
        catchError(this.handleError)
      );
  }

  getAnalyticsWithFilters(filters: { timePeriod?: string; city?: string | null; productId?: number | null }): Observable<AnalyticsDto> {
    // Build query parameters - only include non-null/non-empty values
    const params: any = {};
    if (filters.timePeriod) {
      params.timePeriod = filters.timePeriod;
    }
    if (filters.city) {
      params.city = filters.city;
    }
    if (filters.productId) {
      params.productId = filters.productId;
    }

    // Build query string
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    const url = queryString ? `${this.apiUrl}?${queryString}` : this.apiUrl;

    console.log('Fetching analytics with URL:', url);

    return this.http.get<ApiResponse<AnalyticsDto>>(url)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to fetch filtered analytics');
          }
        }),
        catchError(this.handleError)
      );
  }

  getProductInsights(): Observable<ProductInsightsDto> {
    return this.http.get<ApiResponse<ProductInsightsDto>>(ApiConfig.ENDPOINTS.ANALYTICS.PRODUCT_INSIGHTS)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to fetch product insights');
          }
        }),
        catchError(this.handleError)
      );
  }

  getProductInsightsWithFilters(filters: { drugTypeId?: number | null; startDate?: string; endDate?: string }): Observable<ProductInsightsDto> {
    // Build query parameters - only include non-null/non-empty values
    const params: any = {};
    if (filters.drugTypeId) {
      params.drugTypeId = filters.drugTypeId;
    }
    if (filters.startDate) {
      params.startDate = filters.startDate;
    }
    if (filters.endDate) {
      params.endDate = filters.endDate;
    }

    // Build query string
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    const url = queryString ? `${ApiConfig.ENDPOINTS.ANALYTICS.PRODUCT_INSIGHTS}?${queryString}` : ApiConfig.ENDPOINTS.ANALYTICS.PRODUCT_INSIGHTS;

    console.log('Fetching product insights with URL:', url);

    return this.http.get<ApiResponse<ProductInsightsDto>>(url)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to fetch filtered product insights');
          }
        }),
        catchError(this.handleError)
      );
  }

  getInventoryAnalytics(): Observable<InventoryAnalyticsDto> {
    return this.http.get<ApiResponse<InventoryAnalyticsDto>>(ApiConfig.ENDPOINTS.ANALYTICS.INVENTORY)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to fetch inventory analytics');
          }
        }),
        catchError(this.handleError)
      );
  }

  getDashboard(): Observable<DashboardDto> {
    return this.http.get<ApiResponse<DashboardDto>>(ApiConfig.ENDPOINTS.ANALYTICS.DASHBOARD)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to fetch dashboard data');
          }
        }),
        catchError(this.handleError)
      );
  }

  getDashboardWithFilters(filters: { timePeriod?: string; city?: string | null; productId?: number | null }): Observable<DashboardDto> {
    // Build query parameters - only include non-null/non-empty values
    const params: any = {};
    if (filters.timePeriod) {
      params.timePeriod = filters.timePeriod;
    }
    if (filters.city) {
      params.city = filters.city;
    }
    if (filters.productId) {
      params.productId = filters.productId;
    }

    // Build query string
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    const url = queryString ? `${ApiConfig.ENDPOINTS.ANALYTICS.DASHBOARD}?${queryString}` : ApiConfig.ENDPOINTS.ANALYTICS.DASHBOARD;

    console.log('Fetching dashboard with URL:', url);

    return this.http.get<ApiResponse<DashboardDto>>(url)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to fetch filtered dashboard data');
          }
        }),
        catchError(this.handleError)
      );
  }

  exportProductInsights(format: 'pdf' | 'excel' | 'csv', payload: any): Observable<Blob> {
    // PDF and Excel exports use the Products endpoint
    const url = ApiConfig.ENDPOINTS.ANALYTICS.EXPORT_PRODUCT_INSIGHTS(format, format === 'pdf' || format === 'excel');
    return this.http.post(url, payload, { responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }

  exportInventoryAnalytics(format: 'pdf' | 'excel' | 'csv', payload: any): Observable<Blob> {
    const url = ApiConfig.ENDPOINTS.ANALYTICS.EXPORT_INVENTORY(format);
    return this.http.post(url, payload, { responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
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
}

