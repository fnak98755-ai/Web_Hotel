import { Component, OnInit } from '@angular/core';
import { HotelService, Hotel } from '../../services/hotel.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  hotel: Hotel | null = null;
  editing = false;
  saving = false;
  loading = false;
  formError = '';

  form: any = {
    hotelName: '', address: '', phone: '', email: '', website: '',
    taxId: '', logo: '', description: '', checkInTime: '14:00', checkOutTime: '12:00'
  };

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.hotelService.get().subscribe({
      next: (h) => { this.hotel = h; this.loading = false; },
      error: () => this.loading = false
    });
  }

  startEdit() {
    if (!this.hotel) return;
    this.form = {
      hotelName: this.hotel.hotelName,
      address: this.hotel.address || '',
      phone: this.hotel.phone || '',
      email: this.hotel.email || '',
      website: this.hotel.website || '',
      taxId: this.hotel.taxId || '',
      logo: this.hotel.logo || '',
      description: this.hotel.description || '',
      checkInTime: this.hotel.checkInTime || '14:00',
      checkOutTime: this.hotel.checkOutTime || '12:00',
    };
    this.editing = true;
    this.formError = '';
  }

  cancelEdit() {
    this.editing = false;
    this.formError = '';
  }

  onSave() {
    this.formError = '';
    if (!this.form.hotelName) {
      this.formError = 'Hotel name is required.';
      return;
    }

    this.saving = true;
    this.hotelService.update(this.form).subscribe({
      next: (h) => {
        this.hotel = h;
        this.editing = false;
        this.saving = false;
      },
      error: (err) => {
        this.formError = err.error?.error || 'Update failed.';
        this.saving = false;
      }
    });
  }
}
