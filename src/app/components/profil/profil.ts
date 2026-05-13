import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfilService, Profil, ProfilRequest } from '../../services/profil';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profil.html',
  styleUrls: ['./profil.css']
})
export class ProfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profilService = inject(ProfilService);

  profilForm!: FormGroup;
  profil: Profil | null = null;
  isLoading = true;
  isSaving = false;
  activeTab: 'personal' | 'settings' = 'personal';

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private initForm(): void {
    this.profilForm = this.fb.group({
      nomAffichage: ['', Validators.required],
      avatarUrl: [''],
      dateNaissance: [''],
      genre: [''],
      languePreferee: ['FR'],
      ville: [''],
      pays: [''],
      reglagesPriere: this.fb.group({
        methodeCalcul: ['MWL'],
        asrJuridique: ['Standard']
      }),
      preferencesNotification: this.fb.group({
        rappelsPriere: [true],
        minutesAvantRappel: [15],
        versetQuotidien: [true],
        hadithQuotidien: [true],
        notificationsEvenements: [true]
      })
    });
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profilService.getMe().subscribe({
      next: (data) => {
        this.profil = data;
        this.profilForm.patchValue({
          nomAffichage: data.nomAffichage,
          avatarUrl: data.avatarUrl,
          dateNaissance: data.dateNaissance,
          genre: data.genre,
          languePreferee: data.languePreferee,
          ville: data.ville,
          pays: data.pays,
          reglagesPriere: data.reglagesPriere,
          preferencesNotification: data.preferencesNotification
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur profil', err);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profilForm.invalid) return;

    this.isSaving = true;
    const request: ProfilRequest = this.profilForm.value;

    this.profilService.updateMe(request).subscribe({
      next: (updated) => {
        this.profil = updated;
        this.isSaving = false;
        alert('Profil mis à jour avec succès !');
      },
      error: (err) => {
        console.error('Erreur sauvegarde', err);
        this.isSaving = false;
        alert('Erreur lors de la sauvegarde.');
      }
    });
  }

  switchTab(tab: 'personal' | 'settings'): void {
    this.activeTab = tab;
  }
}
