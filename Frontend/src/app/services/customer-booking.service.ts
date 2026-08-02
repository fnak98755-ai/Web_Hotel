import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface CustomerBooking {
  _id: string;
  customer: { _id: string; name: string; email: string };
  room: { _id: string; roomNumber: string; type: string; pricePerNight: number };
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
  specialRequests?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerBookingService {
  private api = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers() {
    return { Authorization: `Bearer ${this.auth.getToken()}` };
  }

  getMyBookings(): Observable<CustomerBooking[]> {
    return this.http.get<CustomerBooking[]>(`${this.api}/my`, { headers: this.headers });
  }

  createOnline(data: { room: string; checkIn: string; checkOut: string; specialRequests?: string }): Observable<CustomerBooking> {
    return this.http.post<CustomerBooking>(`${this.api}/online`, data, { headers: this.headers });
  }
}
