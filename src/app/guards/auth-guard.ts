import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Garde de navigation (Route Guard) pour protéger les routes privées.
 * Vérifie si l'utilisateur est connecté avant d'autoriser l'accès à une route.
 * 
 * @returns true si l'utilisateur est connecté, sinon redirige vers /login et retourne false.
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si l'utilisateur possède un token valide (est connecté)
  if (authService.isLoggedIn()) {
    return true; // Accès autorisé
  }

  // Sinon, redirection vers la page de connexion
  router.navigate(['/login']);
  return false; // Accès refusé
};
