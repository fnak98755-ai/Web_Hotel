import { Component, OnInit } from '@angular/core';
import { PublicService, PublicRoom, HotelInfo } from '../../services/public.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-public-home',
  template: `
    <div class="page">
      <nav class="navbar">
        <div class="nav-inner">
          <a routerLink="/" class="brand">
            <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21V9l9-6 9 6v12"/><path d="M9 21V13h6v8"/></svg>
            <span class="brand-text">{{ hotel?.hotelName || 'SETEC' }}</span>
          </a>
          <div class="nav-links">
            <a *ngIf="!auth.isLoggedIn()" routerLink="/login" class="nav-btn">Sign In</a>
            <a *ngIf="!auth.isLoggedIn()" routerLink="/register" class="nav-btn primary">Register</a>
            <a *ngIf="auth.isLoggedIn()" routerLink="/my-bookings" class="nav-btn">My Bookings</a>
            <a *ngIf="auth.isLoggedIn()" (click)="logout()" class="nav-btn">Sign Out</a>
          </div>
        </div>
      </nav>

      <section class="hero">
        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop" alt="" class="hero-bg-img" />
        <div class="hero-bg-overlay"></div>
        <div class="hero-content">
          <span class="hero-badge">&#9733; Premium Hotel Experience</span>
          <h1>Discover Your<br><span class="highlight">Perfect Stay</span></h1>
          <p class="hero-sub">Luxurious rooms, world-class amenities, and exceptional service — all in one place.</p>
          <div class="hero-search">
            <div class="hs-field">
              <span class="hs-label">Check-In</span>
              <input type="date" [(ngModel)]="checkIn" (change)="onDateChange()" />
            </div>
            <div class="hs-divider"></div>
            <div class="hs-field">
              <span class="hs-label">Check-Out</span>
              <input type="date" [(ngModel)]="checkOut" (change)="onDateChange()" />
            </div>
            <button class="hs-btn" (click)="loadRooms()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Search
            </button>
          </div>
        </div>
      </section>

      <div class="stats-bar">
        <div class="stat"><span class="stat-num">{{ rooms.length }}+</span><span class="stat-lbl">Rooms</span></div>
        <div class="stat"><span class="stat-num">5</span><span class="stat-lbl">Stars</span></div>
        <div class="stat"><span class="stat-num">2K+</span><span class="stat-lbl">Happy Guests</span></div>
        <div class="stat"><span class="stat-num">24/7</span><span class="stat-lbl">Support</span></div>
      </div>

      <section class="rooms" id="rooms">
        <div class="section-header">
          <span class="section-badge">Our Collection</span>
          <h2>Rooms & Suites</h2>
          <p>Choose from our selection of premium accommodations tailored to your needs.</p>
        </div>

        <div class="grid" *ngIf="!loading">
          <div class="room-card" *ngFor="let room of rooms; let i = index" (click)="room.availability === 'available' && bookRoom(room._id)" [class.booked]="room.availability === 'booked'" [style.animation-delay]="i * 0.08 + 's'">
            <div class="card-img">
              <img [src]="roomImage(room)" alt="Room {{ room.roomNumber }}" class="room-img" loading="lazy" />
              <div class="card-badge">{{ '$' + room.pricePerNight }}<span>/night</span></div>
              <div class="card-rating">&#9733;&#9733;&#9733;&#9733;&#9733; <span>5.0</span></div>
              <div class="booked-badge" *ngIf="room.availability === 'booked'">Booked</div>
            </div>
            <div class="card-body">
              <div class="card-top">
                <h3>Room {{ room.roomNumber }}</h3>
                <span class="card-type">{{ room.type }}</span>
              </div>
              <div class="card-meta">
                <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> {{ room.capacity }} Guests</span>
                <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> {{ room.amenities?.length || 0 }} Amenities</span>
              </div>
              <p class="card-desc" *ngIf="room.description">{{ room.description }}</p>
              <div class="card-tags" *ngIf="room.amenities?.length">
                <span class="tag" *ngFor="let a of (room.amenities || []).slice(0,4)">{{ a }}</span>
                <span class="tag more" *ngIf="(room.amenities || []).length > 4">+{{ (room.amenities || []).length - 4 }}</span>
              </div>
            </div>
            <button class="card-cta" [class.disabled]="room.availability === 'booked'">{{ room.availability === 'booked' ? 'Not Available' : 'Book Now' }} <span *ngIf="room.availability === 'available'">&#8594;</span></button>
          </div>

          <div class="empty" *ngIf="rooms.length === 0">
            <span class="empty-icon">&#128716;</span>
            <h3>No rooms available</h3>
            <p>Try adjusting your dates to find available rooms.</p>
            <button class="empty-btn" (click)="clearDates()">Clear Dates</button>
          </div>
        </div>

        <div class="load-skeleton" *ngIf="loading">
          <div class="skeleton" *ngFor="let _ of [1,2,3]">
            <div class="sk-img"></div>
            <div class="sk-body">
              <div class="sk-line w40"></div>
              <div class="sk-line w60"></div>
              <div class="sk-line w80"></div>
            </div>
          </div>
        </div>
      </section>

      <section class="features">
        <div class="section-header">
          <span class="section-badge">Why Choose Us</span>
          <h2>Premium Services</h2>
        </div>
        <div class="feat-grid">
          <div class="feat-card">
            <div class="feat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
            <h4>Secure Booking</h4>
            <p>Your data and payments are protected with enterprise-grade encryption.</p>
          </div>
          <div class="feat-card">
            <div class="feat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
            <h4>24/7 Concierge</h4>
            <p>Our dedicated team is available around the clock to assist you.</p>
          </div>
          <div class="feat-card">
            <div class="feat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg></div>
            <h4>Best Rate Guarantee</h4>
            <p>We match any lower rate found on other booking platforms.</p>
          </div>
          <div class="feat-card">
            <div class="feat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
            <h4>Prime Location</h4>
            <p>Conveniently situated near major attractions and transport hubs.</p>
          </div>
        </div>
      </section>

      <footer class="footer">
        <div class="footer-inner">
          <div class="footer-cols">
            <div class="footer-col">
              <h5>{{ hotel?.hotelName || 'SETEC Hotel' }}</h5>
              <p>{{ hotel?.address || 'Premium accommodation for unforgettable experiences.' }}</p>
            </div>
            <div class="footer-col">
              <h5>Quick Links</h5>
              <a routerLink="/">Home</a>
              <a routerLink="/" fragment="rooms">Rooms</a>
              <a routerLink="/register">Register</a>
              <a routerLink="/login">Sign In</a>
            </div>
            <div class="footer-col">
              <h5>Contact</h5>
              <span>{{ hotel?.phone || '+1 (555) 123-4567' }}</span>
              <span>{{ hotel?.email || 'info@setechotel.com' }}</span>
            </div>
          </div>
          <div class="footer-bottom">&copy; {{ currentYear }} {{ hotel?.hotelName || 'SETEC Hotel' }}. All rights reserved.</div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: #f8f9fc; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
    a { text-decoration: none; }

    .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(10,12,18,0.92); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,0.05); }
    .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 28px; height: 72px; display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 10px; color: #fff; }
    .brand-icon { width: 26px; height: 26px; color: #d4a853; }
    .brand-text { font-size: 20px; font-weight: 800; letter-spacing: -0.3px; color: #fff; }
    .nav-links { display: flex; gap: 8px; align-items: center; }
    .nav-btn { padding: 8px 18px; border-radius: 5px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); transition: all 0.25s; cursor: pointer; border: none; background: transparent; letter-spacing: 0.2px; }
    .nav-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }
    .nav-btn.primary { background: #d4a853; color: #0a0c12; }
    .nav-btn.primary:hover { background: #c49a3f; }

    .hero { position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 160px 0 80px; }
    .hero-bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .hero-bg-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(10,12,18,0.7) 0%, rgba(10,12,18,0.85) 100%); }
    .hero-content { position: relative; z-index: 1; text-align: center; padding: 0 24px; max-width: 820px; animation: fadeUp 0.9s ease; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    .hero-badge { display: inline-block; padding: 6px 18px; background: rgba(212,168,83,0.12); border: 1px solid rgba(212,168,83,0.25); border-radius: 5px; font-size: 11px; font-weight: 600; color: #d4a853; margin-bottom: 16px; letter-spacing: 1px; text-transform: uppercase; }
    .hero-content h1 { font-size: clamp(32px, 5vw, 56px); font-weight: 800; color: #fff; line-height: 1.08; margin-bottom: 12px; letter-spacing: -1.5px; }
    .hero-content .highlight { background: linear-gradient(135deg, #d4a853 0%, #f0d080 50%, #d4a853 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .hero-sub { font-size: 16px; color: rgba(255,255,255,0.5); line-height: 1.5; max-width: 480px; margin: 0 auto 28px; font-weight: 400; }
    .hero-search { display: flex; align-items: center; gap: 0; max-width: 640px; margin: 0 auto; background: #fff; border-radius: 5px; padding: 4px; box-shadow: 0 8px 40px rgba(0,0,0,0.3); }
    .hs-field { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 6px 6px 6px 16px; }
    .hs-label { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.8px; }
    .hs-field input { background: transparent; border: none; color: #333; font-size: 14px; font-weight: 600; padding: 4px 0; outline: none; width: 100%; min-height: 28px; }
    .hs-field input::placeholder { color: #bbb; }
    .hs-field input::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.5; }
    .hs-divider { width: 1px; height: 36px; background: #eee; flex-shrink: 0; }
    .hs-btn { display: flex; align-items: center; gap: 8px; padding: 14px 30px; background: #d4a853; border: none; border-radius: 5px; color: #0a0c12; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.25s; white-space: nowrap; margin: 4px; }
    .hs-btn:hover { background: #c49a3f; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(212,168,83,0.3); }
    .hs-btn svg { width: 18px; height: 18px; }

    .stats-bar { max-width: 1000px; margin: -40px auto 0; display: flex; gap: 0; padding: 0 24px; position: relative; z-index: 2; }
    .stat { flex: 1; background: #fff; padding: 24px 16px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .stat:first-child { border-radius: 5px 0 0 5px; }
    .stat:last-child { border-radius: 0 5px 5px 0; }
    .stat-num { display: block; font-size: 28px; font-weight: 800; color: #0a0c12; line-height: 1; margin-bottom: 4px; }
    .stat-lbl { font-size: 12px; color: #888; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }

    .rooms { max-width: 1200px; margin: 72px auto 80px; padding: 0 24px; }
    .section-header { text-align: center; margin-bottom: 48px; }
    .section-badge { display: inline-block; padding: 6px 18px; background: rgba(212,168,83,0.1); border-radius: 5px; font-size: 11px; font-weight: 700; color: #d4a853; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .section-header h2 { font-size: 34px; font-weight: 800; color: #0a0c12; margin-bottom: 10px; letter-spacing: -0.5px; }
    .section-header p { font-size: 15px; color: #888; max-width: 480px; margin: 0 auto; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 28px; }

    .room-card { background: #fff; border-radius: 5px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.04); cursor: pointer; transition: all 0.4s cubic-bezier(0.4,0,0.2,1); display: flex; flex-direction: column; animation: fadeUp 0.5s ease both; opacity: 0; }
    .room-card:hover { transform: translateY(-10px); box-shadow: 0 24px 48px rgba(0,0,0,0.1); }
    .card-img { position: relative; height: 220px; overflow: hidden; }
    .img-bg { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; transition: transform 0.5s; }
    .room-card:hover .img-bg { transform: scale(1.08); }
    .img-shine { position: absolute; inset: 0; background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%); opacity: 0; transition: opacity 0.5s; }
    .room-card:hover .img-shine { opacity: 1; }
    .room-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .room-card:hover .room-img { transform: scale(1.08); }
    .card-badge { position: absolute; top: 16px; left: 16px; background: rgba(0,0,0,0.7); backdrop-filter: blur(12px); padding: 8px 16px; border-radius: 5px; font-size: 20px; font-weight: 800; color: #fff; }
    .card-badge span { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.5); margin-left: 3px; }
    .card-rating { position: absolute; top: 16px; right: 16px; background: rgba(0,0,0,0.6); backdrop-filter: blur(12px); padding: 6px 14px; border-radius: 5px; font-size: 13px; color: #f5c842; letter-spacing: 2px; }
    .card-rating span { color: #fff; font-size: 11px; font-weight: 600; letter-spacing: 0; margin-left: 4px; }
    .card-body { padding: 22px 24px 16px; flex: 1; }
    .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .card-top h3 { font-size: 18px; font-weight: 700; color: #0a0c12; }
    .card-type { font-size: 11px; font-weight: 700; color: #d4a853; background: rgba(212,168,83,0.1); padding: 4px 12px; border-radius: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
    .card-meta { display: flex; gap: 20px; margin-bottom: 12px; }
    .card-meta span { font-size: 13px; color: #888; display: flex; align-items: center; gap: 6px; }
    .card-meta svg { width: 15px; height: 15px; stroke: #aaa; }
    .card-desc { font-size: 14px; color: #666; line-height: 1.55; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag { background: #f2f2f2; padding: 4px 12px; border-radius: 5px; font-size: 11px; font-weight: 500; color: #666; }
    .tag.more { background: transparent; color: #999; font-size: 12px; }
    .card-cta { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 16px; background: #0a0c12; color: #fff; border: none; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.25s; margin-top: auto; letter-spacing: 0.3px; }
    .card-cta span { transition: transform 0.25s; }
    .card-cta:hover { background: #d4a853; color: #0a0c12; }
    .card-cta:hover span { transform: translateX(4px); }
    .card-cta.disabled { background: #aaa !important; color: #fff !important; cursor: not-allowed; }
    .card-cta.disabled:hover { background: #aaa !important; color: #fff !important; }
    .card-cta.disabled:hover span { transform: none; }
    .booked-badge { position: absolute; top: 16px; right: 16px; background: #e53935; color: #fff; padding: 4px 12px; border-radius: 5px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; z-index: 2; }
    .room-card.booked { cursor: default; opacity: 0.7; }
    .room-card.booked:hover { transform: none; box-shadow: none; }
    .room-card.booked .card-img::after { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.15); z-index: 1; }
    .empty { grid-column: 1 / -1; text-align: center; padding: 80px 20px; }
    .empty-icon { font-size: 56px; display: block; margin-bottom: 16px; }
    .empty h3 { font-size: 20px; color: #333; margin-bottom: 8px; }
    .empty p { font-size: 14px; color: #888; margin-bottom: 20px; }
    .empty-btn { padding: 10px 24px; background: #d4a853; border: none; border-radius: 5px; color: #fff; font-weight: 600; cursor: pointer; }

    .load-skeleton { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
    .skeleton { background: #fff; border-radius: 5px; overflow: hidden; }
    .sk-img { height: 220px; background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .sk-body { padding: 22px 24px; }
    .sk-line { height: 14px; background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 5px; margin-bottom: 12px; }
    .sk-line.w40 { width: 40%; }
    .sk-line.w60 { width: 60%; }
    .sk-line.w80 { width: 80%; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .features { max-width: 1200px; margin: 0 auto 80px; padding: 0 24px; }
    .feat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .feat-card { background: #fff; border-radius: 5px; padding: 32px 24px; text-align: center; transition: all 0.3s; }
    .feat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
    .feat-icon { width: 52px; height: 52px; border-radius: 5px; background: rgba(212,168,83,0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .feat-icon svg { width: 26px; height: 26px; color: #d4a853; }
    .feat-card h4 { font-size: 16px; font-weight: 700; color: #0a0c12; margin-bottom: 8px; }
    .feat-card p { font-size: 13px; color: #888; line-height: 1.5; }

    .footer { background: #0a0c12; color: #666; padding: 56px 24px 24px; }
    .footer-inner { max-width: 1200px; margin: 0 auto; }
    .footer-cols { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }
    .footer-col h5 { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 16px; }
    .footer-col p, .footer-col span { font-size: 13px; color: #666; display: block; margin-bottom: 6px; line-height: 1.6; }
    .footer-col a { display: block; color: #666; font-size: 13px; margin-bottom: 8px; transition: color 0.2s; }
    .footer-col a:hover { color: #d4a853; }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.04); padding-top: 20px; text-align: center; font-size: 13px; color: #555; }
    @media (max-width: 900px) {
      .feat-grid { grid-template-columns: repeat(2,1fr); }
      .footer-cols { grid-template-columns: 1fr; gap: 32px; }
      .load-skeleton { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .nav-inner { padding: 0 16px; height: 60px; }
      .brand-text { font-size: 16px; }
      .nav-btn { padding: 6px 12px; font-size: 11px; }
      .hero { padding: 120px 0 60px; }
      .hero-sub { font-size: 14px; margin-bottom: 20px; }
      .hero-search { flex-direction: column; padding: 12px; border-radius: 5px; }
      .hs-divider { display: none; }
      .hs-field { padding: 6px 10px; width: 100%; }
      .hs-btn { width: 100%; justify-content: center; margin: 4px 0 0; }
      .stats-bar { flex-wrap: wrap; margin-top: -20px; gap: 2px; }
      .stat { min-width: 48%; border-radius: 5px; }
      .grid { grid-template-columns: 1fr; }
      .rooms { margin: 48px auto 60px; padding: 0 16px; }
      .section-header h2 { font-size: 26px; }
    }
    @media (max-width: 420px) {
      .navbar { overflow-x: auto; }
      .hero-content { padding: 0 16px; }
      .hero-content h1 { font-size: 30px; }
      .stat { padding: 18px 10px; }
      .stat-num { font-size: 22px; }
      .card-body { padding: 18px 16px 14px; }
    }
  `]
})
export class PublicHomeComponent implements OnInit {
  rooms: PublicRoom[] = [];
  hotel: HotelInfo | null = null;
  checkIn = '';
  checkOut = '';
  loading = true;
  currentYear = new Date().getFullYear();

