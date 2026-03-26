import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorService, Doctor } from '../../../core/doctor.service';
import { SpecialtyService, Specialty } from '../../../core/specialty.service';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-form.component.html',
  styleUrl: './doctor-form.component.css'
})
export class DoctorFormComponent implements OnInit {
  private doctorService = inject(DoctorService);
  private specialtyService = inject(SpecialtyService);
  private router = inject(Router);

  specialties = signal<Specialty[]>([]);
  firstName = '';
  lastName = '';
  email = '';
  selectedSpecialtyId: number | null = null;
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.specialtyService.getAllSpecialties().subscribe({
      next: (data) => this.specialties.set(data),
      error: () => this.errorMessage.set('Could not load specialties.')
    });
  }

  onSubmit() {
    if (!this.selectedSpecialtyId) return;

    const newDoctor: Doctor = {
      name: `${this.firstName} ${this.lastName}`,
      email: this.email,
      specialtyId: this.selectedSpecialtyId,
      consultationDuration: 30 // Default duration, can be made dynamic later
    };

    this.doctorService.createDoctor(newDoctor).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => this.errorMessage.set(err.error?.message || 'Error creating doctor.')
    });
  }
}