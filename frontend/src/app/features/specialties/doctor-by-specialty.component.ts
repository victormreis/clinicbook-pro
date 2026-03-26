import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DoctorService, Doctor } from '../../core/doctor.service';

@Component({
  selector: 'app-doctor-by-specialty',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctor-by-specialty.component.html',
  styleUrl: './doctor-by-specialty.component.css'
})
export class DoctorBySpecialtyComponent implements OnInit {
  // Injecting dependencies
  private route = inject(ActivatedRoute);
  private doctorService = inject(DoctorService);

  // State management using Signals
  doctors = signal<Doctor[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {

    const idFromRoute = this.route.snapshot.paramMap.get('id') ||
                        this.route.snapshot.paramMap.get('specialtyId'); // Try both 'id' and 'specialtyId' as route parameters

    const specialtyId = Number(idFromRoute);
 
   console.log('Extracted specialty ID from route:', specialtyId); 

    if (!isNaN(specialtyId) && specialtyId > 0) {
    this.fetchDoctors(specialtyId);
   } else {
    this.errorMessage.set('Could not determine the specialty category.');
    this.isLoading.set(false);
    }
  }

  private fetchDoctors(id: number): void {
    this.doctorService.getDoctorsBySpecialty(id).subscribe({
      next: (data) => {
        
        console.log('Doctors received for specialty ' + id + ':', data);
        
        this.doctors.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching doctors:', err);
        this.errorMessage.set('Failed to load doctors. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }
}