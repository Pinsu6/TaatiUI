import { Injectable } from '@angular/core';
import { ApiConfig } from '../config/api.config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {
  private readonly apiUrl = ApiConfig.ENDPOINTS.WHATSAPP.BASE;

  constructor(private http: HttpClient) {}

  sendInactiveReminder(customerIds: number[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/inactive-reminder`, { customerIds });
  }
}
