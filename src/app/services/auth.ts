import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable, tap } from 'rxjs';

interface AuthResponse {
  token: string;
  email: string;
  role: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  login(email: string, motDePasse: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, motDePasse })
      .pipe(
        tap(response => {
          if (response.token && response.role === 'ADMIN') {
            localStorage.setItem('ika_token', response.token);
            localStorage.setItem('ika_user', JSON.stringify({ email: response.email, role: response.role }));
          } else if (response.role !== 'ADMIN') {
            throw new Error('ACCESS_DENIED');
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('ika_token');
    localStorage.removeItem('ika_user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('ika_token');
  }

  getToken(): string | null {
    return localStorage.getItem('ika_token');
  }

  getUser(): any {
    const user = localStorage.getItem('ika_user');
    return user ? JSON.parse(user) : null;
  }
}
