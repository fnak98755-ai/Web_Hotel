import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicService, PublicRoom } from '../../services/public.service';
import { AuthService } from '../../services/auth.service';
import { CustomerBookingService } from '../../services/customer-booking.service';

@Component({
  selector: 'app-room-detail',
  template: `
    <div class="page">
      <nav class="navbar">
        <div class="nav-inner">
          <a routerLink="/" class="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back
          </a>
          <div class="nav-links">
            <a *ngIf="!auth.isLoggedIn()" routerLink="/login" class="nav-btn">Sign In</a>
            <a *ngIf="!auth.isLoggedIn()" routerLink="/register" class="nav-btn primary">Register</a>
            <a *ngIf="auth.isLoggedIn()" routerLink="/my-bookings" class="nav-btn">My Bookings</a>
          </div>
        </div>
      </nav>

      <div class="detail-wrap" *ngIf="room">
        <div class="detail-hero">
          <img [src]="roomImage(room)" alt="Room {{ room.roomNumber }}" class="dh-img" />
          <div class="dh-overlay"></div>
          <div class="dh-info">
            <div class="dh-breadcrumb"><a routerLink="/">Rooms</a> / {{ room.type }}</div>
            <h1>Room {{ room.roomNumber }}</h1>
            <div class="dh-meta">
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> Up to {{ room.capacity }} guests</span>
              <span class="dh-div">|</span>
              <span class="dh-price">{{ '$' + room.pricePerNight }}<small>/ night</small></span>
              <span class="dh-div">|</span>
              <span class="dh-status" [class.available]="room.availability === 'available'" [class.booked]="room.availability === 'booked'" [class.checked-in]="room.availability === 'checked_in'" [class.checked-out]="room.availability === 'checked_out'" [class.unavailable]="room.availability === 'unavailable'">{{ statusLabel() }}</span>
            </div>
          </div>
        </div>

        <div class="detail-body">
          <div class="detail-main">
            <div class="d-photo">
              <img [src]="roomImage(room)" alt="Room {{ room.roomNumber }}" />
            </div>
            <div class="d-section" *ngIf="room.description">
              <h3>About This Room</h3>
              <p>{{ room.description }}</p>
            </div>
            <div class="d-section" *ngIf="room.amenities?.length">
              <h3>Amenities</h3>
              <div class="amenities-grid">
                <div class="a-item" *ngFor="let a of room.amenities">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ a }}
                </div>
              </div>
            </div>
          </div>

          <div class="detail-side">
            <div class="side-card" *ngIf="auth.isLoggedIn(); else loginCard">
              <h3>Reserve Your Stay</h3>
              <p class="booked-msg" *ngIf="isBlocked()">Room is already booked for the selected dates. Please choose different dates.</p>
              <div class="sc-field">
                <label>Check-In</label>
                <input type="date" [(ngModel)]="checkIn" [min]="today" (change)="onDateChange()" />
              </div>
              <div class="sc-field">
                <label>Check-Out</label>
                <input type="date" [(ngModel)]="checkOut" [min]="checkIn || today" (change)="onDateChange()" />
              </div>
              <div class="sc-field" *ngIf="checkIn && checkOut">
                <label>Special Requests</label>
                <textarea [(ngModel)]="specialRequests" rows="3" placeholder="Optional requests..."></textarea>
              </div>
              <div class="nights" *ngIf="checkIn && checkOut">
                <span>Nights</span>
                <strong>{{ calculateNights() }}</strong>
              </div>
              <div class="sc-total" *ngIf="checkIn && checkOut">
                <span>Total</span>
                <strong>{{ '$' + calculateTotal() }}</strong>
              </div>
              <p class="sc-error" *ngIf="error">{{ error }}</p>
              <button class="sc-btn" (click)="book()" [disabled]="submitting || isBlocked()">
                {{ submitting ? 'Processing...' : 'Confirm Booking' }}
              </button>
            </div>
            <ng-template #loginCard>
              <div class="login-card">
                <span class="lc-icon">&#128274;</span>
                <h3>Sign in to Book</h3>
                <p>Create an account or sign in to reserve this room.</p>
                <a routerLink="/login" class="lc-btn">Sign In</a>
                <a routerLink="/register" class="lc-btn primary">Create Account</a>
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <footer class="footer">
        <p>&copy; {{ currentYear }} SETEC Hotel. All rights reserved.</p>
      </footer>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: #f8f9fc; font-family: 'Inter','Segoe UI',system-ui,sans-serif; }
    .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(10,12,18,0.92); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,0.05); }
    .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 28px; height: 72px; display: flex; align-items: center; justify-content: space-between; }
    .back-btn { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 600; transition: color 0.2s; }
    .back-btn:hover { color: #d4a853; }
    .back-btn svg { width: 20px; height: 20px; }
    .nav-links { display: flex; gap: 8px; }
    .nav-btn { padding: 8px 18px; border-radius: 5px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); transition: all 0.25s; cursor: pointer; background: transparent; border: none; }
    .nav-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }
    .nav-btn.primary { background: #d4a853; color: #0a0c12; }
    .nav-btn.primary:hover { background: #c49a3f; }

    .detail-hero { position: relative; height: 340px; margin-top: 72px; overflow: hidden; display: flex; align-items: flex-end; }
    .dh-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .dh-overlay { position: absolute; inset: 0; background: linear-gradient(to top, #0a0c12 0%, rgba(10,12,18,0.3) 60%); }
    .dh-overlay { position: absolute; inset: 0; background: linear-gradient(to top, #0a0c12 0%, transparent 60%); }
    .dh-info { position: relative; z-index: 1; padding: 48px 40px; max-width: 1200px; width: 100%; margin: 0 auto; animation: fadeUp 0.6s ease; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    .dh-breadcrumb { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 8px; }
    .dh-breadcrumb a { color: rgba(255,255,255,0.5); text-decoration: none; }
    .dh-breadcrumb a:hover { color: #d4a853; }
    .dh-info h1 { font-size: 40px; font-weight: 800; color: #fff; margin-bottom: 8px; letter-spacing: -0.5px; }
    .dh-meta { display: flex; align-items: center; gap: 12px; }
    .dh-meta span { font-size: 15px; color: rgba(255,255,255,0.6); display: flex; align-items: center; gap: 6px; }
    .dh-meta svg { width: 18px; height: 18px; }
    .dh-div { color: rgba(255,255,255,0.2); }
    .dh-price { font-size: 22px; font-weight: 700; color: #d4a853; }
    .dh-price small { font-size: 13px; font-weight: 400; color: rgba(255,255,255,0.4); }
    .dh-status { font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
    .dh-status.available { background: rgba(46,125,50,0.15); color: #2e7d32; }
    .dh-status.booked { background: rgba(229,57,53,0.15); color: #e53935; }
    .dh-status.checked-in { background: rgba(251,140,0,0.15); color: #ef6c00; }
    .dh-status.checked-out { background: rgba(90,90,90,0.15); color: #616161; }
    .dh-status.unavailable { background: rgba(120,120,120,0.15); color: #757575; }

    .detail-body { max-width: 1200px; margin: 0 auto; padding: 40px 24px 60px; display: grid; grid-template-columns: 1fr 380px; gap: 40px; align-items: start; }
    .d-section { margin-bottom: 36px; }
    .d-section h3 { font-size: 18px; font-weight: 700; color: #0a0c12; margin-bottom: 12px; }
    .d-section p { font-size: 15px; color: #555; line-height: 1.7; }
    .amenities-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
    .a-item { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #fff; border-radius: 5px; font-size: 14px; color: #444; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .a-item svg { width: 16px; height: 16px; color: #2e7d32; flex-shrink: 0; }

    .detail-side { position: sticky; top: 88px; }
    .side-card { background: #fff; border-radius: 5px; padding: 28px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; }
    .side-card h3 { font-size: 18px; font-weight: 700; color: #0a0c12; margin-bottom: 20px; }
    .d-photo { border-radius: 5px; overflow: hidden; margin-bottom: 36px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .d-photo img { width: 100%; height: 320px; object-fit: cover; display: block; }
    .sc-field { margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
    .sc-field label { font-size: 12px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.3px; }
    .sc-field input, .sc-field textarea { padding: 11px 14px; border: 1px solid #e5e5e5; border-radius: 5px; font-size: 14px; outline: none; transition: all 0.2s; background: #fafafa; }
    .sc-field input:focus, .sc-field textarea:focus { border-color: #d4a853; background: #fff; box-shadow: 0 0 0 3px rgba(212,168,83,0.08); }
    .nights { display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid #f0f0f0; font-size: 14px; color: #555; }
    .sc-total { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-top: 1px solid #eee; margin-bottom: 16px; }
    .sc-total span { font-size: 15px; color: #555; }
    .sc-total strong { font-size: 24px; color: #d4a853; }
    .sc-error { color: #e53935; font-size: 13px; background: rgba(229,57,53,0.06); padding: 8px 12px; border-radius: 5px; margin-bottom: 12px; }
    .booked-msg { color: #e53935; font-size: 13px; background: rgba(229,57,53,0.06); padding: 8px 12px; border-radius: 5px; margin-bottom: 12px; }
    .sc-btn { width: 100%; padding: 15px; background: #d4a853; color: #0a0c12; border: none; border-radius: 5px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.25s; }
    .sc-btn:hover:not(:disabled) { background: #c49a3f; transform: translateY(-1px); }
    .sc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .login-card { background: #fff; border-radius: 5px; padding: 36px 28px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; }
    .lc-icon { font-size: 44px; display: block; margin-bottom: 12px; }
    .login-card h3 { font-size: 18px; font-weight: 700; color: #0a0c12; margin-bottom: 8px; }
    .login-card p { font-size: 14px; color: #888; margin-bottom: 24px; line-height: 1.5; }
    .lc-btn { display: block; padding: 12px; border-radius: 5px; font-size: 14px; font-weight: 600; text-align: center; text-decoration: none; margin-bottom: 10px; border: 1px solid #e0e0e0; color: #555; transition: all 0.2s; }
    .lc-btn:hover { background: #f5f5f5; }
    .lc-btn.primary { background: #d4a853; color: #0a0c12; border-color: #d4a853; }
    .lc-btn.primary:hover { background: #c49a3f; }

    .footer { background: #0a0c12; color: #666; text-align: center; padding: 24px; font-size: 13px; }
    @media (max-width: 768px) {
      .detail-body { grid-template-columns: 1fr; }
      .d-photo img { height: 220px; }
      .dh-info { padding: 24px 20px; }
      .dh-info h1 { font-size: 28px; }
      .dh-meta { flex-wrap: wrap; }
      .amenities-grid { grid-template-columns: 1fr; }
      .nav-btn { padding: 6px 12px; font-size: 11px; }
    }
  `]
})
export class RoomDetailComponent implements OnInit {
  room: PublicRoom | null = null;
  checkIn = '';
  checkOut = '';
  specialRequests = '';
  error = '';
  submitting = false;
  currentYear = new Date().getFullYear();
  today = new Date().toISOString().split('T')[0];