  roomColors: Record<string, string> = {
    'standard': 'linear-gradient(135deg, #2c3e50, #3498db)',
    'deluxe': 'linear-gradient(135deg, #4a1a2e, #c0392b)',
    'suite': 'linear-gradient(135deg, #0e3a53, #1abc9c)',
    'presidential': 'linear-gradient(135deg, #3d1f00, #d4a853)',
  };

  roomImage(room: PublicRoom): string {
    if (room.images && room.images.length > 0) return room.images[0];
    const imgs: Record<string, string> = {
      single: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=500&h=320&fit=crop',
      double: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&h=320&fit=crop',
      suite: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&h=320&fit=crop',
      deluxe: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=500&h=320&fit=crop',
    };
    return imgs[room.type?.toLowerCase()] || imgs['double'];
  }

  constructor(
    public api: PublicService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.api.getHotel().subscribe(h => this.hotel = h);
    this.loadRooms();
  }

  loadRooms() {
    this.loading = true;
    this.api.getRooms(this.checkIn || undefined, this.checkOut || undefined).subscribe({
      next: (rooms) => { this.rooms = rooms; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onDateChange() {
    if (this.checkIn && this.checkOut) this.loadRooms();
  }

  clearDates() {
    this.checkIn = '';
    this.checkOut = '';
    this.loadRooms();
  }

  bookRoom(id: string) {
    this.router.navigate(['/room', id], { queryParams: { checkIn: this.checkIn, checkOut: this.checkOut } });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
