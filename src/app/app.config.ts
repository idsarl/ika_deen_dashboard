import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

import { routes } from './app.routes';

/**
 * Configuration globale de l'application Angular.
 * Définit les fournisseurs essentiels comme le routage et le client HTTP.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Optimisation des cycles de détection de changement
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Configuration des routes de l'application
    provideRouter(routes),
    // Intercepteurs HTTP :
    // 1. authInterceptor  → Injecte le token JWT sur toutes les requêtes protégées
    // 2. errorInterceptor → Gère les erreurs 401/403 (token expiré → déconnexion auto)
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
  ]
};
