import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

/**
 * Interface représentant un utilisateur du système Ikadeen.
 */
export interface User {
  id: string;
  email: string;
  telephone?: string;
  role: 'ADMIN' | 'UTILISATEUR';
  estActif: boolean;
  estVerifie: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/utilisateurs`;

  /**
   * Récupère tous les utilisateurs du système.
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Active ou désactive un utilisateur.
   * Note : Selon les instructions, cela ne devrait s'appliquer qu'aux non-admins.
   */
  updateStatus(id: string, status: boolean): Observable<any> {
    // Le backend attend un paramètre de requête nommé 'active'
    return this.http.put(`${this.apiUrl}/${id}/status?active=${status}`, {});
  }

  /**
   * Supprime définitivement un utilisateur.
   */
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
