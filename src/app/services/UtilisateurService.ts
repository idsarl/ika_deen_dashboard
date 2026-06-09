import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Utilisateur {
  id: string;
  email: string;
  telephone?: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private http = inject(HttpClient);
  // Assurez-vous que cette URL correspond à votre contrôleur backend
  private apiUrl = `${environment.apiUrl}/admin/utilisateurs`;

  /**
   * Récupère la liste de tous les administrateurs
   */
  getAdmins(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.apiUrl).pipe(
      map((utilisateurs: Utilisateur[]) => 
        // On filtre ici : on ne garde que les objets ayant le rôle ADMIN
        utilisateurs.filter(u => u.role === 'ADMIN')
      )
    );
  }
}