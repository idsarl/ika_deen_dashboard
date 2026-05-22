import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

export interface Adresse {
  rue?: string;
  ville?: string;
  pays?: string;
}

export interface Contact {
  telephone?: string;
  email?: string;
  siteWeb?: string;
}

export interface Equipements {
  parking?: boolean;
  sectionFemmes?: boolean;
  accesHandicapes?: boolean;
}

export interface HorairesPriere {
  fajr?: string;
  dhuhr?: string;
  asr?: string;
  maghrib?: string;
  isha?: string;
  jumua?: string;
}

export interface ImamInfo {
  nom?: string;
  bio?: string;
  photoUrl?: string;
}

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

/** Payload JSON (création via part `data`, mise à jour via PUT) — sans imam.photoUrl */
export interface MosqueeRequest {
  nom: Record<string, string>;
  description?: Record<string, string>;
  latitude: number;
  longitude: number;
  adresse?: Adresse;
  contact?: Contact;
  equipements?: Equipements;
  horairesPriere?: HorairesPriere;
  imam?: {
    nom?: string;
    bio?: string;
  };
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
   * Créer une mosquée (ADMIN) — multipart/form-data : part `data` (JSON) + part `imamPhoto` (optionnel)
   */
  createMosquee(payload: MosqueeRequest, imamPhoto?: File): Observable<Mosquee> {
    const formData = new FormData();
    const data = this.stripImamPhotoUrl(payload);

    formData.append(
      'data',
      new Blob([JSON.stringify(data)], { type: 'application/json' })
    );

    if (imamPhoto) {
      formData.append('imamPhoto', imamPhoto, imamPhoto.name);
    }

    return this.http.post<Mosquee>(this.apiUrl, formData);
  }

  /**
   * Mettre à jour une mosquée (ADMIN) — JSON
   */
  update(id: string, request: MosqueeRequest): Observable<Mosquee> {
    return this.http.put<Mosquee>(`${this.apiUrl}/${id}`, this.stripImamPhotoUrl(request));
  }

  /**
   * Supprimer une mosquée (ADMIN)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * URL d'affichage pour imam.photoUrl retourné par l'API (chemin relatif ou URL absolue)
   */
  getImamPhotoUrl(path: string | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = (environment as { apiBaseUrl?: string }).apiBaseUrl ?? '';
    return `${base}${path}`;
  }

  private stripImamPhotoUrl(payload: MosqueeRequest): MosqueeRequest {
    const data = { ...payload };
    if (data.imam && 'photoUrl' in (data.imam as ImamInfo)) {
      const { photoUrl: _removed, ...imamSansPhoto } = data.imam as ImamInfo;
      data.imam = imamSansPhoto;
    }
    return data;
  }
}
