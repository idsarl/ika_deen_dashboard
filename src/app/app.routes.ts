import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';

/**
 * Définition des routes de l'application.
 * Mappe les URLs aux composants correspondants.
 */
export const routes: Routes = [
  // Redirection par défaut vers la page de login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // Route pour la page de connexion
  { path: 'login', component: LoginComponent },
  // Route protégée pour le tableau de bord (nécessite d'être connecté)
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  // Redirection pour toutes les autres URLs non définies
  { path: '**', redirectTo: 'login' }
];
