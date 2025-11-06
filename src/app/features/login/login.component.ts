import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { LoginCredentials } from '../../shared/models/login-credentials.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credentials: LoginCredentials = { username: '', password: '' };
  errorMessage: string = '';
  isLoading: boolean = false; // Loading state

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          this.errorMessage = err.message; // Handles API errors like "Invalid username or password"
        }
      });
  }
}
