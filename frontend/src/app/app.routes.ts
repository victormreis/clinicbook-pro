import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guest.guard';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'appointments',
    canActivate: [authGuard],
    loadComponent: () => import('./features/appointments/appointments.component').then((m) => m.AppointmentsComponent)
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/user-list/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'admin/clinic',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/clinic-management/clinic-management.component').then(
        (m) => m.ClinicManagementComponent
      )
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
