import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

// Définition des types de thèmes disponibles pour l'application
type Theme = 'normal' | 'dark' | 'light';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  // Injection des services nécessaires
  private authService = inject(AuthService);
  private router = inject(Router);

  // Informations de l'utilisateur connecté
  user: any;


  // Thème actuel de l'application
  currentTheme: Theme = 'normal';

  
  // État d'extension de la barre latérale (sidebar)
  isExpanded = true;

  /**
   * Initialisation du composant.
   * Récupère l'utilisateur et restaure le thème sauvegardé.
   */
  ngOnInit() {
    this.user = this.authService.getUser();
    const savedTheme = localStorage.getItem('ika_theme') as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }

  /**
   * Change le thème visuel de l'application.
   * @param theme Le nom du thème à appliquer ('normal', 'dark' ou 'light')
   */
  setTheme(theme: Theme) {
    this.currentTheme = theme;
    // Applique l'attribut data-theme au body pour le styling CSS global
    document.body.setAttribute('data-theme', theme);
    // Sauvegarde le choix de l'utilisateur
    localStorage.setItem('ika_theme', theme);
  }

  /**
   * Alterne l'état (ouvert/fermé) de la barre latérale.
   */
  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Gère la déconnexion de l'utilisateur et redirige vers la page de login.
   */
  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
