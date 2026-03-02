import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, PublicUser } from '../../../core/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  private readonly authService = inject(AuthService);
  
  // State management using Signals
  readonly users = signal<PublicUser[]>([]);
  readonly isLoading = signal(false);
  readonly currentUser = this.authService.currentUser;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.authService.getAllUsers().subscribe({
      next: (users: PublicUser[]) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.isLoading.set(false);
        alert('Failed to load users. Verify you have administrator permissions.');
      }
    });
  }

  toggleRole(user: PublicUser): void {
    if (!user.id) return;
    
    // Logic: If they are admin, change to user. If user, change to admin.
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    
    this.authService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        this.loadUsers(); // Refresh the table
      },
      error: (err) => alert(err.error?.message || 'Error updating role')
    });
  }

  deleteUser(userId?: number): void {
    if (!userId) return;

    if (confirm('Are you sure? This user will be permanently removed from the system.')) {
      this.authService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers(); // Refresh the table
        },
        error: (err) => alert(err.error?.message || 'Error deleting user')
      });
    }
  }
}