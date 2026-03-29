import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, finalize, startWith } from 'rxjs/operators';
import {
  Appointment,
  AppointmentService
} from '../../core/appointment.service';
import { Doctor, DoctorService, Specialty } from '../../core/doctor.service';

type NoticeTone = 'success' | 'error' | 'info';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appointmentService = inject(AppointmentService);
  private readonly doctorService = inject(DoctorService);

  readonly today = this.formatDateForInput(new Date());
  readonly specialties = signal<Specialty[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly appointments = signal<Appointment[]>([]);
  readonly availableTimes = signal<string[]>([]);

  readonly isLoadingDirectory = signal(true);
  readonly isLoadingAppointments = signal(true);
  readonly isLoadingTimes = signal(false);
  readonly isBooking = signal(false);
  readonly cancellingAppointmentId = signal<number | null>(null);

  readonly noticeMessage = signal('');
  readonly noticeTone = signal<NoticeTone>('info');

  readonly bookingForm = this.fb.group({
    specialtyId: this.fb.control(0),
    doctorId: this.fb.control(0, [Validators.min(1)]),
    appointmentDate: this.fb.control(this.today, [Validators.required]),
    appointmentTime: this.fb.control('', [Validators.required])
  });

  readonly filteredDoctors = computed(() => {
    const specialtyId = this.bookingForm.controls.specialtyId.value;
    const doctors = this.doctors();

    if (!specialtyId) {
      return doctors;
    }

    return doctors.filter((doctor) => doctor.specialty?.id === specialtyId || doctor.specialtyId === specialtyId);
  });

  readonly upcomingAppointments = computed(() =>
    this.appointments().filter((appointment) => this.isUpcoming(appointment))
  );

  readonly appointmentHistory = computed(() =>
    this.appointments().filter((appointment) => !this.isUpcoming(appointment))
  );

  constructor() {
    this.loadDirectoryData();
    this.loadAppointments();
    this.watchBookingSelections();
    this.watchSpecialtyChanges();
  }

  onBookAppointment(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const { doctorId, appointmentDate, appointmentTime } = this.bookingForm.getRawValue();
    const isTimeStillAvailable = this.availableTimes().includes(appointmentTime);

    if (!isTimeStillAvailable) {
      this.setNotice('That slot is no longer available. Please choose another time.', 'error');
      return;
    }

    this.isBooking.set(true);

    this.appointmentService
      .bookAppointment({
        doctorId,
        appointmentDate,
        appointmentTime
      })
      .pipe(
        finalize(() => this.isBooking.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.setNotice(response.message, 'success');
          this.bookingForm.patchValue({ appointmentTime: '' });
          this.loadAppointments();
          this.loadAvailableTimes(doctorId, appointmentDate);
        },
        error: (error) => {
          this.setNotice(error.error?.message ?? 'Unable to book the appointment right now.', 'error');
          this.loadAvailableTimes(doctorId, appointmentDate);
        }
      });
  }

  cancelAppointment(appointment: Appointment): void {
    if (appointment.status === 'cancelled') {
      return;
    }

    this.cancellingAppointmentId.set(appointment.id);

    this.appointmentService
      .cancelAppointment(appointment.id)
      .pipe(
        finalize(() => this.cancellingAppointmentId.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.setNotice(response.message, 'success');
          this.loadAppointments();

          const selectedDoctorId = this.bookingForm.controls.doctorId.value;
          const selectedDate = this.bookingForm.controls.appointmentDate.value;

          if (selectedDoctorId > 0 && selectedDate) {
            this.loadAvailableTimes(selectedDoctorId, selectedDate);
          }
        },
        error: (error) => {
          this.setNotice(error.error?.message ?? 'Unable to cancel that appointment right now.', 'error');
        }
      });
  }

  clearNotice(): void {
    this.noticeMessage.set('');
  }

  trackById(_: number, item: Doctor | Specialty | Appointment): number {
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
    const hours = Number(hoursText);
    const minutes = Number(minutesText);
    const timestamp = new Date(2000, 0, 1, hours, minutes);

    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    }).format(timestamp);
  }

  private loadDirectoryData(): void {
    this.isLoadingDirectory.set(true);

    combineLatest([
      this.doctorService.getAllSpecialties(),
      this.doctorService.getAllDoctors()
    ])
      .pipe(
        finalize(() => this.isLoadingDirectory.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ([specialties, doctors]) => {
          this.specialties.set(specialties);
          this.doctors.set(doctors);
        },
        error: () => {
          this.setNotice('Unable to load doctors and specialties right now.', 'error');
        }
      });
  }

  private loadAppointments(): void {
    this.isLoadingAppointments.set(true);

    this.appointmentService
      .getMyAppointments()
      .pipe(
        finalize(() => this.isLoadingAppointments.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (appointments) => {
          this.appointments.set(appointments);
        },
        error: () => {
          this.setNotice('Unable to load your appointments right now.', 'error');
        }
      });
  }

  private watchBookingSelections(): void {
    const doctorId$ = this.bookingForm.controls.doctorId.valueChanges.pipe(
      startWith(this.bookingForm.controls.doctorId.value),
      distinctUntilChanged()
    );
    const appointmentDate$ = this.bookingForm.controls.appointmentDate.valueChanges.pipe(
      startWith(this.bookingForm.controls.appointmentDate.value),
      distinctUntilChanged()
    );

    combineLatest([doctorId$, appointmentDate$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([doctorId, appointmentDate]) => {
        this.bookingForm.patchValue({ appointmentTime: '' }, { emitEvent: false });

        if (doctorId > 0 && appointmentDate) {
          this.loadAvailableTimes(doctorId, appointmentDate);
          return;
        }

        this.availableTimes.set([]);
      });
  }

  private watchSpecialtyChanges(): void {
    this.bookingForm.controls.specialtyId.valueChanges
      .pipe(
        startWith(this.bookingForm.controls.specialtyId.value),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        const selectedDoctorId = this.bookingForm.controls.doctorId.value;
        const doctorStillVisible = this.filteredDoctors().some((doctor) => doctor.id === selectedDoctorId);

        if (!doctorStillVisible) {
          this.bookingForm.patchValue(
            {
              doctorId: 0,
              appointmentTime: ''
            },
            { emitEvent: true }
          );
        }
      });
  }

  private loadAvailableTimes(doctorId: number, appointmentDate: string): void {
    this.isLoadingTimes.set(true);

    this.doctorService
      .getAvailableTimes(doctorId, appointmentDate)
      .pipe(
        finalize(() => this.isLoadingTimes.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (times) => {
          this.availableTimes.set(times);

          if (!times.length) {
            this.setNotice('No open slots are left for that doctor on the selected date.', 'info');
          }
        },
        error: (error) => {
          this.availableTimes.set([]);
          this.setNotice(error.error?.message ?? 'Unable to load available times.', 'error');
        }
      });
  }

  private isUpcoming(appointment: Appointment): boolean {
    if (!['scheduled', 'booked'].includes(appointment.status)) {
      return false;
    }

    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    return appointmentDateTime.getTime() >= Date.now();
  }

  private setNotice(message: string, tone: NoticeTone): void {
    this.noticeMessage.set(message);
    this.noticeTone.set(tone);
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
