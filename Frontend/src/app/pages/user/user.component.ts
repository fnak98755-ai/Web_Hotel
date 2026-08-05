import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface AppUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  permissions?: string[];
  createdAt: string;
}

const PERM_OPTIONS: { key: string; label: string; actions: string[] }[] = [
  { key: 'bookings', label: 'Bookings', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'reports', label: 'Reports', actions: ['view'] },
  { key: 'customers', label: 'Customers', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'employees', label: 'Employees', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'payments', label: 'Payments', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'rooms', label: 'Rooms', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'services', label: 'Services', actions: ['view', 'create', 'update', 'delete'] },
  { key: 'settings', label: 'Hotel Settings', actions: ['view'] },
];

const ACTION_LABELS: Record<string, string> = {
  view: 'View',
  create: 'Add',
  update: 'Update',
  delete: 'Delete',
};

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  users: AppUser[] = [];
  isAdmin = false;
  userEmail = '';
  userRole = '';

  showForm = false;
  editing: AppUser | null = null;
  saving = false;
  formError = '';

  form: any = { username: '', email: '', password: '', role: 'staff', permissions: [] };

  get permOptions() { return PERM_OPTIONS; }

  private api = `${environment.apiUrl}/users`;

  constructor(private auth: AuthService, private http: HttpClient, private confirm: ConfirmDialogService) {}

  ngOnInit() {
    const user = this.auth.getUser();
    this.isAdmin = user?.role === 'admin';
    this.userEmail = user?.email || '';
    this.userRole = user?.role || '';

    if (this.isAdmin) {
      this.loadUsers();
    }
  }

  private get headers() {
    return { Authorization: `Bearer ${this.auth.getToken()}` };
  }

  loadUsers() {
    this.http.get<AppUser[]>(this.api, { headers: this.headers }).subscribe({
      next: (u) => this.users = u,
      error: () => {}
    });
  }

  openAdd() {
    this.editing = null;
    this.form = { username: '', email: '', password: '', role: 'staff', permissions: [] };
    this.showForm = true;
    this.formError = '';
  }

  openEdit(u: AppUser) {
    this.editing = u;
    this.form = { role: u.role, permissions: u.permissions || [] };
    this.showForm = true;
    this.formError = '';
  }

  togglePerm(moduleKey: string, action: string) {
    const perms = new Set(this.form.permissions as string[]);
    const viewKey = moduleKey;
    const actionKey = action === 'view' ? moduleKey : `${moduleKey}:${action}`;
    const hasActionKey = action === 'view'
      ? perms.has(viewKey)
      : [...perms].some(p => p === actionKey);

    if (hasActionKey) {
      perms.delete(actionKey);
      if (action !== 'view') {
        const moduleActions = PERM_OPTIONS.find(m => m.key === moduleKey)?.actions || [];
        const remaining = moduleActions
          .filter(a => a !== 'view' && a !== action)
          .some(a => perms.has(`${moduleKey}:${a}`));
        if (!remaining) perms.delete(viewKey);
      }
    } else {
      perms.add(actionKey);
      if (action !== 'view') perms.add(viewKey);
    }
    this.form.permissions = [...perms];
  }

  permHas(moduleKey: string, action: string, perms?: string[]): boolean {
    const list = perms || (this.form.permissions as string[]) || [];
    if (action === 'view') return list.some(p => p === moduleKey || p.startsWith(moduleKey + ':'));
    return list.includes(`${moduleKey}:${action}`);
  }

  permLabels(perms?: string[]): string[] {
    if (!perms || !perms.length) return [];
    const labels: string[] = [];
    for (const m of PERM_OPTIONS) {
      const granted = perms
        .filter(p => p === m.key || p.startsWith(m.key + ':'))
        .map(p => (p === m.key ? 'view' : p.split(':')[1]));
      if (granted.length) labels.push(`${m.label}: ${granted.map(a => ACTION_LABELS[a]).join(', ')}`);
    }
    return labels;
  }

  closeForm() {
    this.showForm = false;
    this.editing = null;
    this.formError = '';
  }

  onSave() {
    this.formError = '';

    if (this.editing) {
      if (!this.form.role) {
        this.formError = 'Please select a role.';
        return;
      }
      this.saving = true;
      const body: any = { role: this.form.role, permissions: this.form.role === 'admin' ? [] : this.form.permissions };
      this.http.put(`${this.api}/${this.editing._id}`, body, { headers: this.headers }).subscribe({
        next: () => { this.closeForm(); this.loadUsers(); this.saving = false; },
        error: (err) => { this.formError = err.error?.error || 'Update failed.'; this.saving = false; }
      });
    } else {
      if (!this.form.username || !this.form.email || !this.form.password || !this.form.role) {
        this.formError = 'Please fill in all required fields.';
        return;
      }
      this.saving = true;
      const body: any = { ...this.form, permissions: this.form.role === 'admin' ? [] : this.form.permissions };
      this.http.post(this.api, body, { headers: this.headers }).subscribe({
        next: () => { this.closeForm(); this.loadUsers(); this.saving = false; },
        error: (err) => { this.formError = err.error?.error || 'Create failed.'; this.saving = false; }
      });
    }
  }

  onDelete(u: AppUser) {
    this.confirm.delete('Delete User', `Delete user ${u.email}? This cannot be undone.`).subscribe(r => {
      if (!r) return;
      this.http.delete(`${this.api}/${u._id}`, { headers: this.headers }).subscribe({
        next: () => this.loadUsers(),
        error: (err) => this.confirm.alert('Error', err.error?.error || 'Delete failed.').subscribe()
      });
    });
  }
}
