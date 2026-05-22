import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Intercepteur HTTP pour ajouter le token JWT aux requêtes sortantes.
 * Ce middleware intercepte chaque appel API et injecte le header Authorization
 * si un token est présent dans le localStorage.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Si la requête concerne l'authentification (connexion, inscription),
  // on ne doit pas joindre de token d'accès afin d'éviter les erreurs 403 (Forbidden)
  // en cas de présence d'un ancien token expiré dans le localStorage.
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  const token = localStorage.getItem('ika_token');

  // Si un token existe, on clone la requête pour y ajouter le header
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // Sinon on laisse passer la requête telle quelle
  return next(req);
};
