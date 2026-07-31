import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { BookingsComponent } from './pages/bookings/bookings.component';
import { BookingsReportComponent } from './pages/bookings-report/bookings-report.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { ServicesComponent } from './pages/services/services.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { UserComponent } from './pages/user/user.component';
import { PublicHomeComponent } from './pages/public-home/public-home.component';
import { RoomDetailComponent } from './pages/room-detail/room-detail.component';
import { RegisterComponent } from './pages/register/register.component';
import { CustomerBookingsComponent } from './pages/customer-bookings/customer-bookings.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    LoginComponent,
    BookingsComponent,
    BookingsReportComponent,
    ConfirmDialogComponent,
    CustomersComponent,
    EmployeesComponent,
    PaymentsComponent,
    RoomsComponent,
    ServicesComponent,
    SettingsComponent,
    UserComponent,
    PublicHomeComponent,
    RoomDetailComponent,
    RegisterComponent,
    CustomerBookingsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
