import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

// Interface correspondant à votre entité Java HorairesVille
export interface HorairesVille {
  id?: string;
  nomVille: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  dateValidite?: string;
  sourceAutorite?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HorairesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/horaires-ville`;

  // Récupérer les horaires par géolocalisation automatique
  getByGeolocalisation(lat: number, lon: number): Observable<HorairesVille> {
    return this.http.get<HorairesVille>(`${this.apiUrl}/geolocalisation`, {
      params: { 
        lat: lat.toString(), 
        lon: lon.toString() 
      }
    });
  }

  // Récupérer les horaires par nom de ville (pour recherche manuelle)
  getByVille(ville: string): Observable<HorairesVille> {
    return this.http.get<HorairesVille>(`${this.apiUrl}/${ville}`);
  }

  // Pour le Super Admin : Configurer les horaires
  configurer(horaires: HorairesVille): Observable<HorairesVille> {
    return this.http.post<HorairesVille>(`${this.apiUrl}/admin/configurer`, horaires);
  }

  // Pour le Super Admin : Modifier les horaires existants
  modifier(ville: string, horaires: HorairesVille): Observable<HorairesVille> {
    return this.http.put<HorairesVille>(`${this.apiUrl}/admin/modifier/${ville}`, horaires);
  }

  // services/HorairesService.ts
getAll(): Observable<HorairesVille[]> {
  return this.http.get<HorairesVille[]>(`${this.apiUrl}/all`);
}
}