import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  // Check if the user is authenticated and specifically has the 'admin' role
  if (user && user.role === 'admin') {
    return true;
  }

  // If the user is not an admin, redirect them to the dashboard
  return router.parseUrl('/dashboard');
};