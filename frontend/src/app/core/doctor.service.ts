import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Specialty {
  id: number;
  name: string;
}

export interface Doctor {
  id: number;
  name: string;
  email: string;
  specialtyId?: number;
  specialty?: Specialty;
}

export interface DoctorPayload {
  name: string;
  email: string;
  specialtyId: number;
}

interface SpecialtyActionResponse {
  message: string;
  specialty: Specialty;
}

interface DoctorActionResponse {
  message: string;
  doctor: Doctor;
}

interface DeleteDoctorResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly doctorsApiUrl = `${environment.apiUrl}/doctors`;
  private readonly specialtiesApiUrl = `${environment.apiUrl}/specialties`;

  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(this.doctorsApiUrl, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getAllSpecialties(): Observable<Specialty[]> {
    return this.http.get<Specialty[]>(this.specialtiesApiUrl, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getAvailableTimes(doctorId: number, date: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.doctorsApiUrl}/${doctorId}/available-times`, {
      headers: this.authService.getAuthHeaders(),
      params: { date }
    });
  }

  createSpecialty(name: string): Observable<SpecialtyActionResponse> {
    return this.http.post<SpecialtyActionResponse>(
      this.specialtiesApiUrl,
      { name },
      { headers: this.authService.getAuthHeaders() }
    );
  }

  createDoctor(payload: DoctorPayload): Observable<DoctorActionResponse> {
    return this.http.post<DoctorActionResponse>(this.doctorsApiUrl, payload, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateDoctor(doctorId: number, payload: DoctorPayload): Observable<DoctorActionResponse> {
    return this.http.put<DoctorActionResponse>(`${this.doctorsApiUrl}/${doctorId}`, payload, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteDoctor(doctorId: number): Observable<DeleteDoctorResponse> {
    return this.http.delete<DeleteDoctorResponse>(`${this.doctorsApiUrl}/${doctorId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
