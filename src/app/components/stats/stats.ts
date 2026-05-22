import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminStatsService, PlatformStats } from '../../services/admin-stats';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stats.html',
  styleUrls: ['./stats.css']
})
export class StatsComponent implements OnInit {
  private adminStatsService = inject(AdminStatsService);

  stats: PlatformStats | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminStatsService.getPlatformStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les statistiques.';
        this.isLoading = false;
      }
    });
  }

  get activeUserRate(): number {
    if (!this.stats || this.stats.totalUsers === 0) return 0;
    return Math.round((this.stats.activeUsers / this.stats.totalUsers) * 100);
  }
}
