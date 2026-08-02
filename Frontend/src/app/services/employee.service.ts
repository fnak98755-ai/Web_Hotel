import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Employee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  salary?: number;
  hireDate: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private api = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers() {
    return { Authorization: `Bearer ${this.auth.getToken()}` };
  }

  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.api, { headers: this.headers });
  }

  getById(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.api}/${id}`, { headers: this.headers });
  }

  create(data: any): Observable<Employee> {
    return this.http.post<Employee>(this.api, data, { headers: this.headers });
  }

  update(id: string, data: any): Observable<Employee> {
    return this.http.put<Employee>(`${this.api}/${id}`, data, { headers: this.headers });
  }

  toggleStatus(id: string): Observable<Employee> {
    return this.http.patch<Employee>(`${this.api}/${id}/status`, {}, { headers: this.headers });
  }

  remove(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`, { headers: this.headers });
  }
}
