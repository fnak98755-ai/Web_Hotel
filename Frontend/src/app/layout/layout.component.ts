import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarExpanded = true;
  sidebarOpen = false;
  private navSub!: Subscription;

  constructor(private auth: AuthService, private router: Router, private confirm: ConfirmDialogService) {}

  ngOnInit() {
    this.auth.refreshUser().subscribe({
      error: () => this.auth.logout()
    });
    this.navSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.sidebarOpen = false);
  }

  ngOnDestroy() {
    if (this.navSub) this.navSub.unsubscribe();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  get user() {
    return this.auth.getUser();
  }

  get isAdmin() {
    return this.auth.isAdmin();
  }

  can(perm: string): boolean {
    return this.auth.hasPerm(perm);
  }

  logout() {
    this.confirm.confirm('Logout', 'Are you sure you want to log out?').subscribe(r => {
      if (!r) return;
      this.auth.logout();
      this.router.navigate(['/login']);
    });
  }
}
