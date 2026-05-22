import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable, catchError, of } from 'rxjs';
import { UserService } from './user';
import { MosqueeService } from './mosquee';
import { PubliciteService } from './publicite';
import { RadioService } from './radio';

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  totalMosquees: number;
  totalPublicites: number;
  totalRadios: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminStatsService {
  private userService = inject(UserService);
  private mosqueeService = inject(MosqueeService);
  private publiciteService = inject(PubliciteService);
  private radioService = inject(RadioService);

  /**
   * Agrège les statistiques à partir des endpoints déjà disponibles.
   * Remplaçable par GET /api/v1/admin/stats quand le backend l'exposera.
   */
  getPlatformStats(): Observable<PlatformStats> {
    return forkJoin({
      users: this.userService.getUsers().pipe(catchError(() => of([]))),
      mosquees: this.mosqueeService.getAll().pipe(catchError(() => of([]))),
      publicites: this.publiciteService.getActive().pipe(catchError(() => of([]))),
      radios: this.radioService.getAll().pipe(catchError(() => of([])))
    }).pipe(
      map(({ users, mosquees, publicites, radios }) => ({
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.estActif).length,
        inactiveUsers: users.filter((u) => !u.estActif).length,
        adminUsers: users.filter((u) => u.role === 'ADMIN').length,
        totalMosquees: mosquees.length,
        totalPublicites: publicites.length,
        totalRadios: radios.length
      }))
    );
  }
}
