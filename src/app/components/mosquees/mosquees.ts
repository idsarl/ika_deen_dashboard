import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MosqueeService, Mosquee } from '../../services/mosquee';

@Component({
  selector: 'app-mosquees',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mosquees.html',
  styleUrls: ['./mosquees.css']
})
export class MosqueesComponent implements OnInit {
  private mosqueeService = inject(MosqueeService);

  mosquees: Mosquee[] = [];
  isLoading = true;
  errorMessage = '';
  selectedMosquee: Mosquee | null = null;

  ngOnInit(): void {
    this.loadMosquees();
  }

  viewDetails(mosquee: Mosquee): void {
    this.selectedMosquee = mosquee;
  }

  closeModal(): void {
    this.selectedMosquee = null;
  }

  loadMosquees(): void {
    this.isLoading = true;
    this.mosqueeService.getAll().subscribe({
      next: (data) => {
        this.mosquees = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger les mosquées.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onDelete(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer cette mosquée ?')) {
      this.mosqueeService.delete(id).subscribe({
        next: () => {
          this.mosquees = this.mosquees.filter(m => m.id !== id);
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          alert('Erreur lors de la suppression.');
        }
      });
    }
  }

  // Utilitaire pour obtenir le nom selon la langue (priorité FR, sinon AR)
  getNom(mosquee: Mosquee): string {
    return mosquee.nom['fr'] || mosquee.nom['ar'] || 'Sans nom';
  }
}
