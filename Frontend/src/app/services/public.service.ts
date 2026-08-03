import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PublicRoom {
  _id: string;
  roomNumber: string;
  type: string;
  pricePerNight: number;
  capacity: number;
  description?: string;
  amenities?: string[];
  isAvailable: boolean;
  images?: string[];
  availability: 'available' | 'booked' | 'checked_in' | 'checked_out' | 'unavailable';
}

export interface HotelInfo {
  _id?: string;
  hotelName: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class PublicService {
  private api = `${environment.apiUrl}/public`;

  constructor(private http: HttpClient) {}

  getRooms(checkIn?: string, checkOut?: string): Observable<PublicRoom[]> {
    let params: any = {};
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    return this.http.get<PublicRoom[]>(`${this.api}/rooms`, { params });
  }

  getRoomById(id: string, checkIn?: string, checkOut?: string): Observable<PublicRoom> {
    let params: any = {};
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    return this.http.get<PublicRoom>(`${this.api}/rooms/${id}`, { params });
  }

  getHotel(): Observable<HotelInfo> {
    return this.http.get<HotelInfo>(`${this.api}/hotel`);
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/register`, { username, email, password });
  }
}
