import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface ValidationPendingResponse {
  id: string;
  type: string;
  contenu: any;
  auteur: {
    id?: string;
    email?: string;
    nom?: string;
  };
  date: string;
}

export interface ValidationRejectRequest {
  motif?: string;
}

@Injectable({ providedIn: 'root' })
export class ValidationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/validations`;

  getPending(): Observable<ValidationPendingResponse[]> {
    return this.http.get<ValidationPendingResponse[]>(`${this.apiUrl}/pending`);
  }

  approve(id: string): Observable<ValidationPendingResponse> {
    return this.http.post<ValidationPendingResponse>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: string, motif?: string): Observable<ValidationPendingResponse> {
    const body: ValidationRejectRequest = motif ? { motif } : {};
    return this.http.post<ValidationPendingResponse>(`${this.apiUrl}/${id}/reject`, body);
  }
}