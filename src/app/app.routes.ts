import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { OverviewComponent } from './components/dashboard/overview';
import { UsersComponent } from './components/users/users';
import { MosqueesComponent } from './components/mosquees/mosquees';
import { MosqueeFormComponent } from './components/mosquees/mosquee-form/mosquee-form';
import { ProfilComponent } from './components/profil/profil';
import { PublicitesComponent } from './components/publicites/publicites';
import { RadiosComponent } from './components/radios/radios';
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
  // Route protégée pour le tableau de bord avec sous-navigation
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'users', component: UsersComponent },
      { path: 'mosquees', component: MosqueesComponent },
      { path: 'mosquees/new', component: MosqueeFormComponent },
      { path: 'mosquees/edit/:id', component: MosqueeFormComponent },
      { path: 'publicites', component: PublicitesComponent },
      { path: 'radios', component: RadiosComponent },
      { path: 'profile', component: ProfilComponent }
    ]
  },
  // Redirection pour toutes les autres URLs non définies
  { path: '**', redirectTo: 'login' }
];
