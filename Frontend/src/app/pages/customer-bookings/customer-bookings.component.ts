import { Component, OnInit } from '@angular/core';
import { CustomerBookingService, CustomerBooking } from '../../services/customer-booking.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-bookings',
  template: `
    <div class="page">
      <nav class="navbar">
        <div class="nav-inner">
          <a routerLink="/" class="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Rooms
          </a>
          <div class="nav-links">
            <span class="user-badge">{{ auth.getUser()?.email }}</span>
            <a (click)="logout()" class="nav-btn">Sign Out</a>
          </div>
        </div>
      </nav>

      <div class="bookings-wrap">
        <div class="page-head">
          <h1>My Bookings</h1>
          <p>Manage your upcoming and past reservations.</p>
        </div>

        <div class="load-state" *ngIf="loading">
          <div class="spinner"></div>
        </div>

        <div class="list" *ngIf="!loading && bookings.length > 0">
          <div class="b-card" *ngFor="let b of bookings">
            <div class="b-head">
              <div class="b-room">
                <div class="b-avatar" [style.background]="avatarColor(b.status)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21V9l9-6 9 6v12"/><path d="M9 21V13h6v8"/></svg>
                </div>
                <div>
                  <div class="b-room-num">Room {{ b.room?.roomNumber }}</div>
                  <div class="b-room-type">{{ b.room?.type || '---' }}</div>
                </div>
              </div>
              <span class="b-status" [ngClass]="b.status">{{ b.status | titlecase }}</span>
            </div>
            <div class="b-dates">
              <div class="b-date">
                <span class="bd-label">Check-In</span>
                <span class="bd-value">{{ b.checkIn | date:'mediumDate' }}</span>
              </div>
              <div class="b-arrow">&#8594;</div>
              <div class="b-date">
                <span class="bd-label">Check-Out</span>
                <span class="bd-value">{{ b.checkOut | date:'mediumDate' }}</span>
              </div>
              <div class="b-total">
                <span class="bd-label">Total</span>
                <span class="bd-price">{{ '$' + b.totalAmount }}</span>
              </div>
            </div>
            <p class="b-requests" *ngIf="b.specialRequests"><strong>Requests:</strong> {{ b.specialRequests }}</p>
          </div>
        </div>

        <div class="empty-state" *ngIf="!loading && bookings.length === 0">
          <span class="empty-icon">&#128197;</span>
          <h3>No bookings yet</h3>
          <p>Ready for your next stay? <a routerLink="/">Browse our rooms</a> and book your perfect getaway.</p>
        </div>
      </div>

      <footer class="footer">
        <p>&copy; {{ currentYear }} SETEC Hotel</p>
      </footer>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: #f8f9fc; font-family: 'Inter','Segoe UI',system-ui,sans-serif; }
    .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(10,12,18,0.92); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,0.05); }
    .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 28px; height: 72px; display: flex; align-items: center; justify-content: space-between; }
    .back-btn { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 600; text-decoration: none; }
    .back-btn:hover { color: #d4a853; }
    .back-btn svg { width: 20px; height: 20px; }
    .user-badge { font-size: 12px; color: rgba(255,255,255,0.35); font-weight: 500; }
    .nav-links { display: flex; gap: 8px; align-items: center; }
    .nav-btn { padding: 8px 18px; border-radius: 5px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); cursor: pointer; background: transparent; border: none; transition: all 0.25s; }
    .nav-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }

    .bookings-wrap { max-width: 800px; margin: 0 auto; padding: 120px 24px 60px; }
    .page-head { margin-bottom: 40px; }
    .page-head h1 { font-size: 32px; font-weight: 800; color: #0a0c12; letter-spacing: -0.5px; }
    .page-head p { font-size: 15px; color: #888; margin-top: 4px; }

    .load-state { text-align: center; padding: 80px 0; }
    .spinner { width: 36px; height: 36px; border: 3px solid #eee; border-top-color: #d4a853; border-radius: 50%; margin: 0 auto; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .list { display: flex; flex-direction: column; gap: 16px; }
    .b-card { background: #fff; border-radius: 5px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); border: 1px solid #f0f0f0; transition: all 0.25s; }
    .b-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); border-color: #e5e5e5; }
    .b-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .b-room { display: flex; align-items: center; gap: 14px; }
    .b-avatar { width: 44px; height: 44px; border-radius: 5px; display: flex; align-items: center; justify-content: center; }
    .b-avatar svg { width: 22px; height: 22px; color: #fff; }
    .b-room-num { font-size: 16px; font-weight: 700; color: #0a0c12; }
    .b-room-type { font-size: 12px; color: #888; margin-top: 1px; }
    .b-status { padding: 4px 14px; border-radius: 5px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .b-status.confirmed { background: #e8f5e9; color: #2e7d32; }
    .b-status.checked_in { background: #e3f2fd; color: #1565c0; }
    .b-status.checked_out { background: #f3e5f5; color: #7b1fa2; }
    .b-status.cancelled { background: #fbe9e7; color: #c62828; }
    .b-status.pending { background: #fff3e0; color: #e65100; }
    .b-dates { display: flex; align-items: center; gap: 20px; padding: 16px 0; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
    .b-date { flex: 1; }
    .bd-label { display: block; font-size: 10px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .bd-value { font-size: 14px; font-weight: 600; color: #333; }
    .b-arrow { color: #ccc; font-size: 18px; }
    .b-total { text-align: right; flex-shrink: 0; }
    .bd-price { font-size: 18px; font-weight: 800; color: #d4a853; display: block; margin-top: 2px; }
    .b-requests { font-size: 13px; color: #666; margin-top: 14px; padding: 10px 14px; background: #fafafa; border-radius: 5px; }

    .empty-state { text-align: center; padding: 80px 20px; }
    .empty-icon { font-size: 52px; display: block; margin-bottom: 16px; }
    .empty-state h3 { font-size: 20px; color: #333; margin-bottom: 8px; }
    .empty-state p { font-size: 14px; color: #888; }
    .empty-state a { color: #d4a853; text-decoration: none; font-weight: 600; }
    .empty-state a:hover { text-decoration: underline; }
    .footer { background: #0a0c12; color: #666; text-align: center; padding: 24px; font-size: 13px; }
    @media (max-width: 768px) {
      .nav-inner { padding: 0 16px; height: 60px; }
      .bookings-wrap { padding: 100px 16px 48px; }
      .page-head h1 { font-size: 26px; }
      .b-card { padding: 20px 16px; }
      .b-dates { flex-wrap: wrap; gap: 12px 16px; }
      .b-date { flex: 1 1 40%; }
      .b-arrow { display: none; }
      .b-total { flex-basis: 100%; text-align: left; }
      .user-badge { display: none; }
    }
    @media (max-width: 420px) {
      .navbar { overflow-x: auto; }
      .b-head { align-items: flex-start; gap: 10px; }
      .b-status { padding: 3px 10px; font-size: 10px; }
      .b-avatar { width: 38px; height: 38px; }
      .b-room-num { font-size: 14px; }
      .bd-value { font-size: 13px; }
    }
  `]
})
export class CustomerBookingsComponent implements OnInit {
  bookings: CustomerBooking[] = [];
  loading = true;
  currentYear = new Date().getFullYear();

  private colorMap: Record<string, string> = {
    confirmed: '#2e7d32', checked_in: '#1565c0', checked_out: '#7b1fa2', cancelled: '#c62828', pending: '#e65100'
  };

  constructor(
    public api: CustomerBookingService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.api.getMyBookings().subscribe({
      next: (data) => { this.bookings = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  avatarColor(status: string): string { return this.colorMap[status] || '#888'; }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
