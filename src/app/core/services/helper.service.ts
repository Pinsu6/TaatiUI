import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { HelperProductDto } from '../../shared/models/helper-product-dto.model';
import { HelperDrugTypeDto } from '../../shared/models/helper-drug-type-dto.model';
import { HelperCityDto } from '../../shared/models/helper-city-dto.model';
import { ApiConfig } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  private readonly productsUrl = ApiConfig.ENDPOINTS.HELPER.PRODUCTS;
  private readonly drugTypesUrl = ApiConfig.ENDPOINTS.HELPER.DRUG_TYPES;
  private readonly citiesUrl = ApiConfig.ENDPOINTS.HELPER.CITIES;

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

