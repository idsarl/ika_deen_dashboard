import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PubliciteService, Publicite } from '../../services/publicite';
import { FileUploadService } from '../../services/file-upload';

@Component({
  selector: 'app-publicites',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './publicites.html',
  styleUrls: ['../radios/radios.css']
})
export class PublicitesComponent implements OnInit {
  private publiciteService = inject(PubliciteService);
  private fileUploadService = inject(FileUploadService);
  private fb = inject(FormBuilder);

  publicites: Publicite[] = [];
  isLoading = true;
  errorMessage = '';
  showForm = false;
  isSaving = false;
  selectedImage: File | null = null;
  imagePreviewUrl: string | null = null;
  publiciteForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadPublicites();
  }

  private initForm(): void {
    this.publiciteForm = this.fb.group({
      lienDestination: [''],
      dateFin: ['']
    });
  }

  loadPublicites(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.publiciteService.getActive().subscribe({
      next: (data) => {
        this.publicites = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Impossible de charger les publicités.';
        this.isLoading = false;
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedImage = file;
    const reader = new FileReader();
    reader.onload = () => (this.imagePreviewUrl = reader.result as string);
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreviewUrl = null;
  }

  getImageUrl(path: string | undefined): string {
    return this.fileUploadService.getImageUrl(path ?? '');
  }

  formatDateTime(localDateTimeStr: string): string {
    if (!localDateTimeStr) return '';
    const dateObj = new Date(localDateTimeStr);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:00`;
  }

  onSubmit(): void {
    if (!this.selectedImage) {
      alert('Veuillez sélectionner une image pour la bannière.');
      return;
    }

    this.isSaving = true;
    const { lienDestination, dateFin } = this.publiciteForm.value;
    const formattedDateFin = dateFin ? this.formatDateTime(dateFin) : undefined;

    this.publiciteService
      .create({
        lienDestination: lienDestination || undefined,
        dateFin: formattedDateFin,
        image: this.selectedImage
      })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.toggleForm();
          this.loadPublicites();
        },
        error: (err) => {
          console.error(err);
          this.isSaving = false;
          alert('Erreur lors de la création de la publicité.');
        }
      });
  }

  onDelete(id: string): void {
    if (!confirm('Supprimer cette publicité ?')) return;
    this.publiciteService.delete(id).subscribe({
      next: () => {
        this.publicites = this.publicites.filter((p) => p.id !== id);
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la suppression.');
      }
    });
  }

  private resetForm(): void {
    this.publiciteForm.reset();
    this.removeImage();
  }
}
