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
    path: 'admin/users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/user-list/user-list.component').then((m) => m.UserListComponent),
  },

  {
    path: 'admin/specialties/new',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/specialty-form/specialty-form.component').then((m) => m.SpecialtyForm),
  },

  {
    path: 'specialties',
    canActivate: [authGuard],
    loadComponent: () => import('./features/specialties/specialty-list.component').then((m) => m.SpecialtyListComponent),
  },

  {
    path: 'specialties/:id/doctors',
    canActivate: [authGuard],
    loadComponent: () => import('./features/specialties/doctor-by-specialty.component').then((m) => m.DoctorBySpecialtyComponent),
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
