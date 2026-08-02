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
  createdAt: string;
}

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

  form: any = { username: '', email: '', password: '', role: 'staff' };

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
    this.form = { username: '', email: '', password: '', role: 'staff' };
    this.showForm = true;
    this.formError = '';
  }

  openEdit(u: AppUser) {
    this.editing = u;
    this.form = { role: u.role };
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

    if (this.editing) {
      if (!this.form.role) {
        this.formError = 'Please select a role.';
        return;
      }
      this.saving = true;
      this.http.put(`${this.api}/${this.editing._id}`, { role: this.form.role }, { headers: this.headers }).subscribe({
        next: () => { this.closeForm(); this.loadUsers(); this.saving = false; },
        error: (err) => { this.formError = err.error?.error || 'Update failed.'; this.saving = false; }
      });
    } else {
      if (!this.form.username || !this.form.email || !this.form.password || !this.form.role) {
        this.formError = 'Please fill in all required fields.';
        return;
      }
      this.saving = true;
      this.http.post(this.api, this.form, { headers: this.headers }).subscribe({
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
