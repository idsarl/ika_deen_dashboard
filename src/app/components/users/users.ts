import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User } from '../../services/user';
import { MosqueeService, Mosquee } from '../../services/mosquee';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private mosqueeService = inject(MosqueeService);

  users: User[] = [];
  mosquees: Mosquee[] = [];
  isLoading = true;
  errorMessage = '';
  selectedUser: User | null = null;

  // Création utilisateur
  showCreateForm = false;
  createUserForm!: FormGroup;
  isSaving = false;

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
    this.loadMosquees();
  }

  isSuperAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const ikaUser = JSON.parse(localStorage.getItem('ika_user') || '{}');
    return user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'SUPER_ADMIN' || ikaUser?.role === 'ROLE_SUPER_ADMIN' || ikaUser?.role === 'SUPER_ADMIN';
  }

  private initForm(): void {
    this.createUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', Validators.required],
      telephone: [''],
      role: ['UTILISATEUR', Validators.required],
      estActif: [true],
      estVerifie: [true],
      mosqueeIds: [[]]
    });
  }

  loadMosquees(): void {
    if (this.isSuperAdmin()) {
      this.mosqueeService.getAll().subscribe(data => this.mosquees = data);
    }
  }

  openCreateForm(): void {
    this.createUserForm.reset({
      role: 'UTILISATEUR',
      estActif: true,
      estVerifie: true,
      mosqueeIds: []
    });
    this.showCreateForm = true;
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
  }

  onSubmitCreate(): void {
    if (this.createUserForm.invalid) return;
    this.isSaving = true;
    
    // Convertir les valeurs nulles en indéfini si nécessaire pour le backend
    const payload = this.createUserForm.value;
    if (!payload.mosqueeIds || payload.mosqueeIds.length === 0) {
      delete payload.mosqueeIds;
    }

    this.userService.createUser(payload).subscribe({
      next: (newUser) => {
        this.loadUsers();
        this.closeCreateForm();
        this.isSaving = false;
        alert('Utilisateur créé avec succès !');
      },
      error: (err) => {
        console.error('Erreur création', err);
        alert('Erreur lors de la création : ' + (err.error?.message || 'Vérifiez les données'));
        this.isSaving = false;
      }
    });
  }

  viewUserDetails(user: User): void {
    this.selectedUser = user;
  }

  closeModal(): void {
    this.selectedUser = null;
  }

  /**
   * Charge la liste des utilisateurs depuis le serveur.
   */
  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger les utilisateurs.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  /**
   * Bascule le statut d'un utilisateur (Actif / Inactif).
   * Uniquement pour le super admin.
   */
  toggleStatus(user: User): void {
    if (!this.isSuperAdmin() || user.role === 'SUPER_ADMIN' || user.role === 'ROLE_SUPER_ADMIN') return;

    const newStatus = !user.estActif;
    this.userService.updateStatus(user.id, newStatus).subscribe({
      next: () => {
        user.estActif = newStatus;
      },
      error: (err) => {
        console.error('Erreur lors du changement de statut', err);
        alert('Erreur serveur (500) : Vérifiez que le backend accepte le format de la requête.');
      }
    });
  }

  /**
   * Supprime un utilisateur après confirmation.
   */
  onDeleteUser(id: string): void {
    if (!this.isSuperAdmin()) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
        }
      });
    }
  }
}