  private roomId = '';

  roomImage(room: PublicRoom): string {
    if (room.images && room.images.length > 0) return room.images[0];
    const imgs: Record<string, string> = {
      single: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=1200&h=400&fit=crop',
      double: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&h=400&fit=crop',
      suite: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=400&fit=crop',
      deluxe: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&h=400&fit=crop',
    };
    return imgs[room.type?.toLowerCase()] || imgs['double'];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public api: PublicService,
    public auth: AuthService,
    private bookingService: CustomerBookingService
  ) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id')!;
    const qp = this.route.snapshot.queryParams;
    const checkIn = qp['checkIn'] || '';
    const checkOut = qp['checkOut'] || '';
    this.checkIn = checkIn;
    this.checkOut = checkOut;
    this.loadAvailability();
  }

  onDateChange() {
    this.error = '';
    this.loadAvailability();
  }

  private loadAvailability() {
    this.api.getRoomById(this.roomId, this.checkIn || undefined, this.checkOut || undefined).subscribe(r => {
      this.room = r;
    });
  }

  calculateNights(): number {
    if (!this.checkIn || !this.checkOut) return 0;
    return Math.ceil((new Date(this.checkOut).getTime() - new Date(this.checkIn).getTime()) / (1000 * 60 * 60 * 24));
  }

  statusLabel(): string {
    const a = this.room?.availability;
    if (a === 'available') return 'Available';
    if (a === 'checked_in') return 'Checked In';
    if (a === 'checked_out') return 'Checked Out';
    if (a === 'unavailable') return 'Unavailable';
    return 'Booked';
  }

  isBlocked(): boolean {
    const a = this.room?.availability;
    return a === 'booked' || a === 'checked_in' || a === 'unavailable';
  }

  calculateTotal(): number {
    return this.calculateNights() * (this.room?.pricePerNight || 0);
  }

  book() {
    if (!this.checkIn || !this.checkOut) { this.error = 'Please select check-in and check-out dates.'; return; }
    if (new Date(this.checkIn) >= new Date(this.checkOut)) { this.error = 'Check-out must be after check-in.'; return; }
    this.submitting = true; this.error = '';
    this.bookingService.createOnline({
      room: this.room!._id, checkIn: this.checkIn, checkOut: this.checkOut,
      specialRequests: this.specialRequests || undefined,
    }).subscribe({
      next: () => this.router.navigate(['/my-bookings']),
      error: (err) => { this.error = err.error?.error || 'Booking failed.'; this.submitting = false; }
    });
  }
}
