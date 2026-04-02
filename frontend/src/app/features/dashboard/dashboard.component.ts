import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly firstName = this.authService.userFirstName;
  readonly isSubmitting = signal(false);
  
  // New: Signal to track the real-time user count from the database
  readonly totalUserCount = signal<number>(0);

  ngOnInit(): void {
    this.refreshMetrics();
  }

  private refreshMetrics(): void {
    // Fetches live user data using existing admin permissions
    if (this.currentUser()?.role === 'admin') {
      this.authService.getAllUsers().subscribe({
        next: (users) => this.totalUserCount.set(users.length),
        error: (err) => console.error('Failed to load dashboard metrics', err)
      });
    }
  }

  readonly dashboardStats = computed(() => {
    const user = this.currentUser();
    if (user?.role === 'admin') {
      return [
        { label: 'Registered Users', value: this.totalUserCount().toString(), icon: '👥' },
        { label: 'System Status', value: 'Online', icon: '⚡' }
      ];
    }
    return [
      { label: 'My Appointments', value: 'View All', icon: '📅' },
      { label: 'Profile Status', value: 'Active', icon: '✅' }
    ];
  });

  logout(): void {
    this.isSubmitting.set(true);
    this.authService.logout().subscribe(() => {
      this.isSubmitting.set(false);
      void this.router.navigateByUrl('/login');
    });
  }
}