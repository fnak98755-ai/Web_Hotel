import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { PaymentService, Payment } from '../../services/payment.service';
import { BookingService, Booking } from '../../services/booking.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import QRCode from 'qrcode';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  @ViewChild('receiptContent') receiptContent!: ElementRef;

  payments: Payment[] = [];
  filtered: Payment[] = [];
  bookings: Booking[] = [];

  showForm = false;
  editing: Payment | null = null;
  saving = false;
  formError = '';

  showReceipt = false;
  receiptData: any = {};

  methodFilter = '';
  statusFilter = '';
  searchTerm = '';

  selectedBooking: Booking | null = null;
  editStatus = '';

  qrDataUrl = '';

  form: any = {
    booking: '', amount: null, method: 'cash', discount: 0,
    discountType: 'fixed', cardLastFour: '', qrReference: '', notes: ''
  };

  constructor(
    private paymentService: PaymentService,
    private bookingService: BookingService,
    private confirm: ConfirmDialogService
  ) {}

  ngOnInit() {
    this.load();
    this.loadBookings();
  }

  load() {
    this.paymentService.getAll().subscribe(p => {
      this.payments = p;
      this.applyFilter();
    });
  }

  loadBookings() {
    this.bookingService.getAll().subscribe(b => {
      this.bookings = b;
    });
  }

  get stats() {
    const today = new Date().toDateString();
    const todayPayments = this.payments.filter(p => {
      const d = new Date(p.createdAt).toDateString();
      return d === today && p.status === 'completed';
    });
    return {
      total: this.payments.length,
      revenue: this.payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.finalAmount, 0),
      today: todayPayments.length,
      todayRevenue: todayPayments.reduce((s, p) => s + p.finalAmount, 0),
    };
  }

  applyFilter() {
    let list = [...this.payments];
    if (this.methodFilter) list = list.filter(p => p.method === this.methodFilter);
    if (this.statusFilter) list = list.filter(p => p.status === this.statusFilter);
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(p =>
        (p.receiptNumber && p.receiptNumber.toLowerCase().includes(q)) ||
        (p.booking?.customer?.name && p.booking.customer.name.toLowerCase().includes(q)) ||
        (p.booking?.room?.roomNumber && p.booking.room.roomNumber.toLowerCase().includes(q))
      );
    }
    this.filtered = list;
  }

  methodLabel(m: string) {
    const map: any = { cash: 'Cash', card: 'Card', qr: 'QR' };
    return map[m] || m;
  }

  statusDotClass(s: string) {
    const map: any = { completed: 'green', refunded: 'orange', failed: 'red', pending: 'yellow' };
    return map[s] || 'green';
  }

  onBookingChange() {
    const b = this.bookings.find(b => b._id === this.form.booking);
    this.selectedBooking = b || null;
    if (b) {
      this.form.amount = b.totalAmount;
    }
    this.updateFinalAmount();
    this.regenerateQR();
  }

  updateFinalAmount() {
  }

  getFinalAmount(): number {
    const amount = Number(this.form.amount) || 0;
    const discount = Number(this.form.discount) || 0;
    if (!discount || discount <= 0) return amount;
    if (this.form.discountType === 'percentage') {
      return Math.round((amount - (amount * discount) / 100) * 100) / 100;
    }
    return Math.max(0, Math.round((amount - discount) * 100) / 100);
  }

  onMethodChange() {
    if (this.form.method === 'qr') {
      this.regenerateQR();
    } else {
      this.qrDataUrl = '';
    }
  }

  regenerateQR() {
    if (this.form.method !== 'qr' || !this.selectedBooking) return;

    const ref = `QR-${this.selectedBooking.room?.roomNumber || ''}-${Date.now().toString().slice(-6)}`;
    this.form.qrReference = ref;

    const paymentData = JSON.stringify({
      ref,
      hotel: 'SETEC Hotel',
      amount: this.getFinalAmount(),
      customer: this.selectedBooking.customer?.name || '',
      room: this.selectedBooking.room?.roomNumber || '',
    });

    QRCode.toDataURL(paymentData, {
      width: 200,
      margin: 2,
      color: { dark: '#1a1d29', light: '#ffffff' }
    }).then(url => {
      this.qrDataUrl = url;
    });
  }

  loadReceiptQR(payment: any) {
    if (payment.method !== 'qr') return;
    const paymentData = JSON.stringify({
      ref: payment.qrReference,
      hotel: 'SETEC Hotel',
      amount: payment.finalAmount,
      receipt: payment.receiptNumber,
    });
    QRCode.toDataURL(paymentData, {
      width: 160,
      margin: 2,
      color: { dark: '#1a1d29', light: '#ffffff' }
    }).then(url => {
      this.receiptQrUrl = url;
    });
  }

  receiptQrUrl = '';

  openAdd() {
    this.editing = null;
    this.selectedBooking = null;
    this.qrDataUrl = '';
    this.form = {
      booking: '', amount: null, method: 'cash', discount: 0,
      discountType: 'fixed', cardLastFour: '', qrReference: '', notes: ''
    };
    this.showForm = true;
    this.formError = '';
  }

  openEdit(p: Payment) {
    this.editing = p;
    this.editStatus = p.status;
    this.showForm = true;
    this.formError = '';
  }

  completePayment(p: Payment) {
    this.editing = p;
    this.form = {
      booking: p.booking?._id || '',
      amount: p.amount,
      method: p.method || 'cash',
      discount: p.discount || 0,
      discountType: p.discountType || 'fixed',
      cardLastFour: p.cardLastFour || '',
      qrReference: p.qrReference || '',
      notes: p.notes || '',
    };
    this.selectedBooking = p.booking as any || null;
    this.showForm = true;
    this.formError = '';
    this.regenerateQR();
  }

  closeForm() {
    this.showForm = false;
    this.editing = null;
    this.formError = '';
  }

  onSave() {
    this.formError = '';
    if (!this.form.booking || !this.form.amount || !this.form.method) {
      this.formError = 'Please select a booking, enter amount, and choose payment method.';
      return;
    }

    this.saving = true;
    const data = {
      booking: this.form.booking,
      amount: this.form.amount,
      method: this.form.method,
      discount: this.form.discount || 0,
      discountType: this.form.discountType,
      cardLastFour: this.form.method === 'card' ? this.form.cardLastFour : undefined,
      qrReference: this.form.method === 'qr' ? this.form.qrReference : undefined,
      notes: this.form.notes || undefined,
      status: 'completed',
    };

    if (this.editing) {
      this.paymentService.update(this.editing._id, data).subscribe({
        next: () => { this.closeForm(); this.load(); this.saving = false; },
        error: (err) => { this.formError = err.error?.error || 'Payment failed.'; this.saving = false; }
      });
    } else {
      this.paymentService.create(data).subscribe({
        next: () => { this.closeForm(); this.load(); this.saving = false; },
        error: (err) => { this.formError = err.error?.error || 'Payment failed.'; this.saving = false; }
      });
    }
  }

  onUpdateStatus() {
    if (!this.editing) return;
    this.saving = true;
    this.paymentService.update(this.editing._id, { status: this.editStatus }).subscribe({
      next: () => { this.closeForm(); this.load(); this.saving = false; },
      error: (err) => { this.formError = err.error?.error || 'Update failed.'; this.saving = false; }
    });
  }

  viewReceipt(p: Payment) {
    this.receiptData = p;
    this.receiptQrUrl = '';
    this.loadReceiptQR(p);
    this.showReceipt = true;
  }

  printReceipt() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = this.receiptContent.nativeElement.cloneNode(true);
    const styles = Array.from(document.styleSheets)
      .map(s => {
        try { return Array.from(s.cssRules || []).map(r => r.cssText).join(''); }
        catch { return ''; }
      }).join('');

    printWindow.document.write(`
      <html>
        <head><title>Receipt - ${this.receiptData.receiptNumber}</title>
        <style>${styles} body { padding: 40px; } .modal-overlay { background: none; position: static; } .receipt-modal { box-shadow: none; max-width: 400px; margin: 0 auto; } .btn { display: none; }</style>
        </head>
        <body>${content.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  onDelete(p: Payment) {
    this.confirm.delete('Delete Payment', `Delete payment ${p.receiptNumber}? This cannot be undone.`).subscribe(r => {
      if (!r) return;
      this.paymentService.remove(p._id).subscribe({
        next: () => this.load(),
        error: (err) => this.confirm.alert('Error', err.error?.error || 'Failed to delete payment.').subscribe()
      });
    });
  }
}
