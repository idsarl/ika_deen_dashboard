import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

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
    // Fournisseur pour les requêtes HTTP
    provideHttpClient()
  ]
};
