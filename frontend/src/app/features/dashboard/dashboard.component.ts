import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly isSubmitting = signal(false);

  logout(): void {
    this.isSubmitting.set(true);
    this.authService.logout().subscribe(() => {
      this.isSubmitting.set(false);
      void this.router.navigateByUrl('/login');
    });
  }
}
