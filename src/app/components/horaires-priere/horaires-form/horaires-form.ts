import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HorairesService, HorairesVille } from '../../../services/HorairesService';

@Component({
  selector: 'app-horaires-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './horaires-form.html',
  styleUrl: './horaires-form.css'
})
export class HorairesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(HorairesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  horaireForm: FormGroup;
  isEditMode = false;
  isSaving = false;
  // On stocke le nom de la ville car votre méthode modifier() l'utilise comme identifiant
  villeToEdit: string | null = null;

  constructor() {
    this.horaireForm = this.fb.group({
      nomVille: ['', Validators.required],
      fajr: ['', Validators.required],
      dhuhr: ['', Validators.required],
      asr: ['', Validators.required],
      maghrib: ['', Validators.required],
      isha: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Si on passe le nom de la ville dans l'URL pour éditer
    this.villeToEdit = this.route.snapshot.paramMap.get('nomVille');
    
    if (this.villeToEdit) {
      this.isEditMode = true;
      this.loadHorairesData(this.villeToEdit);
    }
  }

  private loadHorairesData(ville: string) {
    this.service.getByVille(ville).subscribe({
      next: (data) => this.horaireForm.patchValue(data),
      error: () => {
        alert('Erreur lors du chargement.');
        this.router.navigate(['/dashboard/horaires-priere']);
      }
    });
  }

  onSubmit() {
    if (this.horaireForm.invalid) return;

    this.isSaving = true;
    const data: HorairesVille = this.horaireForm.value;

    if (this.isEditMode) {
      // Utilisation de votre méthode modifier(ville, horaires)
      this.service.modifier(this.villeToEdit!, data).subscribe({
        next: () => this.onSuccess(),
        error: () => this.isSaving = false
      });
    } else {
      // Utilisation de votre méthode configurer(horaires)
      this.service.configurer(data).subscribe({
        next: () => this.onSuccess(),
        error: () => this.isSaving = false
      });
    }
  }

  private onSuccess() {
    this.isSaving = false;
    this.router.navigate(['/dashboard/horaires-priere']);
  }
}