import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface AppointmentDoctorSummary {
  id: number;
  name: string;
}

export interface Appointment {
  id: number;
  doctorId: number;
  userId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'cancelled';
  doctor?: AppointmentDoctorSummary;
}

export interface AppointmentActionResponse {
  message: string;
}

interface CreateAppointmentPayload {
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
}

interface CreateAppointmentResponse extends AppointmentActionResponse {
  appointment: Appointment;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly appointmentsApiUrl = `${environment.apiUrl}/appointments`;

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.appointmentsApiUrl}/my`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  bookAppointment(payload: CreateAppointmentPayload): Observable<CreateAppointmentResponse> {
    return this.http.post<CreateAppointmentResponse>(this.appointmentsApiUrl, payload, {
      headers: this.authService.getAuthHeaders()
    });
  }

  cancelAppointment(appointmentId: number): Observable<AppointmentActionResponse> {
    return this.http.put<AppointmentActionResponse>(
      `${this.appointmentsApiUrl}/${appointmentId}/cancel`,
      {},
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }
}
