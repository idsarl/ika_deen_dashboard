import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { HorairesService, HorairesVille } from '../../services/HorairesService';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-horaires-priere',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './horaires-priere.html',
  styleUrl: './horaires-priere.css',
})
export class HorairesPriere implements OnInit {
  private horairesService = inject(HorairesService);

  horairesList = signal<HorairesVille[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.chargerTousLesHoraires();
  }

  // ----- Méthode de contrôle d'accès (copiée de MosqueesComponent) -----
  isSuperAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const ikaUser = JSON.parse(localStorage.getItem('ika_user') || '{}');
    return user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'SUPER_ADMIN' ||
           ikaUser?.role === 'ROLE_SUPER_ADMIN' || ikaUser?.role === 'SUPER_ADMIN';
  }

  // ----- Géolocalisation (inchangée) -----
  obtenirPosition() {
    if (!navigator.geolocation) {
      this.errorMessage.set('La géolocalisation n\'est pas supportée par votre navigateur.');
      this.loading.set(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.chargerHoraires(latitude, longitude);
      },
      () => {
        this.errorMessage.set('Impossible d\'obtenir votre position.');
        this.loading.set(false);
      }
    );
  }

  chargerHoraires(lat: number, lon: number) {
    this.horairesService.getByGeolocalisation(lat, lon).subscribe({
      next: (data) => {
        this.horairesList.set([data]);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors du chargement des horaires.');
        this.loading.set(false);
      }
    });
  }

  chargerTousLesHoraires() {
    this.loading.set(true);
    this.horairesService.getAll().subscribe({
      next: (data) => {
        this.horairesList.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors du chargement des horaires.');
        this.loading.set(false);
      }
    });
  }

  // ----- Suppression (implémentée) -----
  deleteHoraires(nomVille: string) {
    
    
  }

  // ----- Ville courante (à adapter selon votre logique) -----
  isCurrentCity(nomVille: string): boolean {
    // Exemple : comparer avec une ville stockée dans localStorage
    // return localStorage.getItem('currentCity') === nomVille;
    return false;
  }
}