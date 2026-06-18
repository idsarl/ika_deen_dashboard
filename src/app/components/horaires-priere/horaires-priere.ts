import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { HorairesService, HorairesVille } from '../../services/HorairesService';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-horaires-priere',
  standalone: true, // Assurez-vous qu'il est bien standalone
  imports: [CommonModule, RouterLink],
  templateUrl: './horaires-priere.html',
  styleUrl: './horaires-priere.css',
})
export class HorairesPriere implements OnInit {
  private horairesService = inject(HorairesService);
  
  // Utilisation de signaux pour gérer l'état

  horairesList = signal<HorairesVille[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.chargerTousLesHoraires();
  }

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
      (error) => {
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
      error: (err) => {
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
    error: (err) => {
      this.errorMessage.set('Erreur lors du chargement des horaires.');
      this.loading.set(false);
    }
  });
}
deleteHoraires(nomVille: string) {
   // Implémentez ici l'appel à votre service de suppression
}

isCurrentCity(nomVille: string): boolean {
  // À implémenter selon votre logique (par exemple, comparer avec la ville géolocalisée)
  // Pour l'instant, on retourne false par défaut.
  return false;
}
}
