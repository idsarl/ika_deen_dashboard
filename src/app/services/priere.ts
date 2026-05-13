import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

export interface HorairesPriereResponse {
  fajr: string;
  shuruq: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
  methodeCalcul: string;
}

@Injectable({
  providedIn: 'root'
})
export class PriereService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/priere`;

  /**
   * Calcule les horaires pour une position et une méthode
   */
  getHoraires(lat: number, lon: number, methode: string = 'MWL'): Observable<HorairesPriereResponse> {
    return this.http.get<HorairesPriereResponse>(`${this.apiUrl}/horaires`, {
      params: { lat, lon, methode }
    });
  }
}
