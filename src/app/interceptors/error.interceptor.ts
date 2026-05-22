import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Intercepteur d'erreurs globales HTTP.
 * Gère les erreurs 401 et 403 dues à un token JWT expiré ou invalide.
 * Redirige automatiquement vers la page de connexion en effaçant la session.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 = Non authentifié / 403 = Accès refusé (souvent token expiré)
      if (error.status === 401 || error.status === 403) {
        // Ne pas boucler sur la page de login elle-même
        if (!req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
          console.warn(`[Ikadeen] Token invalide ou expiré (${error.status}) - Déconnexion automatique.`);
          
          // Nettoyage de la session
          localStorage.removeItem('ika_token');
          localStorage.removeItem('ika_user');
          
          // Redirection vers la page de connexion
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
