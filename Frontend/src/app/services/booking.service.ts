import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Room {
  _id: string;
  roomNumber: string;
  type: string;
  pricePerNight: number;
  capacity: number;
  isAvailable: boolean;
}

export interface BookedService {
  _id: string;
  service?: { _id: string; name: string; price: number };
  name: string;
  price: number;
  quantity: number;
}

export interface Booking {
  _id: string;
  customer: Customer;
  room: Room;
  checkIn: string;
  checkOut: string;
  status: string;
  totalAmount: number;
  specialRequests?: string;
  services: BookedService[];
  createdAt: string;
}

export interface Service {
  _id: string;
  name: string;
  price: number;
  category?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private api = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers() {
    return { Authorization: `Bearer ${this.auth.getToken()}` };
  }

  getAll(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.api}/bookings`, { headers: this.headers });
  }

  getReport(params: any): Observable<any> {
    return this.http.get<any>(`${this.api}/bookings/report`, { headers: this.headers, params });
  }

  create(data: any): Observable<Booking> {
    return this.http.post<Booking>(`${this.api}/bookings`, data, { headers: this.headers });
  }

  cancel(id: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.api}/bookings/${id}/cancel`, {}, { headers: this.headers });
  }

  addService(bookingId: string, serviceId: string, quantity: number): Observable<Booking> {
    return this.http.post<Booking>(`${this.api}/bookings/${bookingId}/services`, { serviceId, quantity }, { headers: this.headers });
  }

  removeService(bookingId: string, serviceItemId: string): Observable<Booking> {
    return this.http.delete<Booking>(`${this.api}/bookings/${bookingId}/services/${serviceItemId}`, { headers: this.headers });
  }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.api}/customers`, { headers: this.headers });
  }

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.api}/rooms`, { headers: this.headers });
  }
}
