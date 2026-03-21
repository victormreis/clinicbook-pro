import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SpecialtyService } from '../../../core/specialty.service';

@Component({
  selector: 'app-specialty-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './specialty-form.component.html',
  styleUrl: './specialty-form.component.css',
})
export class SpecialtyForm {
  private readonly specialtyService = inject(SpecialtyService);
  private readonly router = inject(Router);

  name = signal('');
  description = signal('')
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.name().trim()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const payload = {
      name: this.name(),
      description: this.description()
    };

    this.specialtyService.createSpecialty(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/specialties']);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to create specialty. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }
}
