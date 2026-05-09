import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Point d'entrée principal de l'application.
 * Initialise l'application Angular avec le composant racine et la configuration fournie.
 */
bootstrapApplication(App, appConfig)
  .catch((err) => console.error('Erreur lors du démarrage de l\'application:', err));
