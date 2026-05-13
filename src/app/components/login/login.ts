import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // Injection des services nécessaires via la fonction inject()
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Définition du formulaire de connexion avec validations.
   * L'email doit être valide et le mot de passe est obligatoire.
   */
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  // Indicateur de chargement pendant la requête vers l'API
  isLoading = false;


  // Message d'erreur à afficher en cas d'échec de connexion
  errorMessage = '';

  

  /**
   * Gère la soumission du formulaire de connexion.
   * Valide les données, lance l'authentification et gère les redirections ou erreurs.
   * 
   * @param event L'événement de soumission du formulaire
   */
  onSubmit(event: Event) {
    // Empêche le rechargement de la page par défaut du navigateur
    event.preventDefault();
    
    // Si le formulaire n'est pas valide, on arrête le traitement
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    // Appel au service d'authentification
    this.authService.login(email!, password!).subscribe({
      next: () => {
        // Redirection vers le tableau de bord en cas de succès
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        // Gestion personnalisée des messages d'erreur selon le type retourné
        if (err.message === 'ACCESS_DENIED') {
          this.errorMessage = 'Accès refusé. Seul un administrateur peut se connecter ici.';
        } else {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        }
        console.error('Erreur de connexion:', err);
      }
    });
  }
}
