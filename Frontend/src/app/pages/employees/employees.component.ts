import { Component, OnInit } from '@angular/core';
import { EmployeeService, Employee } from '../../services/employee.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  filtered: Employee[] = [];

  showForm = false;
  editing: Employee | null = null;
  saving = false;
  formError = '';

  positionFilter = '';
  statusFilter = '';
  searchTerm = '';

  positions = ['Manager', 'Receptionist', 'Housekeeper', 'Chef', 'Waiter', 'Security', 'Accountant', 'Maintenance'];
  departments = ['Management', 'Front Desk', 'Housekeeping', 'Kitchen', 'Restaurant', 'Security', 'Finance', 'Maintenance'];

  form: any = {
    name: '', email: '', phone: '', position: '', department: '', salary: null, hireDate: ''
  };

  constructor(private service: EmployeeService, private confirm: ConfirmDialogService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getAll().subscribe(e => {
      this.employees = e;
      this.applyFilter();
    });
  }

  get stats() {
    return {
      total: this.employees.length,
      active: this.employees.filter(e => e.isActive).length,
      inactive: this.employees.filter(e => !e.isActive).length,
    };
  }

  applyFilter() {
    let list = [...this.employees];
    if (this.positionFilter) list = list.filter(e => e.position === this.positionFilter);
    if (this.statusFilter === 'active') list = list.filter(e => e.isActive);
    if (this.statusFilter === 'inactive') list = list.filter(e => !e.isActive);
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.phone && e.phone.toLowerCase().includes(q))
      );
    }
    this.filtered = list;
  }

  openAdd() {
    this.editing = null;
    this.form = { name: '', email: '', phone: '', position: '', department: '', salary: null, hireDate: '' };
    this.showForm = true;
    this.formError = '';
  }

  openEdit(emp: Employee) {
    this.editing = emp;
    this.form = {
      name: emp.name, email: emp.email, phone: emp.phone || '', position: emp.position,
      department: emp.department || '', salary: emp.salary || null,
      hireDate: emp.hireDate ? emp.hireDate.substring(0, 10) : ''
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
    if (!this.form.name || !this.form.email || !this.form.position) {
      this.formError = 'Please fill in all required fields.';
      return;
    }

    this.saving = true;
    const data = { ...this.form };
    if (!data.hireDate) delete data.hireDate;
    if (!data.salary) data.salary = null;
    if (!data.phone) data.phone = '';

    const request = this.editing
      ? this.service.update(this.editing._id, data)
      : this.service.create(data);

    request.subscribe({
      next: () => { this.closeForm(); this.load(); this.saving = false; },
      error: (err) => { this.formError = err.error?.error || 'Operation failed.'; this.saving = false; }
    });
  }

  toggleStatus(emp: Employee) {
    const label = emp.isActive ? 'deactivate' : 'activate';
    this.confirm.confirm('Toggle Status', `Are you sure you want to ${label} ${emp.name}?`).subscribe(r => {
      if (!r) return;
      this.service.toggleStatus(emp._id).subscribe({
        next: () => this.load(),
        error: (err) => this.confirm.alert('Error', err.error?.error || 'Failed to update status.').subscribe()
      });
    });
  }

  onDelete(emp: Employee) {
    this.confirm.delete('Delete Employee', `Delete ${emp.name}? This cannot be undone.`).subscribe(r => {
      if (!r) return;
      this.service.remove(emp._id).subscribe({
        next: () => this.load(),
        error: (err) => this.confirm.alert('Error', err.error?.error || 'Failed to delete employee.').subscribe()
      });
    });
  }
}
