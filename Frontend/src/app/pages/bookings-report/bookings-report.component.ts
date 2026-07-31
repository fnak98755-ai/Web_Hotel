import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-bookings-report',
  templateUrl: './bookings-report.component.html',
  styleUrls: ['./bookings-report.component.scss']
})
export class BookingsReportComponent implements OnInit {
  activeRange = 'daily';
  fromDate = '';
  toDate = '';
  loading = false;

  report: any = { periods: [], summary: {} };
  filteredPeriods: any[] = [];

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    const today = new Date();
    this.toDate = this.toISODate(today);
    const past = new Date(today);
    past.setDate(past.getDate() - 30);
    this.fromDate = this.toISODate(past);
    this.load();
  }

  toISODate(d: Date) {
    return d.toISOString().substring(0, 10);
  }

  setRange(range: string) {
    this.activeRange = range;
    const today = new Date();
    this.toDate = this.toISODate(today);
    if (range === 'daily') {
      const past = new Date(today);
      past.setDate(past.getDate() - 30);
      this.fromDate = this.toISODate(past);
    } else if (range === 'weekly') {
      const past = new Date(today);
      past.setDate(past.getDate() - 90);
      this.fromDate = this.toISODate(past);
    } else if (range === 'monthly') {
      const past = new Date(today);
      past.setFullYear(past.getFullYear() - 1);
      this.fromDate = this.toISODate(past);
    }
    this.load();
  }

  load() {
    this.loading = true;
    this.bookingService.getReport({
      range: this.activeRange,
      from: this.fromDate,
      to: this.toDate
    }).subscribe({
      next: (res) => {
        this.report = res;
        this.applyFilter();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilter() {
    this.filteredPeriods = [...(this.report.periods || [])];
  }

  get totalBookings() {
    return this.filteredPeriods.reduce((s: number, p: any) => s + p.count, 0);
  }

  get totalRevenue() {
    return this.filteredPeriods.reduce((s: number, p: any) => s + p.totalRevenue, 0);
  }

  get totalCheckedOut() {
    return this.filteredPeriods.reduce((s: number, p: any) => s + p.checkedOut, 0);
  }

  get totalCancelled() {
    return this.filteredPeriods.reduce((s: number, p: any) => s + p.cancelled, 0);
  }

  periodLabel(id: string) {
    if (this.activeRange === 'monthly') {
      const [y, m] = id.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[parseInt(m) - 1]} ${y}`;
    }
    if (this.activeRange === 'weekly') {
      return `Week ${id.split('-W')[1]}, ${id.split('-W')[0]}`;
    }
    const d = new Date(id);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  exportCSV() {
    const rows = [['Period', 'Bookings', 'Revenue', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled', 'Pending']];
    for (const p of this.filteredPeriods) {
      rows.push([
        this.periodLabel(p._id),
        p.count,
        p.totalRevenue.toFixed(2),
        p.confirmed,
        p.checkedIn,
        p.checkedOut,
        p.cancelled,
        p.pending
      ]);
    }
    rows.push([]);
    rows.push(['TOTAL', this.totalBookings, this.totalRevenue.toFixed(2), '', '', this.totalCheckedOut, this.totalCancelled, '']);

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-report-${this.activeRange}-${this.fromDate}-${this.toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportJSON() {
    const data = {
      range: this.activeRange,
      from: this.fromDate,
      to: this.toDate,
      periods: this.filteredPeriods,
      summary: {
        totalBookings: this.totalBookings,
        totalRevenue: this.totalRevenue,
        totalCheckedOut: this.totalCheckedOut,
        totalCancelled: this.totalCancelled,
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-report-${this.activeRange}-${this.fromDate}-${this.toDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
