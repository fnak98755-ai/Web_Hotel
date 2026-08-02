import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Payment {
  _id: string;
  booking: any;
  amount: number;
  discount: number;
  discountType: string;
  finalAmount: number;
  method: string;
  status: string;
  cardLastFour?: string;
  qrReference?: string;
  receiptNumber: string;
  notes?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private api = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers() {
    return { Authorization: `Bearer ${this.auth.getToken()}` };
  }

  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.api, { headers: this.headers });
  }

  getById(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.api}/${id}`, { headers: this.headers });
  }

  create(data: any): Observable<Payment> {
    return this.http.post<Payment>(this.api, data, { headers: this.headers });
  }

  update(id: string, data: any): Observable<Payment> {
    return this.http.put<Payment>(`${this.api}/${id}`, data, { headers: this.headers });
  }

  remove(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`, { headers: this.headers });
  }
}
