import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  role: string;
  permissions?: string[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  private publicApi = `${environment.apiUrl}/public`;

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.publicApi}/register`, { username, email, password });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): User | null {
    const user = localStorage.getItem('user');
    if (!user) return null;
    const parsed = JSON.parse(user) as User;
    parsed.permissions = parsed.permissions || [];
    return parsed;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(...roles: string[]): boolean {
    const user = this.getUser();
    return !!user && roles.includes(user.role);
  }

  hasPerm(...perms: string[]): boolean {
    const user = this.getUser();
    if (!user) return false;
    if (user.role === 'admin') return true;
    const userPerms = user.permissions || [];
    return perms.some(p =>
      userPerms.includes(p) || userPerms.some(u => u.startsWith(p + ':'))
    );
  }

  canAction(module: string, action: string): boolean {
    return this.hasPerm(`${module}:${action}`);
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isStaff(): boolean {
    return this.hasRole('staff');
  }

  refreshUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        user.permissions = user.permissions || [];
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }
}
