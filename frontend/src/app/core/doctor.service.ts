import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

export interface Doctor {
    id?: number;
    name: string;
    email: string;
    specialtyId: number;
    consultationDuration: number; // in minutes
}

@Injectable({ providedIn: "root" })
export class DoctorService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/doctors`;
  snapshot: any;

  private getHeaders() {
    const token = localStorage.getItem('clinicbook_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    createDoctor(doctor:Doctor): Observable<any> {
        return this.http.post(this.apiUrl, doctor, { headers: this.getHeaders() });
    }

    getDoctorsBySpecialty(specialtyId: number): Observable<Doctor[]> {
        return this.http.get<Doctor[]>(`${this.apiUrl}/specialty/${specialtyId}`,
        { headers: this.getHeaders() }
        );
    }

    updateDoctor(id: number, doctor: Doctor): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, doctor, { headers: this.getHeaders() });
    }

    deleteDoctor(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }
}