import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MosqueeService, Mosquee } from '../../services/mosquee';
import { EvenementService, Evenement } from '../../services/evenement';

@Component({
  selector: 'app-mosquees',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './mosquees.html',
  styleUrls: ['./mosquees.css']
})
export class MosqueesComponent implements OnInit {
  private mosqueeService = inject(MosqueeService);
  private evenementService = inject(EvenementService);
  private fb = inject(FormBuilder);

  mosquees: Mosquee[] = [];
  isLoading = true;
  errorMessage = '';
  selectedMosquee: Mosquee | null = null;

  // Gestion des événements
  evenements: Evenement[] = [];
  upcomingEvenements: Evenement[] = [];
  pastEvenements: Evenement[] = [];
  activeEventTab: 'upcoming' | 'past' = 'upcoming';
  isLoadingEvents = false;
  showEventForm = false;
  eventForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  isSavingEvent = false;

  ngOnInit(): void {
    this.loadMosquees();
    this.initEventForm();
  }

  isSuperAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Si la clé localStorage est 'ika_user' il faut peut-être utiliser AuthService. 
    // Pour l'instant, on se base sur la logique existante.
    const ikaUser = JSON.parse(localStorage.getItem('ika_user') || '{}');
    return user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'SUPER_ADMIN' || ikaUser?.role === 'ROLE_SUPER_ADMIN' || ikaUser?.role === 'SUPER_ADMIN';
  }

  /**
   * Vérifie si l'utilisateur connecté a le droit de modifier cette mosquée.
   * Droit accordé si ROLE_SUPER_ADMIN ou si l'email correspond.
   */
 canEdit(mosquee: Mosquee): boolean {
  if (this.isSuperAdmin()) return true;
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const ikaUser = JSON.parse(localStorage.getItem('ika_user') || '{}');
  
  const userEmail = user?.email || ikaUser?.email;
  
  // 2. Vérification si l'email de l'admin de la mosquée correspond à l'utilisateur connecté
  return mosquee.adminManager?.email === userEmail && !!userEmail;
}

  private initEventForm(): void {
    this.eventForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      dateEvenement: ['', Validators.required]
    });
  }

  viewDetails(mosquee: Mosquee): void {
    this.selectedMosquee = mosquee;
    this.showEventForm = false;
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.eventForm.reset();
    this.loadEvenements(mosquee.id!);
  }

  closeModal(): void {
    this.selectedMosquee = null;
    this.evenements = [];
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

  loadEvenements(mosqueeId: string): void {
    this.isLoadingEvents = true;
    this.evenementService.getByMosquee(mosqueeId).subscribe({
      next: (data) => {
        this.evenements = data;
        const now = new Date();
        this.upcomingEvenements = data
          .filter(e => new Date(e.dateEvenement) >= now)
          .sort((a, b) => new Date(a.dateEvenement).getTime() - new Date(b.dateEvenement).getTime());
        this.pastEvenements = data
          .filter(e => new Date(e.dateEvenement) < now)
          .sort((a, b) => new Date(b.dateEvenement).getTime() - new Date(a.dateEvenement).getTime());
        this.isLoadingEvents = false;
      },
      error: (err) => {
        console.error('Erreur chargement événements', err);
        this.isLoadingEvents = false;
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

  toggleEventForm(): void {
    this.showEventForm = !this.showEventForm;
    if (!this.showEventForm) {
      this.eventForm.reset();
      this.selectedFile = null;
      this.imagePreviewUrl = null;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  formatDateTime(localDateTimeStr: string): string {
    if (!localDateTimeStr) return '';
    const dateObj = new Date(localDateTimeStr);
    return dateObj.toISOString(); // Format standard attendu par le backend
  }

  onSubmitEvent(): void {
    if (this.eventForm.invalid || !this.selectedMosquee) return;

    this.isSavingEvent = true;
    const { titre, description, dateEvenement } = this.eventForm.value;
    const formattedDate = this.formatDateTime(dateEvenement);

    this.evenementService.create(
      titre,
      description,
      formattedDate,
      this.selectedMosquee.id!,
      this.selectedFile || undefined
    ).subscribe({
      next: () => {
        this.loadEvenements(this.selectedMosquee!.id!);
        this.isSavingEvent = false;
        this.toggleEventForm();
        alert('Événement créé avec succès !');
      },
      error: (err) => {
        console.error('Erreur création événement', err);
        this.isSavingEvent = false;
        alert('Erreur lors de la création de l\'événement.');
      }
    });
  }

  onDeleteEvent(eventId: string): void {
    if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {
      this.evenementService.delete(eventId).subscribe({
        next: () => {
          this.loadEvenements(this.selectedMosquee!.id!);
        },
        error: (err) => {
          console.error('Erreur suppression événement', err);
          alert('Erreur lors de la suppression.');
        }
      });
    }
  }

  getNom(mosquee: Mosquee): string {
    return mosquee.nom['fr'] || mosquee.nom['ar'] || 'Sans nom';
  }

  getImamPhotoUrl(path: string | undefined): string {
    return this.mosqueeService.getImamPhotoUrl(path);
  }
}