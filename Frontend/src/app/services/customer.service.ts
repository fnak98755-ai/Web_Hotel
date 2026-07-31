import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  idType?: string;
  idNumber?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private api = 'http://localhost:3000/api/customers';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers() {
    return { Authorization: `Bearer ${this.auth.getToken()}` };
  }

  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.api, { headers: this.headers });
  }

  create(data: any): Observable<Customer> {
    return this.http.post<Customer>(this.api, data, { headers: this.headers });
  }

  update(id: string, data: any): Observable<Customer> {
    return this.http.put<Customer>(`${this.api}/${id}`, data, { headers: this.headers });
  }

  remove(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`, { headers: this.headers });
  }
}
