import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

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

  ngOnInit(): void {
    // Logic removed for simplicity as requested
  }

  logout(): void {
    this.isSubmitting.set(true);
    this.authService.logout().subscribe(() => {
      this.isSubmitting.set(false);
      void this.router.navigateByUrl('/login');
    });
  }
}