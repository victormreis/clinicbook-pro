import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Added for direct fetch
import { DoctorService, Doctor } from '../../../core/doctor.service';
import { SpecialtyService, Specialty } from '../../../core/specialty.service';
import { environment } from '../../../../environments/environment';

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
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  // State
  specialties = signal<Specialty[]>([]);
  isEditMode = signal<boolean>(false);
  doctorId: number | null = null;
  errorMessage = signal<string | null>(null);

  // Form Fields
  name = '';
  email = '';
  selectedSpecialtyId: number | null = null;
  consultationDuration = 30;

  ngOnInit(): void {
    // 1. Load specialties for the dropdown
    this.specialtyService.getAllSpecialties().subscribe({
      next: (data) => this.specialties.set(data),
      error: () => this.errorMessage.set('Could not load specialties.')
    });

    // 2. Check for Edit Mode (US-10)
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.doctorId = Number(idParam);
      this.loadDoctorData(this.doctorId);
    }
  }

  private loadDoctorData(id: number): void {
    const token = localStorage.getItem('clinicbook_token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // Calling the backend directly since getDoctorById isn't in your service yet
    this.http.get<Doctor>(`${environment.apiUrl}/doctors/${id}`, { headers }).subscribe({
      next: (doc) => {
        this.name = doc.name;
        this.email = doc.email;
        this.selectedSpecialtyId = doc.specialtyId;
        this.consultationDuration = doc.consultationDuration;
      },
      error: () => this.errorMessage.set('Could not load doctor details.')
    });
  }

  onSubmit(): void {
    if (!this.selectedSpecialtyId) {
      this.errorMessage.set('Please select a specialty.');
      return;
    }

    const doctorData: Doctor = {
      name: this.name,
      email: this.email,
      specialtyId: this.selectedSpecialtyId,
      consultationDuration: this.consultationDuration
    };

    if (this.isEditMode() && this.doctorId) {
      // US-10: Update existing doctor
      this.doctorService.updateDoctor(this.doctorId, doctorData).subscribe({
        next: () => this.router.navigate(['/specialties', this.selectedSpecialtyId, 'doctors']),
        error: (err: any) => this.errorMessage.set(err.error?.message || 'Update failed.')
      });
    } else {
      // US-09: Create new doctor
      this.doctorService.createDoctor(doctorData).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err: any) => this.errorMessage.set(err.error?.message || 'Failed to add doctor.')
      });
    }
  }
}