import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';

/**
 * Interface représentant la réponse du serveur après une tentative de connexion.
 */
interface AuthResponse {
  token: string;
  email: string;
  role: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Injection du client HTTP pour effectuer des requêtes vers l'API
  private http = inject(HttpClient);
  
  // URL de base pour les points de terminaison liés à l'authentification
  private apiUrl = `${environment.apiUrl}/auth`;

  /**
   * Tente de connecter l'utilisateur avec son email et son mot de passe.
   * Si la connexion réussit et que l'utilisateur est un ADMIN, le token et les infos sont stockés.
   * 
   * @param email L'adresse email de l'utilisateur
   * @param motDePasse Le mot de passe de l'utilisateur
   * @returns Un Observable contenant la réponse d'authentification
   */
  login(email: string, motDePasse: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, motDePasse })
      .pipe(
        tap(response => {
          // Vérification si le token est présent et si l'utilisateur possède le rôle ADMIN
          if (response.token && response.role === 'ADMIN') {
            // Stockage du token JWT dans le localStorage pour maintenir la session
            localStorage.setItem('ika_token', response.token);
            // Stockage des informations utilisateur de base
            localStorage.setItem('ika_user', JSON.stringify({ email: response.email, role: response.role }));
          } else if (response.role !== 'ADMIN') {
            // Si l'utilisateur n'est pas ADMIN, on lève une erreur d'accès refusé
            throw new Error('ACCESS_DENIED');
          }
        })
      );
  }

  /**
   * Déconnecte l'utilisateur en supprimant les données de session du stockage local.
   */
  logout(): void {
    localStorage.removeItem('ika_token');
    localStorage.removeItem('ika_user');
  }

  /**
   * Vérifie si un utilisateur est actuellement connecté en vérifiant la présence du token.
   * @returns true si le token existe, false sinon.
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('ika_token');
  }

  /**
   * Récupère le token d'authentification stocké.
   * @returns Le token JWT ou null s'il n'existe pas.
   */
  getToken(): string | null {
    return localStorage.getItem('ika_token');
  }

  /**
   * Récupère les informations de l'utilisateur connecté depuis le localStorage.
   * @returns Un objet contenant les infos utilisateur ou null.
   */
  getUser(): any {
    const user = localStorage.getItem('ika_user');
    return user ? JSON.parse(user) : null;
  }
}
