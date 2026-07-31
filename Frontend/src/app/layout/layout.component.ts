import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  sidebarExpanded = true;

  constructor(private auth: AuthService, private router: Router) {}

  get user() {
    return this.auth.getUser();
  }

  get isAdmin() {
    return this.auth.isAdmin();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
