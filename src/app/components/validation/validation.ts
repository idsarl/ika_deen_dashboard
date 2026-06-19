import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MosqueeService, Mosquee } from '../../services/mosquee';
import { ValidationPendingResponse, ValidationService } from '../../services/Validation';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './validation.html',
  styleUrls: ['./validation.css']
})
export class ValidationComponent implements OnInit {
  private validationService = inject(ValidationService);
  private mosqueeService = inject(MosqueeService);

  validations: ValidationPendingResponse[] = [];
  isLoading = true;
  errorMessage = '';

  showRejectInputFor: string | null = null;
  rejectMotif = '';

  // Cache pour les mosquées chargées
  private mosqueeCache = new Map<string, Mosquee | null>();

  ngOnInit(): void {
    this.loadPending();
  }

  isSuperAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const ikaUser = JSON.parse(localStorage.getItem('ika_user') || '{}');
    return user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'SUPER_ADMIN' ||
           ikaUser?.role === 'ROLE_SUPER_ADMIN' || ikaUser?.role === 'SUPER_ADMIN';
  }

  loadPending(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.validationService.getPending().subscribe({
      next: (data) => {
        this.validations = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Impossible de charger les validations en attente.';
        this.isLoading = false;
      }
    });
  }

  onApprove(id: string): void {
    if (!this.isSuperAdmin()) return;
    if (!confirm('Approuver cette validation ?')) return;
    this.validationService.approve(id).subscribe({
      next: () => {
        this.validations = this.validations.filter(v => v.id !== id);
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de l\'approbation.');
      }
    });
  }

  showReject(id: string): void {
    if (!this.isSuperAdmin()) return;
    this.showRejectInputFor = id;
    this.rejectMotif = '';
  }

  cancelReject(): void {
    this.showRejectInputFor = null;
    this.rejectMotif = '';
  }

  submitReject(id: string): void {
    if (!this.isSuperAdmin()) return;
    if (!confirm('Rejeter cette validation ?')) return;
    const motif = this.rejectMotif.trim() || undefined;
    this.validationService.reject(id, motif).subscribe({
      next: () => {
        this.validations = this.validations.filter(v => v.id !== id);
        this.cancelReject();
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors du rejet.');
      }
    });
  }

  // Nettoyer l'ID : enlever les espaces et les points en fin de chaîne
  private cleanId(id: string): string {
    return id.replace(/\.+$/, '').trim();
  }

  // Récupérer le nom de la mosquée à partir de l'ID (avec cache)
  getMosqueeName(mosqueeId: string): string {
    if (!mosqueeId) return 'Mosquée inconnue';
    const clean = this.cleanId(mosqueeId);
    if (this.mosqueeCache.has(clean)) {
      const m = this.mosqueeCache.get(clean);
      return m ? (m.nom['fr'] || m.nom['ar'] || 'Mosquée') : 'Mosquée introuvable';
    }
    // Chargement asynchrone : on lance la requête et on met en cache
    this.mosqueeService.getById(clean).subscribe({
      next: (mosquee) => {
        this.mosqueeCache.set(clean, mosquee);
        // Pas besoin de mettre à jour l'affichage immédiatement car le nom sera affiché plus tard via le cache
        // On pourrait forcer un changement de détection si nécessaire, mais ici on mise sur le cache pour les prochains rendus.
        // Pour un affichage immédiat, on pourrait utiliser un signal ou un observable, mais pour simplifier on attend le prochain cycle.
        // Comme le nom est affiché dans le template, on peut déclencher un changement de détection manuel si besoin.
        // Ici, on va simplement utiliser un setter pour mettre à jour une propriété ou utiliser une approche réactive.
        // Pour rester simple, on va retourner 'Chargement...' le temps du chargement, puis le cache sera utilisé au prochain rendu.
      },
      error: (err) => {
        console.error(`Erreur chargement mosquée ${clean}`, err);
        this.mosqueeCache.set(clean, null);
      }
    });
    return 'Chargement...';
  }

  // Obtenir l'objet mosquée (pour l'affichage détaillé) - retourne null si pas encore chargé
  getMosquee(mosqueeId: string): Mosquee | null | undefined {
    if (!mosqueeId) return null;
    const clean = this.cleanId(mosqueeId);
    if (this.mosqueeCache.has(clean)) {
      return this.mosqueeCache.get(clean);
    }
    // Déclencher le chargement
    this.getMosqueeName(mosqueeId);
    return undefined; // en cours de chargement
  }

  // Afficher le contenu selon le type
  getContenuText(contenu: any): string {
    if (!contenu) return 'Contenu vide';
    if (typeof contenu === 'string') return contenu;
    try {
      return JSON.stringify(contenu, null, 2);
    } catch {
      return 'Contenu non affichable';
    }
  }

  // Déterminer si le contenu est un commentaire de mosquée
  isCommentaire(contenu: any): boolean {
    return contenu && typeof contenu === 'object' && 'mosqueeId' in contenu && 'texte' in contenu;
  }

  // Formater la date
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  // Récupérer le nom de la mosquée à partir de l'ID (nettoie le point final)
getMosqueeDisplay(contenu: any): string {
  if (!contenu || !contenu.mosqueeId) return 'Mosquée inconnue';
  const id = contenu.mosqueeId.replace(/\.$/, ''); // retire le point final
  // Si vous avez un cache ou une propriété stockée, utilisez-la
  // Sinon, vous pouvez appeler le service ici (mais attention aux appels multiples)
  // Pour l'instant, on retourne l'ID nettoyé
  return `Mosquée (ID: ${id})`;
  // Idéalement, vous chargerez le nom via un service et le stockerez dans un Map
}
}