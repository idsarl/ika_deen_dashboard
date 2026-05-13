import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

/**
 * Interfaces calquées sur le Backend Spring Boot
 */
export interface Profil {
  id: string;
  utilisateurId: string;
  nomAffichage: string;
  avatarUrl: string;
  dateNaissance: string;
  genre: string;
  languePreferee: string;
  fuseauHoraire: string;
  location: {
    type: string;
    coordinates: number[]; // [lon, lat]
  };
  ville: string;
  pays: string;
  reglagesPriere: {
    methodeCalcul: string;
    asrJuridique: string;
    ajustements: {
      fajr: number;
      dhuhr: number;
      asr: number;
      maghrib: number;
      isha: number;
    };
  };
  preferencesNotification: {
    rappelsPriere: boolean;
    minutesAvantRappel: number;
    versetQuotidien: boolean;
    hadithQuotidien: boolean;
    notificationsEvenements: boolean;
    notificationsPromotionnelles: boolean;
  };
  statistiques?: {
    totalPrieresEnregistrees: number;
    tempsTotalLectureCoran: number;
    totalTasbih: number;
    serieJoursActifs: number;
  };
}

export interface ProfilRequest {
  nomAffichage?: string;
  avatarUrl?: string;
  dateNaissance?: string;
  genre?: string;
  languePreferee?: string;
  ville?: string;
  pays?: string;
  latitude?: number;
  longitude?: number;
  reglagesPriere?: any;
  preferencesNotification?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProfilService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/profil`;

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  getMe(): Observable<Profil> {
    return this.http.get<Profil>(`${this.apiUrl}/me`);
  }

  /**
   * Met à jour le profil de l'utilisateur connecté
   */
  updateMe(request: ProfilRequest): Observable<Profil> {
    return this.http.put<Profil>(`${this.apiUrl}/me`, request);
  }
}
