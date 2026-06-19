import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // pour [(ngModel)]
import { RouterModule } from '@angular/router';
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

  validations: ValidationPendingResponse[] = [];
  isLoading = true;
  errorMessage = '';

  // Gestion du rejet
  showRejectInputFor: string | null = null; // id de la validation concernée
  rejectMotif = '';

  ngOnInit(): void {
    this.loadPending();
  }

  // Vérification du rôle SUPER_ADMIN (exactement comme dans les autres composants)
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

  // Affichage du contenu (adaptez selon vos types)
  getContenuText(contenu: any): string {
    if (!contenu) return 'Contenu vide';
    if (typeof contenu === 'string') return contenu;
    try {
      return JSON.stringify(contenu, null, 2);
    } catch {
      return 'Contenu non affichable';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}