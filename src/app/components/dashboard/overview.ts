import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PriereService, HorairesPriereResponse } from '../../services/priere';
import { ProfilService, Profil } from '../../services/profil';
import { UserService, User } from '../../services/user';
import { MosqueeService, Mosquee } from '../../services/mosquee';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview.html',
  styleUrls: ['../dashboard/dashboard.css']
})
export class OverviewComponent implements OnInit {
  private authService = inject(AuthService);
  private priereService = inject(PriereService);
  private profilService = inject(ProfilService);
  private userService = inject(UserService);
  private mosqueeService = inject(MosqueeService);
  
  user: any;
  profil: Profil | null = null;
  horaires: HorairesPriereResponse | null = null;
  
  // Compteurs dynamiques
  totalUsers: number = 0;
  totalMosquees: number = 0;
  
  // Données pour la recherche globale
  allUsers: User[] = [];
  allMosquees: Mosquee[] = [];
  searchResultUsers: User[] = [];
  searchResultMosquees: Mosquee[] = [];
  
  recentMosquees: Mosquee[] = [];
  filteredMosquees: Mosquee[] = [];
  searchTerm: string = '';
  isSearching: boolean = false;
  
  nextPrayerName: string = '';
  nextPrayerTime: string = '';
  remainingTime: string = '';
  progress: number = 0;

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadData();
    this.loadSystemStats();
  }

  loadSystemStats(): void {
    // Récupération des utilisateurs pour les stats et la recherche
    this.userService.getUsers().subscribe(users => {
      this.totalUsers = users.length;
      this.allUsers = users;
    });

    // Récupération des mosquées pour les stats and la recherche
    this.mosqueeService.getAll().subscribe(mosquees => {
      this.totalMosquees = mosquees.length;
      this.allMosquees = mosquees;
      this.recentMosquees = mosquees.slice(-2).reverse();
      this.filteredMosquees = [...this.recentMosquees];
    });
  }

  onSearch(event: any): void {
    const term = event.target.value.toLowerCase();
    this.searchTerm = term;
    this.isSearching = term.length > 0;

    if (!this.isSearching) {
      this.searchResultUsers = [];
      this.searchResultMosquees = [];
      this.filteredMosquees = [...this.recentMosquees];
      return;
    }

    // Recherche dans les mosquées
    this.searchResultMosquees = this.allMosquees.filter(m => 
      this.getNom(m).toLowerCase().includes(term) ||
      m.adresse.ville.toLowerCase().includes(term)
    );

    // Recherche dans les utilisateurs
    this.searchResultUsers = this.allUsers.filter(u => 
      u.email.toLowerCase().includes(term) ||
      (u.telephone && u.telephone.includes(term))
    );

    // Mise à jour optionnelle du bloc "Dernières Inscriptions"
    this.filteredMosquees = this.searchResultMosquees.slice(0, 2);
  }

  closeSearch(): void {
    this.searchTerm = '';
    this.isSearching = false;
  }

  getNom(m: Mosquee): string {
    return m.nom['fr'] || m.nom['ar'] || 'Sans nom';
  }

  getInitial(m: Mosquee): string {
    const nom = this.getNom(m);
    return nom.charAt(0).toUpperCase();
  }

  loadData(): void {
    this.profilService.getMe().subscribe({
      next: (profil) => {
        this.profil = profil;
        
        // Coordonnées par défaut (Bamako) si non définies
        let lat = 12.6392;
        let lon = -8.0029;

        if (profil.location && profil.location.coordinates && profil.location.coordinates.length === 2) {
          lon = profil.location.coordinates[0];
          lat = profil.location.coordinates[1];
        }

        const methode = profil.reglagesPriere?.methodeCalcul || 'MWL';
        this.loadHoraires(lat, lon, methode);
      },
      error: (err) => {
        console.error('Erreur profil, utilisation des valeurs par défaut', err);
        this.loadHoraires(12.6392, -8.0029, 'MWL'); // Fallback Bamako
      }
    });
  }

  loadHoraires(lat: number, lon: number, methode: string): void {
    this.priereService.getHoraires(lat, lon, methode).subscribe({
      next: (data) => {
        this.horaires = data;
        this.calculateNextPrayer();
      },
      error: (err) => console.error('Erreur horaires', err)
    });
  }

  private calculateNextPrayer(): void {
    if (!this.horaires) return;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: 'Fajr', time: this.horaires.fajr },
      { name: 'Dhuhr', time: this.horaires.dhuhr },
      { name: 'Asr', time: this.horaires.asr },
      { name: 'Maghrib', time: this.horaires.maghrib },
      { name: 'Isha', time: this.horaires.isha }
    ];

    let next = prayers.find(p => {
      const [h, m] = p.time.split(':').map(Number);
      return (h * 60 + m) > currentTime;
    });

    if (!next) next = prayers[0]; // Si toutes sont passées, la prochaine est le Fajr demain

    this.nextPrayerName = next.name;
    this.nextPrayerTime = next.time;

    // Calcul du temps restant (simplifié)
    const [nh, nm] = next.time.split(':').map(Number);
    let diff = (nh * 60 + nm) - currentTime;
    if (diff < 0) diff += 24 * 60; // Cas du lendemain

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    this.remainingTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    // Progrès fictif pour la barre (75% par défaut si pas de calcul précis de l'intervalle)
    this.progress = Math.min(100, Math.max(0, 100 - (diff / 120) * 100)); 
  }
}
