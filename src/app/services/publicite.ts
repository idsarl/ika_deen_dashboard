import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Publicite {
  id?: string;
  lienDestination?: string;
  dateFin?: string;
  estActive: boolean;
  imageUrl?: string;
}

export interface CreatePubliciteParams {
  lienDestination?: string;
  dateFin?: string;
  image: File;
}

@Injectable({
  providedIn: 'root'
})
export class PubliciteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/publicites`;

  getActive(): Observable<Publicite[]> {
    return this.http.get<Publicite[]>(`${this.apiUrl}/active`);
  }

  create(params: CreatePubliciteParams): Observable<Publicite> {
    const formData = new FormData();
    if (params.lienDestination) {
      formData.append('lienDestination', params.lienDestination);
    }
    if (params.dateFin) {
      formData.append('dateFin', params.dateFin);
    }
    formData.append('image', params.image, params.image.name);
    return this.http.post<Publicite>(this.apiUrl, formData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
