import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginResponse } from '../../shared/models/login-response.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { LoginCredentials } from '../../shared/models/login-credentials.model';
import { LoginRequest } from '../../shared/models/login-request.model';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

 // private readonly apiUrl = 'https://localhost:44367/api/auth';
  private readonly apiUrl = 'http://localhost:5272/api/auth';
 // private readonly apiUrl = 'https://api.tatipharma.com/api/auth'; // Base API URL
  
  private isAuthenticated = false;
  private readonly tokenKey = 'authToken';
  private readonly userKey = 'currentUser'; // Optional: Store user info

  constructor(private http: HttpClient, private router: Router) {
    // Check on init if token exists
    this.isAuthenticated = this.isLoggedIn();
  }

  login(credentials: LoginCredentials): Observable<boolean> {
    const request: LoginRequest = {
      userName: credentials.username, // Map username to userName
      password: credentials.password
    };

    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, request)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            // Store token and user info
            localStorage.setItem(this.tokenKey, response.data.token);
            localStorage.setItem(this.userKey, JSON.stringify(response.data));
            this.isAuthenticated = true;
            return true;
          } else {
            throw new Error(response.message || 'Login failed');
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    this.isAuthenticated = false;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return false;

    // Optional: Decode JWT to check expiry (use jwt-decode lib for prod)
    // For now, just check presence
    return true;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): LoginResponse | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMsg = 'An unexpected error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMsg = error.error.message;
    } else {
      // Server-side error
      if (error.error && error.error.errors && Array.isArray(error.error.errors)) {
        errorMsg = error.error.errors.join(', ');
      } else {
        errorMsg = error.error?.message || `Error Code: ${error.status}`;
      }
    }
    return throwError(() => new Error(errorMsg));
  }
}
