import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RadioService, Radio } from '../../services/radio';
import { FileUploadService } from '../../services/file-upload';

@Component({
  selector: 'app-radios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './radios.html',
  styleUrls: ['./radios.css']
})
export class RadiosComponent implements OnInit {
  private radioService = inject(RadioService);
  private fileUploadService = inject(FileUploadService);
  private fb = inject(FormBuilder);

  radios: Radio[] = [];
  isLoading = true;
  errorMessage = '';
  showForm = false;
  isSaving = false;
  selectedLogo: File | null = null;
  logoPreviewUrl: string | null = null;
  radioForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadRadios();
  }

  private initForm(): void {
    this.radioForm = this.fb.group({
      nom: ['', Validators.required],
      urlStream: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  loadRadios(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.radioService.getAll().subscribe({
      next: (data) => {
        this.radios = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Impossible de charger les radios.';
        this.isLoading = false;
      }
    });
  }

  toggleForm(): void {
  // Seul le superAdmin peut ouvrir le formulaire
  if (!this.isSuperAdmin()) return;
  this.showForm = !this.showForm;
  if (!this.showForm) {
    this.resetForm();
  }
}

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedLogo = file;
    const reader = new FileReader();
    reader.onload = () => (this.logoPreviewUrl = reader.result as string);
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.selectedLogo = null;
    this.logoPreviewUrl = null;
  }

  getLogoUrl(path: string | undefined): string {
    return this.fileUploadService.getImageUrl(path ?? '');
  }

  onSubmit(): void {
    if(!this.isSuperAdmin()) return;

    if (this.radioForm.invalid) return;

    this.isSaving = true;
    const { nom, urlStream } = this.radioForm.value;

    this.radioService
      .create({
        nom: nom!,
        urlStream: urlStream!,
        logo: this.selectedLogo ?? undefined
      })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.toggleForm();
          this.loadRadios();
        },
        error: (err) => {
          console.error(err);
          this.isSaving = false;
          alert('Erreur lors de la création de la radio.');
        }
      });
  }

  onDelete(id: string): void {
    if(!this.isSuperAdmin()) return;


    if (!confirm('Supprimer cette radio ?')) return;
    this.radioService.delete(id).subscribe({
      next: () => {
        this.radios = this.radios.filter((r) => r.id !== id);
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la suppression.');
      }
    });
  }

  private resetForm(): void {
    this.radioForm.reset();
    this.removeLogo();
  }

  isSuperAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const ikaUser = JSON.parse(localStorage.getItem('ika_user') || '{}');
    return user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'SUPER_ADMIN' ||
           ikaUser?.role === 'ROLE_SUPER_ADMIN' || ikaUser?.role === 'SUPER_ADMIN';
  }
}
