import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { combineLatest } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  AdminUpdateAppointmentPayload,
  Appointment,
  AppointmentService
} from '../../../core/appointment.service';
import { Doctor, DoctorService } from '../../../core/doctor.service';

type NoticeTone = 'success' | 'error' | 'info';
type AppointmentFilter = 'all' | 'scheduled' | 'completed' | 'cancelled';

@Component({
  selector: 'app-appointments-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './appointments-management.component.html',
  styleUrl: './appointments-management.component.css'
})
export class AppointmentsManagementComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appointmentService = inject(AppointmentService);
  private readonly doctorService = inject(DoctorService);

  readonly appointments = signal<Appointment[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly cancellingAppointmentId = signal<number | null>(null);
  readonly editingAppointmentId = signal<number | null>(null);
  readonly statusFilter = signal<AppointmentFilter>('all');
  readonly doctorFilter = signal(0);
  readonly noticeMessage = signal('');
  readonly noticeTone = signal<NoticeTone>('info');

  readonly appointmentForm = this.fb.group({
    doctorId: this.fb.control(0, [Validators.min(1)]),
    appointmentDate: this.fb.control('', [Validators.required]),
    appointmentTime: this.fb.control('', [Validators.required]),
    status: this.fb.control<'scheduled' | 'completed' | 'cancelled'>('scheduled', [Validators.required])
  });

  readonly filteredAppointments = computed(() =>
    this.appointments().filter((appointment) => {
      const statusFilter = this.statusFilter();
      const doctorFilter = this.doctorFilter();
      const normalizedStatus = appointment.status === 'booked' ? 'scheduled' : appointment.status;

      const statusMatches = statusFilter === 'all' || normalizedStatus === statusFilter;
      const doctorMatches = doctorFilter === 0 || appointment.doctorId === doctorFilter;

      return statusMatches && doctorMatches;
    })
  );

  constructor() {
    this.loadData();
  }

  setStatusFilter(filter: AppointmentFilter): void {
    this.statusFilter.set(filter);
  }

  updateDoctorFilter(doctorId: string): void {
    this.doctorFilter.set(Number(doctorId));
  }

  editAppointment(appointment: Appointment): void {
    this.editingAppointmentId.set(appointment.id);
    this.appointmentForm.setValue({
      doctorId: appointment.doctorId,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime.slice(0, 5),
      status: appointment.status === 'booked' ? 'scheduled' : appointment.status
    });
  }

  saveAppointment(): void {
    const appointmentId = this.editingAppointmentId();

    if (this.appointmentForm.invalid || appointmentId === null) {
      this.appointmentForm.markAllAsTouched();
      return;
    }
    const payload: AdminUpdateAppointmentPayload = {
      ...this.appointmentForm.getRawValue()
    };

    this.isSaving.set(true);

    this.appointmentService
      .adminUpdateAppointment(appointmentId, payload)
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.resetEditing();
          this.setNotice(response.message, 'success');
          this.loadData();
        },
        error: (error) => {
          this.setNotice(error.error?.message ?? 'Unable to update the appointment right now.', 'error');
        }
      });
  }

  cancelAppointment(appointment: Appointment): void {
    this.cancellingAppointmentId.set(appointment.id);

    this.appointmentService
      .adminCancelAppointment(appointment.id)
      .pipe(
        finalize(() => this.cancellingAppointmentId.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          if (this.editingAppointmentId() === appointment.id) {
            this.resetEditing();
          }

          this.setNotice(response.message, 'success');
          this.loadData();
        },
        error: (error) => {
          this.setNotice(error.error?.message ?? 'Unable to cancel the appointment right now.', 'error');
        }
      });
  }

  resetEditing(): void {
    this.editingAppointmentId.set(null);
    this.appointmentForm.reset({
      doctorId: 0,
      appointmentDate: '',
      appointmentTime: '',
      status: 'scheduled'
    });
  }

  clearNotice(): void {
    this.noticeMessage.set('');
  }

  trackById(_: number, item: Appointment | Doctor): number {
    return item.id;
  }

  formatAppointmentDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(`${date}T00:00:00`));
  }

  formatAppointmentTime(time: string): string {
    const [hoursText, minutesText] = time.slice(0, 5).split(':');
    const timestamp = new Date(2000, 0, 1, Number(hoursText), Number(minutesText));

    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    }).format(timestamp);
  }

  private loadData(): void {
    this.isLoading.set(true);

    combineLatest([
      this.appointmentService.getAllAppointmentsForAdmin(),
      this.doctorService.getAllDoctors()
    ])
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ([appointments, doctors]) => {
          this.appointments.set(appointments);
          this.doctors.set(doctors);
        },
        error: () => {
          this.setNotice('Unable to load appointment management data right now.', 'error');
        }
      });
  }

  private setNotice(message: string, tone: NoticeTone): void {
    this.noticeMessage.set(message);
    this.noticeTone.set(tone);
  }
}
