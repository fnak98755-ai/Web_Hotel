import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  template: `
    <div class="page">
      <nav class="navbar">
        <div class="nav-inner">
          <a routerLink="/" class="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Home
          </a>
          <div class="nav-links">
            <a routerLink="/login" class="nav-btn">Sign In</a>
            <a routerLink="/" class="nav-btn">Browse Rooms</a>
          </div>
        </div>
      </nav>

      <div class="reg-wrap">
        <div class="reg-card">
          <div class="reg-top">
            <div class="reg-icon">&#128100;</div>
            <h2>Create Account</h2>
            <p>Join us to book rooms and manage your reservations.</p>
          </div>

          <form (ngSubmit)="onRegister()" class="reg-form">
            <div class="field">
              <label>Username</label>
              <input type="text" [(ngModel)]="username" name="username" placeholder="Your username" required />
            </div>
            <div class="field">
              <label>Email</label>
              <input type="email" [(ngModel)]="email" name="email" placeholder="your@email.com" required />
            </div>
            <div class="field">
              <label>Password</label>
              <input type="password" [(ngModel)]="password" name="password" placeholder="Create a password" required />
            </div>

            <p class="msg error" *ngIf="error">{{ error }}</p>
            <p class="msg success" *ngIf="success">{{ success }}</p>

            <button type="submit" class="reg-btn" [disabled]="loading">
              {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>

          <p class="reg-footer">Already have an account? <a routerLink="/login">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: #f8f9fc; font-family: 'Inter','Segoe UI',system-ui,sans-serif; }
    .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(10,12,18,0.92); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,0.05); }
    .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 28px; height: 72px; display: flex; align-items: center; justify-content: space-between; }
    .back-btn { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 600; text-decoration: none; }
    .back-btn:hover { color: #d4a853; }
    .back-btn svg { width: 20px; height: 20px; }
    .nav-links { display: flex; gap: 8px; }
    .nav-btn { padding: 8px 18px; border-radius: 5px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); text-decoration: none; transition: all 0.25s; }
    .nav-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }

    .reg-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 100px 24px 40px; }
    .reg-card { background: #fff; border-radius: 5px; padding: 48px 40px; width: 440px; max-width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; animation: fadeUp 0.5s ease; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .reg-top { text-align: center; margin-bottom: 32px; }
    .reg-icon { font-size: 44px; margin-bottom: 12px; }
    .reg-top h2 { font-size: 24px; font-weight: 800; color: #0a0c12; margin-bottom: 4px; }
    .reg-top p { font-size: 14px; color: #888; }

    .reg-form { display: flex; flex-direction: column; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: 12px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.3px; }
    .field input { padding: 12px 14px; border: 1px solid #e5e5e5; border-radius: 5px; font-size: 14px; outline: none; transition: all 0.2s; background: #fafafa; }
    .field input:focus { border-color: #d4a853; background: #fff; box-shadow: 0 0 0 3px rgba(212,168,83,0.08); }
    .msg { font-size: 13px; text-align: center; padding: 10px; border-radius: 5px; }
    .msg.error { color: #e53935; background: rgba(229,57,53,0.06); }
    .msg.success { color: #2e7d32; background: rgba(46,125,50,0.06); }
    .reg-btn { padding: 14px; background: #d4a853; color: #0a0c12; border: none; border-radius: 5px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.25s; margin-top: 4px; }
    .reg-btn:hover:not(:disabled) { background: #c49a3f; transform: translateY(-1px); }
    .reg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .reg-footer { text-align: center; font-size: 13px; color: #888; margin-top: 24px; }
    .reg-footer a { color: #d4a853; text-decoration: none; font-weight: 600; }
    .reg-footer a:hover { text-decoration: underline; }
  `]
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  error = '';
  success = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    if (!this.username || !this.email || !this.password) { this.error = 'Please fill in all fields.'; return; }
    this.loading = true; this.error = ''; this.success = '';
    this.auth.register(this.username, this.email, this.password).subscribe({
      next: () => {
        this.success = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => { this.error = err.error?.error || 'Registration failed.'; this.loading = false; }
    });
  }
}
