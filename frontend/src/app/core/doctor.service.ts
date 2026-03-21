import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

export interface Doctor {
    id: number;
    name: string;
    specialityId: number;
    bio?: string;
    availability?: string;
}

@Injectable({ providedIn: "root" })
export class DoctorService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/doctors`;
  snapshot: any;

    getDoctorsBySpeciality(specialityId: number): Observable<Doctor[]> {
        return this.http.get<Doctor[]>(`${this.apiUrl}/speciality/${specialityId}`);
    }
}