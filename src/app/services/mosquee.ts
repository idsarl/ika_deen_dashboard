import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

/**
 * Interfaces calquées sur le Backend Spring Boot
 */
export interface Mosquee {
  id?: string;
  nom: { [key: string]: string };
  slug: string;
  description: { [key: string]: string };
  adresse: {
    rue: string;
    ville: string;
    pays: string;
  };
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  contact: {
    telephone: string;
    email: string;
    siteWeb: string;
  };
  equipements: {
    parking: boolean;
    sectionFemmes: boolean;
    accesHandicapes: boolean;
  };
  horairesPriere: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    jumua: string;
  };
  imam: {
    nom: string;
    bio: string;
    photoUrl: string;
  };
  evaluationMoyenne: number;
  nombreAvis: number;
}

export interface MosqueeRequest {
  nom: { [key: string]: string };
  description: { [key: string]: string };
  latitude: number;
  longitude: number;
  adresse: any;
  contact: any;
  equipements: any;
  horairesPriere: any;
  imam: any;
}

@Injectable({
  providedIn: 'root'
})
export class MosqueeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/mosquees`;

  /**
   * Liste toutes les mosquées
   */
  getAll(): Observable<Mosquee[]> {
    return this.http.get<Mosquee[]>(this.apiUrl);
  }

  /**
   * Détails d'une mosquée
   */
  getById(id: string): Observable<Mosquee> {
    return this.http.get<Mosquee>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer une mosquée (ADMIN)
   */
  create(request: MosqueeRequest): Observable<Mosquee> {
    return this.http.post<Mosquee>(this.apiUrl, request);
  }

  /**
   * Mettre à jour une mosquée (ADMIN)
   */
  update(id: string, request: MosqueeRequest): Observable<Mosquee> {
    return this.http.put<Mosquee>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Supprimer une mosquée (ADMIN)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
