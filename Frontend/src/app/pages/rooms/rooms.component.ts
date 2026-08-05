import { Component, OnInit } from '@angular/core';
import { RoomService, Room } from '../../services/room.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  filtered: Room[] = [];

  showForm = false;
  editing: Room | null = null;
  saving = false;
  formError = '';

  typeFilter = '';
  statusFilter = '';
  searchTerm = '';
  checkIn = '';
  checkOut = '';

  roomTypes = ['single', 'double', 'suite', 'deluxe'];

  form: any = {
    roomNumber: '', type: '', pricePerNight: null, capacity: null,
    description: '', amenities: '', isAvailable: true
  };

  constructor(private service: RoomService, private confirm: ConfirmDialogService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getAll(this.checkIn || undefined, this.checkOut || undefined).subscribe(r => {
      this.rooms = r;
      this.applyFilter();
    });
  }

  fmtDate(d: string): string {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-GB');
  }

  bookedDatesLabel(r: Room): string {
    const dates = r.bookedDates || [];
    if (!dates.length) return '';
    const list = dates.map(b => `${this.fmtDate(b.checkIn)} \u2013 ${this.fmtDate(b.checkOut)}`);
    return 'Booked: ' + list.join(', ');
  }

  get stats() {
    const booked = this.rooms.filter(r =>
      !r.isAvailable || r.currentStatus === 'booked'
    ).length;
    return {
      total: this.rooms.length,
      available: this.rooms.filter(r => r.isAvailable && r.currentStatus !== 'booked').length,
      booked,
      maintenance: this.rooms.filter(r => !r.isAvailable && r.currentStatus !== 'booked').length,
    };
  }

  applyFilter() {
    let list = [...this.rooms];
    if (this.typeFilter) list = list.filter(r => r.type === this.typeFilter);
    if (this.statusFilter === 'available') list = list.filter(r => r.currentStatus === 'available' || (r.isAvailable && !r.currentStatus));
    if (this.statusFilter === 'booked') list = list.filter(r => r.currentStatus === 'booked');
    if (this.statusFilter === 'maintenance') list = list.filter(r => r.currentStatus === 'maintenance');
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(r =>
        r.roomNumber.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      );
    }
    this.filtered = list;
  }

  roomTypeLabel(type: string) {
    const map: any = { single: 'Single', double: 'Double', suite: 'Suite', deluxe: 'Deluxe' };
    return map[type] || type;
  }

  openAdd() {
    this.editing = null;
    this.form = { roomNumber: '', type: '', pricePerNight: null, capacity: null, description: '', amenities: '', isAvailable: true };
    this.showForm = true;
    this.formError = '';
  }

  openEdit(room: Room) {
    this.editing = room;
    this.form = {
      roomNumber: room.roomNumber, type: room.type, pricePerNight: room.pricePerNight,
      capacity: room.capacity, description: room.description || '',
      amenities: (room.amenities || []).join(', '), isAvailable: room.isAvailable
    };
    this.showForm = true;
    this.formError = '';
  }

  closeForm() {
    this.showForm = false;
    this.editing = null;
    this.formError = '';
  }

  onSave() {
    this.formError = '';
    if (!this.form.roomNumber || !this.form.type || !this.form.pricePerNight || !this.form.capacity) {
      this.formError = 'Please fill in all required fields.';
      return;
    }
    if (this.form.pricePerNight <= 0) { this.formError = 'Price must be greater than 0.'; return; }
    if (this.form.capacity <= 0) { this.formError = 'Capacity must be greater than 0.'; return; }

    this.saving = true;
    const data = {
      ...this.form,
      amenities: this.form.amenities ? this.form.amenities.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
    };

    const request = this.editing
      ? this.service.update(this.editing._id, data)
      : this.service.create(data);

    request.subscribe({
      next: () => { this.closeForm(); this.load(); this.saving = false; },
      error: (err) => { this.formError = err.error?.error || 'Operation failed.'; this.saving = false; }
    });
  }

  toggleStatus(room: Room) {
    const label = room.isAvailable ? 'maintenance' : 'available';
    this.confirm.confirm('Toggle Status', `Set room #${room.roomNumber} as ${label}?`).subscribe(r => {
      if (!r) return;
      this.service.toggleStatus(room._id).subscribe({
        next: () => this.load(),
        error: (err) => this.confirm.alert('Error', err.error?.error || 'Failed to update status.').subscribe()
      });
    });
  }

  onDelete(room: Room) {
    this.confirm.delete('Delete Room', `Delete room #${room.roomNumber}? This cannot be undone.`).subscribe(r => {
      if (!r) return;
      this.service.remove(room._id).subscribe({
        next: () => this.load(),
        error: (err) => this.confirm.alert('Error', err.error?.error || 'Failed to delete room.').subscribe()
      });
    });
  }
}
