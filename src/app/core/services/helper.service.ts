import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { HelperProductDto } from '../../shared/models/helper-product-dto.model';
import { HelperDrugTypeDto } from '../../shared/models/helper-drug-type-dto.model';
import { HelperCityDto } from '../../shared/models/helper-city-dto.model';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  private readonly productsUrl = 'http://localhost:5272/api/Helper/products';
  private readonly drugTypesUrl = 'http://localhost:5272/api/Helper/drug-types';
  private readonly citiesUrl = 'http://localhost:5272/api/Helper/cities';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<HelperProductDto[]> {
    return this.http.get<ApiResponse<HelperProductDto[]>>(this.productsUrl)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to load products');
        }),
        catchError(error => {
          console.error('Error fetching helper products:', error);
          return throwError(() => new Error(error.message || 'Failed to load products'));
        })
      );
  }

  getDrugTypes(): Observable<HelperDrugTypeDto[]> {
    return this.http.get<ApiResponse<HelperDrugTypeDto[]>>(this.drugTypesUrl)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to load drug types');
        }),
        catchError(error => {
          console.error('Error fetching drug types:', error);
          return throwError(() => new Error(error.message || 'Failed to load drug types'));
        })
      );
  }

  getCities(): Observable<HelperCityDto[]> {
    return this.http.get<ApiResponse<HelperCityDto[]>>(this.citiesUrl)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to load cities');
        }),
        catchError(error => {
          console.error('Error fetching cities:', error);
          return throwError(() => new Error(error.message || 'Failed to load cities'));
        })
      );
  }
}

