import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

/**
 * Service générique pour l'upload de fichiers vers le backend.
 * Compatible avec le FileStorageService Spring Boot qui stocke dans /uploads/
 */
@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  /**
   * Uploade une image pour une mosquée spécifique.
   * Endpoint: POST /api/v1/mosquees/{id}/images
   * @param mosqueeId L'ID de la mosquée
   * @param file Le fichier image à uploader
   * @param principale Si true, cette image sera l'image principale
   */
  uploadMosqueeImage(mosqueeId: string, file: File, principale: boolean = false): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('principale', String(principale));
    return this.http.post<any>(`${this.baseUrl}/mosquees/${mosqueeId}/images`, formData);
  }

  /**
   * Retourne l'URL complète pour accéder à un fichier uploadé.
   * Les fichiers sont servis par Spring Boot à /uploads/images/...
   * Le proxy Angular redirige /uploads vers localhost:8080
   */
  getImageUrl(relativePath: string): string {
    if (!relativePath) return '';
    // Si c'est déjà une URL absolue (http/https), on la retourne telle quelle
    if (relativePath.startsWith('http')) return relativePath;
    // Sinon c'est un chemin relatif style "/uploads/images/uuid.jpg"
    return relativePath;
  }
}
