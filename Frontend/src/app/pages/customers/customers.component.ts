import { Component, OnInit } from '@angular/core';
import { CustomerService, Customer } from '../../services/customer.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filtered: Customer[] = [];

  showForm = false;
  editing: Customer | null = null;
  saving = false;
  formError = '';
  searchTerm = '';

  form: any = { name: '', email: '', phone: '', address: '', idType: '', idNumber: '' };

  constructor(private service: CustomerService, private confirm: ConfirmDialogService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getAll().subscribe(c => {
      this.customers = c;
      this.applyFilter();
    });
  }

  get stats() {
    return {
      total: this.customers.length,
      withId: this.customers.filter(c => c.idType).length,
      withPhone: this.customers.filter(c => c.phone).length,
    };
  }

  applyFilter() {
    const q = this.searchTerm.toLowerCase();
    this.filtered = q
      ? this.customers.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone || '').includes(q)
        )
      : [...this.customers];
  }

  idTypeLabel(type: string) {
    const map: any = { passport: 'Passport', national_id: 'National ID', drivers_license: "Driver's License" };
    return map[type] || type;
  }

  openAdd() {
    this.editing = null;
    this.form = { name: '', email: '', phone: '', address: '', idType: '', idNumber: '' };
    this.showForm = true;
    this.formError = '';
  }

  openEdit(c: Customer) {
    this.editing = c;
    this.form = { name: c.name, email: c.email, phone: c.phone || '', address: c.address || '', idType: c.idType || '', idNumber: c.idNumber || '' };
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
    if (!this.form.name || !this.form.email) {
      this.formError = 'Name and email are required.';
      return;
    }
    if (!this.form.email.includes('@')) {
      this.formError = 'Invalid email format.';
      return;
    }

    this.saving = true;
    const request = this.editing
      ? this.service.update(this.editing._id, this.form)
      : this.service.create(this.form);

    request.subscribe({
      next: () => { this.closeForm(); this.load(); this.saving = false; },
      error: (err) => { this.formError = err.error?.error || 'Operation failed.'; this.saving = false; }
    });
  }

  onDelete(c: Customer) {
    this.confirm.delete('Delete Customer', `Delete customer "${c.name}"? This cannot be undone.`).subscribe(r => {
      if (!r) return;
      this.service.remove(c._id).subscribe({
        next: () => this.load(),
        error: (err) => this.confirm.alert('Error', err.error?.error || 'Failed to delete customer.').subscribe()
      });
    });
  }
}
