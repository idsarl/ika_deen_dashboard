import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Intercepteur HTTP pour ajouter le token JWT aux requêtes sortantes.
 * Ce middleware intercepte chaque appel API et injecte le header Authorization
 * si un token est présent dans le localStorage.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
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
