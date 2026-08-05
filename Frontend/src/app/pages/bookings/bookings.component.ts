import { Component, OnInit } from '@angular/core';
import { BookingService, Booking, Customer, Room, BookedService } from '../../services/booking.service';
import { ServiceService, Service } from '../../services/service.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-bookings',
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Bookings</h1>
        <button class="btn btn-primary" *ngIf="canCreate" (click)="showForm = true">+ Create Booking</button>
      </div>

      <div class="stats" *ngIf="bookings.length">
        <div class="stat-card">
          <span class="stat-value">{{ bookings.length }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.confirmed }}</span>
          <span class="stat-label">Confirmed</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.checkedIn }}</span>
          <span class="stat-label">Checked In</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.cancelled }}</span>
          <span class="stat-label">Cancelled</span>
        </div>
      </div>

      <div class="card" *ngIf="showForm">
        <div class="card-header">
          <h2>New Booking</h2>
          <button class="btn-close" (click)="closeForm()">&times;</button>
        </div>
        <form (ngSubmit)="onCreate()" class="booking-form">
          <div class="form-row">
            <div class="form-group">
              <label>Customer <span class="req">*</span></label>
              <select [(ngModel)]="form.customer" name="customer" required>
                <option value="">Select customer...</option>
                <option *ngFor="let c of customers" [value]="c._id">{{ c.name }} ({{ c.email }})</option>
              </select>
            </div>
            <div class="form-group">
              <label>Room <span class="req">*</span></label>
              <select [(ngModel)]="form.room" name="room" required (change)="onRoomChange()">
                <option value="">Select room...</option>
                <option *ngFor="let r of availableRooms" [value]="r._id">#{{ r.roomNumber }} - {{ r.type }} ({{ r.pricePerNight | currency }}/night)</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Check-In <span class="req">*</span></label>
              <input type="date" [(ngModel)]="form.checkIn" name="checkIn" [min]="today" required (change)="calcTotal()" />
            </div>
            <div class="form-group">
              <label>Check-Out <span class="req">*</span></label>
              <input type="date" [(ngModel)]="form.checkOut" name="checkOut" [min]="form.checkIn || today" required (change)="calcTotal()" />
            </div>
          </div>
          <div class="form-row" *ngIf="nights">
            <div class="form-group">
              <label>Total Amount</label>
              <div class="total-display">{{ totalAmount | currency }}</div>
            </div>
          </div>
          <div class="form-group">
            <label>Special Requests</label>
            <textarea [(ngModel)]="form.specialRequests" name="specialRequests" rows="3" placeholder="Any special requests..."></textarea>
          </div>
          <p class="error-msg" *ngIf="formError">{{ formError }}</p>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="closeForm()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              {{ saving ? 'Creating...' : 'Create Booking' }}
            </button>
          </div>
        </form>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Booking History</h2>
          <div class="filter-bar">
            <select [(ngModel)]="statusFilter" (change)="applyFilter()">
              <option value="">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input type="text" [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Search customer or room..." />
          </div>
        </div>
        <div class="table-wrap">
          <table *ngIf="filtered.length; else empty">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Room</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Nights</th>
                <th>Services</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of filtered">
                <td>{{ b.customer?.name || '---' }}</td>
                <td>#{{ b.room?.roomNumber || '---' }} ({{ b.room?.type || '---' }})</td>
                <td>{{ b.checkIn | date:'mediumDate' }}</td>
                <td>{{ b.checkOut | date:'mediumDate' }}</td>
                <td>{{ calcNights(b.checkIn, b.checkOut) }}</td>
                <td>
                  <span *ngIf="b.services?.length" class="service-count" (click)="openServices(b)">{{ b.services.length }} item(s)</span>
                  <span *ngIf="!b.services?.length" class="muted">---</span>
                  <button class="icon-btn" title="Add service" *ngIf="canUpdate" (click)="openServices(b)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </button>
                </td>
                <td>{{ b.totalAmount | currency }}</td>
                <td><span class="badge" [ngClass]="b.status">{{ b.status }}</span></td>
                <td>
                  <button class="icon-btn" *ngIf="canCancel(b) && canUpdate" title="Cancel booking" (click)="onCancel(b)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                  </button>
                  <span class="muted" *ngIf="!canCancel(b) || !canUpdate">---</span>
                </td>
              </tr>
            </tbody>
          </table>
          <ng-template #empty>
            <div class="empty-state">
              <p>{{ bookings.length ? 'No bookings match your filter.' : 'No bookings yet. Create your first booking!' }}</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="selectedBooking" (click)="closeServices()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Services — #{{ selectedBooking.room?.roomNumber }} ({{ selectedBooking.customer?.name }})</h2>
          <button class="btn-close" (click)="closeServices()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="add-service-row">
            <select [(ngModel)]="newServiceId">
              <option value="">Select service...</option>
              <option *ngFor="let s of allServices" [value]="s._id">{{ s.name }} ({{ s.price | currency }})</option>
            </select>
            <input type="number" [(ngModel)]="newServiceQty" min="1" value="1" class="qty-input" />
            <button class="btn btn-primary btn-sm" *ngIf="canUpdate" (click)="onAddService()" [disabled]="!newServiceId || !newServiceQty">Add</button>
          </div>
          <table class="service-table" *ngIf="selectedBooking.services?.length">
            <thead>
              <tr>
                <th>Service</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of selectedBooking.services">
                <td>{{ item.name }}</td>
                <td>{{ item.price | currency }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.price * item.quantity | currency }}</td>
                <td><button class="icon-btn" title="Remove" *ngIf="canUpdate" (click)="onRemoveService(item._id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button></td>
              </tr>
            </tbody>
          </table>
          <p class="muted" *ngIf="!selectedBooking.services?.length">No services added yet.</p>
          <div class="service-total">
            <strong>Total: {{ selectedBooking.totalAmount | currency }}</strong>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeServices()">Close</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];
  filtered: Booking[] = [];
  customers: Customer[] = [];
  availableRooms: Room[] = [];
  allServices: Service[] = [];

  stats = { confirmed: 0, checkedIn: 0, checkedOut: 0, cancelled: 0 };

  showForm = false;
  saving = false;
  formError = '';

  statusFilter = '';
  searchTerm = '';

  today = new Date().toISOString().split('T')[0];

  form: any = { customer: '', room: '', checkIn: '', checkOut: '', specialRequests: '' };
  selectedRoomPrice = 0;
  nights = 0;
  totalAmount = 0;

  selectedBooking: Booking | null = null;
  newServiceId = '';
  newServiceQty = 1;

  constructor(
    private service: BookingService,
    private serviceService: ServiceService,
    private confirm: ConfirmDialogService,
    private auth: AuthService
  ) {}

  get canCreate() { return this.auth.canAction('bookings', 'create'); }
  get canUpdate() { return this.auth.canAction('bookings', 'update'); }

  ngOnInit() {
    this.load();
    this.serviceService.getAll().subscribe(s => this.allServices = s);
  }

  load() {
    this.service.getAll().subscribe(b => {
      this.bookings = b;
      this.updateStats();
      this.applyFilter();
    });
    this.service.getCustomers().subscribe(c => this.customers = c);
    this.service.getRooms().subscribe(r => this.availableRooms = r.filter(rm => rm.isAvailable));
  }

  updateStats() {
    this.stats = {
      confirmed: this.bookings.filter(b => b.status === 'confirmed').length,
      checkedIn: this.bookings.filter(b => b.status === 'checked_in').length,
      checkedOut: this.bookings.filter(b => b.status === 'checked_out').length,
      cancelled: this.bookings.filter(b => b.status === 'cancelled').length,
    };
  }

  applyFilter() {
    let list = [...this.bookings];
    if (this.statusFilter) list = list.filter(b => b.status === this.statusFilter);
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(b =>
        b.customer?.name?.toLowerCase().includes(q) ||
        b.room?.roomNumber?.toLowerCase().includes(q)
      );
    }
    this.filtered = list;
  }

  canCancel(b: Booking) {
    return b.status === 'confirmed' || b.status === 'pending';
  }

  onRoomChange() {
    const room = this.availableRooms.find(r => r._id === this.form.room);
    this.selectedRoomPrice = room ? room.pricePerNight : 0;
    this.calcTotal();
  }

  calcTotal() {
    if (this.form.checkIn && this.form.checkOut && this.selectedRoomPrice) {
      const ci = new Date(this.form.checkIn);
      const co = new Date(this.form.checkOut);
      const diff = Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
      this.nights = diff > 0 ? diff : 0;
      this.totalAmount = this.nights * this.selectedRoomPrice;
    } else {
      this.nights = 0;
      this.totalAmount = 0;
    }
  }

  onCreate() {
    this.formError = '';
    if (!this.form.customer || !this.form.room || !this.form.checkIn || !this.form.checkOut) {
      this.formError = 'Please fill in all required fields.';
      return;
    }
    if (this.form.checkIn < this.today) { this.formError = 'Check-in cannot be in the past.'; return; }
    if (this.form.checkOut <= this.form.checkIn) { this.formError = 'Check-out must be after check-in.'; return; }

    this.saving = true;
    this.service.create(this.form).subscribe({
      next: () => { this.closeForm(); this.load(); this.saving = false; },
      error: (err) => { this.formError = err.error?.error || 'Failed to create booking.'; this.saving = false; }
    });
  }

  onCancel(booking: Booking) {
    this.confirm.confirm('Cancel Booking', `Cancel booking for ${booking.customer?.name}?`).subscribe(r => {
      if (!r) return;
      this.service.cancel(booking._id).subscribe({
        next: () => this.load(),
        error: (err) => this.confirm.alert('Error', err.error?.error || 'Failed to cancel booking.').subscribe()
      });
    });
  }

  closeForm() {
    this.showForm = false;
    this.form = { customer: '', room: '', checkIn: '', checkOut: '', specialRequests: '' };
    this.selectedRoomPrice = 0;
    this.nights = 0;
    this.totalAmount = 0;
    this.formError = '';
  }

  calcNights(ci: string, co: string) {
    const a = new Date(ci), b = new Date(co);
    const diff = Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  openServices(b: Booking) {
    this.selectedBooking = b;
    this.newServiceId = '';
    this.newServiceQty = 1;
  }

  closeServices() {
    this.selectedBooking = null;
  }

  onAddService() {
    if (!this.selectedBooking || !this.newServiceId) return;
    this.service.addService(this.selectedBooking._id, this.newServiceId, this.newServiceQty).subscribe({
      next: (updated) => {
        const idx = this.bookings.findIndex(b => b._id === updated._id);
        if (idx !== -1) this.bookings[idx] = updated;
        this.selectedBooking = updated;
        this.newServiceId = '';
        this.newServiceQty = 1;
        this.applyFilter();
      },
      error: (err) => this.confirm.alert('Error', err.error?.error || 'Failed to add service.').subscribe()
    });
  }

  onRemoveService(serviceItemId: string) {
    if (!this.selectedBooking) return;
    this.confirm.confirm('Remove Service', 'Remove this service?').subscribe(r => {
      if (!r) return;
      this.service.removeService(this.selectedBooking!._id, serviceItemId).subscribe({
        next: (updated) => {
          const idx = this.bookings.findIndex(b => b._id === updated._id);
          if (idx !== -1) this.bookings[idx] = updated;
          this.selectedBooking = updated;
          this.applyFilter();
        },
        error: (err) => this.confirm.alert('Error', err.error?.error || 'Failed to remove service.').subscribe()
      });
    });
  }
}
