import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Evenement {
  id?: string;
  mosqueeId: string;
  titre: string;
  description: string;
  dateEvenement: string; // LocalDateTime format 'yyyy-MM-dd HH:mm:ss'
  imageUrl?: string;
  dateCreation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvenementService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/evenements`;

  /**
   * Récupère les événements à venir
   */
  getUpcoming(): Observable<Evenement[]> {
    return this.http.get<Evenement[]>(`${this.apiUrl}/upcoming`);
  }

  /**
   * Récupère les événements pour une mosquée spécifique
   */
  getByMosquee(mosqueeId: string): Observable<Evenement[]> {
    return this.http.get<Evenement[]>(`${this.apiUrl}/mosquee/${mosqueeId}`);
  }

  /**
   * Crée un événement pour une mosquée avec une image optionnelle
   */
  create(
    titre: string,
    description: string,
    dateEvenement: string,
    mosqueeId: string,
    image?: File
  ): Observable<Evenement> {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('description', description);
    formData.append('dateEvenement', dateEvenement);
    
    if (mosqueeId) {
      formData.append('mosqueeId', mosqueeId);
    }
    
    if (image) {
      formData.append('image', image, image.name);
    }

    return this.http.post<Evenement>(this.apiUrl, formData);
  }

  /**
   * Supprime un événement par son ID
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
