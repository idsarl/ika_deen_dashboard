import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

export interface Radio {
  id?: string;
  nom: string;
  urlStream: string;
  logoUrl?: string;
}

export interface CreateRadioParams {
  nom: string;
  urlStream: string;
  logo?: File;
}

@Injectable({
  providedIn: 'root'
})
export class RadioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/radios`;

  getAll(): Observable<Radio[]> {
    return this.http.get<Radio[]>(this.apiUrl);
  }

  create(params: CreateRadioParams): Observable<Radio> {
    const formData = new FormData();
    formData.append('nom', params.nom);
    formData.append('urlStream', params.urlStream);
    if (params.logo) {
      formData.append('logo', params.logo, params.logo.name);
    }
    return this.http.post<Radio>(this.apiUrl, formData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
