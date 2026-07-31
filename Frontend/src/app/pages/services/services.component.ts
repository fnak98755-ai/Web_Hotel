import { Component, OnInit } from '@angular/core';
import { ServiceService, Service } from '../../services/service.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  services: Service[] = [];
  filtered: Service[] = [];

  showForm = false;
  editing: Service | null = null;
  saving = false;
  formError = '';

  categoryFilter = '';
  searchTerm = '';
  categories = ['food', 'transport', 'spa', 'laundry', 'other'];

  form: any = { name: '', category: '', price: null, description: '' };

  constructor(private service: ServiceService, private confirm: ConfirmDialogService) {}

  ngOnInit() { this.load(); }

  load() {
    this.service.getAll().subscribe(s => {
      this.services = s;
      this.applyFilter();
    });
  }

  applyFilter() {
    let list = [...this.services];
    if (this.categoryFilter) list = list.filter(s => s.category === this.categoryFilter);
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q));
    }
    this.filtered = list;
  }

  openAdd() {
    this.editing = null;
    this.form = { name: '', category: '', price: null, description: '' };
    this.showForm = true;
    this.formError = '';
  }

  openEdit(s: Service) {
    this.editing = s;
    this.form = { name: s.name, category: s.category || '', price: s.price, description: s.description || '' };
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
    if (!this.form.name || this.form.price == null) {
      this.formError = 'Name and price are required.';
      return;
    }
    if (this.form.price <= 0) {
      this.formError = 'Price must be greater than 0.';
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

  onDelete(s: Service) {
    this.confirm.delete('Delete Service', `Delete service "${s.name}"?`).subscribe(r => {
      if (!r) return;
      this.service.remove(s._id).subscribe({
        next: () => this.load(),
        error: (err) => this.confirm.alert('Error', err.error?.error || 'Failed to delete service.').subscribe()
      });
    });
  }
}
