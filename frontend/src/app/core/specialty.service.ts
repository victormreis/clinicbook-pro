import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Specialty {
  id?: number;
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class SpecialtyService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/specialties`;

  // Helper to get headers with the token
  private getHeaders() {
    const token = localStorage.getItem('clinicbook_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  createSpecialty(specialty: Specialty): Observable<{ message: string; specialty: Specialty }> {
    return this.http.post<{ message: string; specialty: Specialty }>(
      this.apiUrl, 
      specialty, 
      { headers: this.getHeaders() }
    );
  }

  getAllSpecialties(): Observable<Specialty[]> {
    return this.http.get<Specialty[]>(this.apiUrl, { headers: this.getHeaders() });
  }
}