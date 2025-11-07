import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../../shared/models/api-response.model';
import { AnalyticsDto } from '../../shared/models/analytics-dto.model';
import { ProductInsightsDto } from '../../shared/models/product-insights-dto.model';
import { InventoryAnalyticsDto } from '../../shared/models/inventory-analytics-dto.model';
import { DashboardDto } from '../../shared/models/dashboard-dto.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly apiUrl = 'http://localhost:5272/api/Analytics';
  // private readonly apiUrl = 'http://localhost:5272/api/Analytics';
   //private readonly apiUrl = 'https://api.tatipharma.com/api/customer';

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

  getProductInsights(): Observable<ProductInsightsDto> {
    return this.http.get<ApiResponse<ProductInsightsDto>>(`${this.apiUrl}/product-insights`)
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

  getInventoryAnalytics(): Observable<InventoryAnalyticsDto> {
    return this.http.get<ApiResponse<InventoryAnalyticsDto>>(`${this.apiUrl}/inventory`)
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
    return this.http.get<ApiResponse<DashboardDto>>(`${this.apiUrl}/dashboard`)
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

