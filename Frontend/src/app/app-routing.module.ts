import { NgModule, inject } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { BookingsComponent } from './pages/bookings/bookings.component';
import { BookingsReportComponent } from './pages/bookings-report/bookings-report.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { ServicesComponent } from './pages/services/services.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { UserComponent } from './pages/user/user.component';
import { authGuard } from './services/auth.guard';
import { permGuard } from './services/perm.guard';
import { AuthService } from './services/auth.service';
import { PublicHomeComponent } from './pages/public-home/public-home.component';
import { RoomDetailComponent } from './pages/room-detail/room-detail.component';
import { RegisterComponent } from './pages/register/register.component';
import { CustomerBookingsComponent } from './pages/customer-bookings/customer-bookings.component';

const routes: Routes = [
  { path: '', component: PublicHomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'room/:id', component: RoomDetailComponent },
  { path: 'my-bookings', component: CustomerBookingsComponent, canActivate: [authGuard] },
  {
    path: '',
    canMatch: [() => {
      const auth = inject(AuthService);
      const router = inject(Router);
      if (!auth.isLoggedIn()) return router.parseUrl('/login');
      if (auth.hasRole('admin', 'staff')) return true;
      return router.parseUrl('/');
    }],
    component: LayoutComponent,
    children: [
      { path: 'bookings', component: BookingsComponent, canActivate: [permGuard('bookings')] },
      { path: 'bookings/report', component: BookingsReportComponent, canActivate: [permGuard('reports')] },
      { path: 'customers', component: CustomersComponent, canActivate: [permGuard('customers')] },
      { path: 'employees', component: EmployeesComponent, canActivate: [permGuard('employees')] },
      { path: 'payments', component: PaymentsComponent, canActivate: [permGuard('payments')] },
      { path: 'rooms', component: RoomsComponent, canActivate: [permGuard('rooms')] },
      { path: 'services', component: ServicesComponent, canActivate: [permGuard('services')] },
      { path: 'settings', component: SettingsComponent, canActivate: [permGuard('settings')] },
      { path: 'user', component: UserComponent, canActivate: [permGuard('users')] },
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
