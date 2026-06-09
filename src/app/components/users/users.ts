import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../services/user';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);

  users: User[] = [];
  isLoading = true;
  errorMessage = '';
  selectedUser: User | null = null;

  ngOnInit(): void {
    this.loadUsers();
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
   * Uniquement pour les utilisateurs qui ne sont pas SUPER_ADMIN.
   */
  toggleStatus(user: User): void {
    if (user.role === 'SUPER_ADMIN') return;

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
