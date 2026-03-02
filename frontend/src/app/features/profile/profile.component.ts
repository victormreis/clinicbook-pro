import { Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css' 
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);

  readonly isSubmitting = signal(false);
  readonly currentUser = this.authService.currentUser;

  profileForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: [''] 
  });

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name || '',
        email: user.email
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isSubmitting.set(true);
      const payload = this.profileForm.getRawValue();

      this.authService.updateProfile(payload).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          alert(res.message);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          alert(err.error?.message || 'Update failed');
        }
      });
    }
  }
}