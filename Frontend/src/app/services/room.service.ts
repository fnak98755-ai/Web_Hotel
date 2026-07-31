import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Room {
  _id: string;
  roomNumber: string;
  type: string;
  pricePerNight: number;
  capacity: number;
  description?: string;
  amenities: string[];
  isAvailable: boolean;
  images: string[];
  currentStatus?: 'available' | 'booked' | 'maintenance';
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private api = 'http://localhost:3000/api/rooms';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers() {
    return { Authorization: `Bearer ${this.auth.getToken()}` };
  }

  getAll(): Observable<Room[]> {
    return this.http.get<Room[]>(this.api, { headers: this.headers });
  }

  getById(id: string): Observable<Room> {
    return this.http.get<Room>(`${this.api}/${id}`, { headers: this.headers });
  }

  create(data: any): Observable<Room> {
    return this.http.post<Room>(this.api, data, { headers: this.headers });
  }

  update(id: string, data: any): Observable<Room> {
    return this.http.put<Room>(`${this.api}/${id}`, data, { headers: this.headers });
  }

  toggleStatus(id: string): Observable<Room> {
    return this.http.patch<Room>(`${this.api}/${id}/status`, {}, { headers: this.headers });
  }

  remove(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`, { headers: this.headers });
  }
}
