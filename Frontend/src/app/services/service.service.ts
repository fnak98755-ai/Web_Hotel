import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Service {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private api = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers() {
    return { Authorization: `Bearer ${this.auth.getToken()}` };
  }

  getAll(): Observable<Service[]> {
    return this.http.get<Service[]>(this.api, { headers: this.headers });
  }

  create(data: any): Observable<Service> {
    return this.http.post<Service>(this.api, data, { headers: this.headers });
  }

  update(id: string, data: any): Observable<Service> {
    return this.http.put<Service>(`${this.api}/${id}`, data, { headers: this.headers });
  }

  remove(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`, { headers: this.headers });
  }
}
