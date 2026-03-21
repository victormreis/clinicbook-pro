import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { DoctorService, Doctor } from "../../core/doctor.service";

@Component({
    selector: "app-doctor-by-specialty",
    imports: [CommonModule, RouterModule],
    template: './doctor-by-specialty.component.html',
    styleUrl: './doctor-by-specialty.component.css'
})

export class DoctorBySpecialtyComponent implements OnInit {
  private readonly route = inject(DoctorService);
  private readonly doctorService = inject(DoctorService);

  readonly doctors = signal<Doctor[]>([]);
  readonly isLoading = signal(true);
  readonly specialtyName = signal<string>("Specialty");

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (id) {
      this.doctorService.getDoctorsBySpeciality(id).subscribe({
        next: (data) => {
          this.doctors.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error("Error fetching doctors:", err);
          this.isLoading.set(false);
        }
      });
    }
  }
}