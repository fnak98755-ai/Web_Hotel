import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Hotel {
  _id: string;
  hotelName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  logo: string;
  description: string;
  checkInTime: string;
  checkOutTime: string;
}

@Injectable({ providedIn: 'root' })
export class HotelService {
  private api = 'http://localhost:3000/api/hotel';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers() {
    return { Authorization: `Bearer ${this.auth.getToken()}` };
  }

  get(): Observable<Hotel> {
    return this.http.get<Hotel>(this.api, { headers: this.headers });
  }

  update(data: any): Observable<Hotel> {
    return this.http.put<Hotel>(this.api, data, { headers: this.headers });
  }
}
