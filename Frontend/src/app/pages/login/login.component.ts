import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="brand">
          <span class="brand-name">Hotel_Booking_System</span>
          <span class="brand-sub">SETEC</span>
        </div>
        <h2 class="login-title">Sign In</h2>
        <p class="login-subtitle">Enter your credentials to continue</p>

        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="Enter your email" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Enter your password" required />
          </div>
          <p class="error-msg" *ngIf="error">{{ error }}</p>
          <button type="submit" class="login-btn" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #1a1d29;
    }
    .login-card {
      background: #fff;
      border-radius: 16px;
      padding: 48px 40px;
      width: 420px;
      max-width: 90vw;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .brand {
      text-align: center;
      margin-bottom: 32px;
    }
    .brand-name {
      display: block;
      font-size: 22px;
      font-weight: 700;
      color: #ff6b35;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .brand-sub {
      display: block;
      font-size: 12px;
      color: #888;
      margin-top: 4px;
    }
    .login-title {
      font-size: 24px;
      color: #1a1d29;
      margin-bottom: 4px;
      text-align: center;
    }
    .login-subtitle {
      font-size: 14px;
      color: #888;
      text-align: center;
      margin-bottom: 28px;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: #555;
    }
    .form-group input {
      padding: 12px 14px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-group input:focus {
      border-color: #ff6b35;
    }
    .error-msg {
      color: #e53935;
      font-size: 13px;
      text-align: center;
    }
    .login-btn {
      padding: 14px;
      background: #ff6b35;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 4px;
    }
    .login-btn:hover:not(:disabled) {
      background: #e55a2b;
    }
    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    @media (max-width: 768px) {
      .login-card {
        padding: 32px 20px;
      }
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.error = 'Please enter your email and password.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        const user = this.auth.getUser();
        if (user?.role === 'admin' || user?.role === 'staff') {
          this.router.navigate(['/bookings']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        if (err.status === 0) {
          this.error = 'Cannot reach the server. Check your internet connection.';
        } else if (err.error?.error) {
          this.error = err.error.error;
        } else if (err.status === 504 || err.status === 502) {
          this.error = 'Server took too long to respond (cold start). Please try again.';
        } else {
          this.error = `Login failed (HTTP ${err.status || 'unknown'}). Please try again.`;
        }
        this.loading = false;
      }
    });
  }
}
