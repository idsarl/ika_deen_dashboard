import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Squelette du module Validation (S4).
 * Brancher sur l'API dès que les endpoints admin/validations seront disponibles.
 */
@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './validation.html',
  styleUrls: ['./validation.css']
})
export class ValidationComponent {
  readonly requiredEndpoints = [
    'GET  /api/v1/admin/validations/pending',
    'GET  /api/v1/admin/validations/{id}',
    'POST /api/v1/admin/validations/{id}/approve',
    'POST /api/v1/admin/validations/{id}/reject'
  ];
}
