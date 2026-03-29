import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { combineLatest } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  Doctor,
  DoctorPayload,
  DoctorService,
  Specialty
} from '../../../core/doctor.service';

type NoticeTone = 'success' | 'error' | 'info';

@Component({
  selector: 'app-clinic-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './clinic-management.component.html',
  styleUrl: './clinic-management.component.css'
})
export class ClinicManagementComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly doctorService = inject(DoctorService);

  readonly specialties = signal<Specialty[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly isLoading = signal(true);
  readonly isSavingSpecialty = signal(false);
  readonly isSavingDoctor = signal(false);
  readonly deletingDoctorId = signal<number | null>(null);
  readonly editingDoctorId = signal<number | null>(null);
  readonly noticeMessage = signal('');
  readonly noticeTone = signal<NoticeTone>('info');

  readonly doctorCount = computed(() => this.doctors().length);
  readonly specialtyCount = computed(() => this.specialties().length);

  readonly specialtyForm = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.minLength(2)])
  });

  readonly doctorForm = this.fb.group({
    name: this.fb.control('', [Validators.required]),
    email: this.fb.control('', [Validators.required, Validators.email]),
    specialtyId: this.fb.control(0, [Validators.min(1)])
  });

  constructor() {
    this.loadDirectoryData();
  }

  saveSpecialty(): void {
    if (this.specialtyForm.invalid) {
      this.specialtyForm.markAllAsTouched();
      return;
    }

    const name = this.specialtyForm.controls.name.value.trim();
    this.isSavingSpecialty.set(true);

    this.doctorService
      .createSpecialty(name)
      .pipe(
        finalize(() => this.isSavingSpecialty.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.specialtyForm.reset({ name: '' });
          this.setNotice(response.message, 'success');
          this.loadDirectoryData();
        },
        error: (error) => {
          this.setNotice(error.error?.message ?? 'Unable to create the specialty right now.', 'error');
        }
      });
  }

  saveDoctor(): void {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    const payload: DoctorPayload = {
      ...this.doctorForm.getRawValue()
    };
    const editingDoctorId = this.editingDoctorId();

    this.isSavingDoctor.set(true);

    const request$ = editingDoctorId
      ? this.doctorService.updateDoctor(editingDoctorId, payload)
      : this.doctorService.createDoctor(payload);

    request$
      .pipe(
        finalize(() => this.isSavingDoctor.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.resetDoctorForm();
          this.setNotice(response.message, 'success');
          this.loadDirectoryData();
        },
        error: (error) => {
          this.setNotice(error.error?.message ?? 'Unable to save the doctor right now.', 'error');
        }
      });
  }

  editDoctor(doctor: Doctor): void {
    const specialtyId = doctor.specialty?.id ?? doctor.specialtyId ?? 0;

    this.editingDoctorId.set(doctor.id);
    this.doctorForm.setValue({
      name: doctor.name,
      email: doctor.email,
      specialtyId
    });
  }

  removeDoctor(doctor: Doctor): void {
    if (!confirm(`Remove ${doctor.name} from the clinic directory?`)) {
      return;
    }

    this.deletingDoctorId.set(doctor.id);

    this.doctorService
      .deleteDoctor(doctor.id)
      .pipe(
        finalize(() => this.deletingDoctorId.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          if (this.editingDoctorId() === doctor.id) {
            this.resetDoctorForm();
          }

          this.setNotice(response.message, 'success');
          this.loadDirectoryData();
        },
        error: (error) => {
          this.setNotice(error.error?.message ?? 'Unable to remove the doctor right now.', 'error');
        }
      });
  }

  cancelEditing(): void {
    this.resetDoctorForm();
  }

  trackById(_: number, item: Doctor | Specialty): number {
    return item.id;
  }

  private loadDirectoryData(): void {
    this.isLoading.set(true);

    combineLatest([
      this.doctorService.getAllSpecialties(),
      this.doctorService.getAllDoctors()
    ])
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ([specialties, doctors]) => {
          this.specialties.set(specialties);
          this.doctors.set(doctors);
        },
        error: () => {
          this.setNotice('Unable to load clinic management data right now.', 'error');
        }
      });
  }

  private resetDoctorForm(): void {
    this.editingDoctorId.set(null);
    this.doctorForm.reset({
      name: '',
      email: '',
      specialtyId: 0
    });
  }

  private setNotice(message: string, tone: NoticeTone): void {
    this.noticeMessage.set(message);
    this.noticeTone.set(tone);
  }
}
