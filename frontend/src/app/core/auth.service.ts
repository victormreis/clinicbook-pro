import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, Injectable, inject, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PublicUser {
  id?: number;
  name?: string;
  email: string;
  role?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface LoginResponse {
  message: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authApiUrl = environment.apiUrl;
  private readonly tokenKey = 'clinicbook_token';
  private readonly currentUserKey = 'clinicbook_current_user';

  private readonly currentUserState = signal<PublicUser | null>(this.readInitialUser());

  readonly currentUser = this.currentUserState.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  register(payload: RegisterPayload): Observable<PublicUser> {
    return this.http.post<RegisterResponse>(`${this.authApiUrl}/register`, payload).pipe(
      map((response) => response.user)
    );
  }

  login(email: string, password: string): Observable<PublicUser> {
    return this.http.post<LoginResponse>(`${this.authApiUrl}/login`, { email, password }).pipe(
      tap((response) => this.storeToken(response.token)),
      map((response) => this.readUserFromToken(response.token)),
      map((user) => user ?? { email }),
      tap((user) => this.setCurrentUser(user))
    );
  }

  logout(): Observable<void> {
    const token = this.getStoredToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.post<{ message: string }>(`${this.authApiUrl}/logout`, {}, { headers }).pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
      tap(() => this.clearSession())
    );
  }

  private setCurrentUser(user: PublicUser): void {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    this.currentUserState.set(user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.currentUserKey);
    localStorage.removeItem(this.tokenKey);
    this.currentUserState.set(null);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private readInitialUser(): PublicUser | null {
    const token = this.getStoredToken();
    if (!token) {
      localStorage.removeItem(this.currentUserKey);
      return null;
    }

    const fromToken = this.readUserFromToken(token);
    if (!fromToken) {
      localStorage.removeItem(this.currentUserKey);
      localStorage.removeItem(this.tokenKey);
      return null;
    }

    const fromStorage = this.readCurrentUser();
    if (fromStorage?.email === fromToken.email) {
      const hydratedUser: PublicUser = {
        ...fromToken,
        name: fromStorage.name ?? fromToken.name
      };
      this.setCurrentUser(hydratedUser);
      return hydratedUser;
    }

    this.setCurrentUser(fromToken);
    return fromToken;
  }

  private readUserFromToken(token: string): PublicUser | null {
    const payload = this.decodeJwtPayload(token);

    if (!payload) {
      return null;
    }

    const exp = typeof payload['exp'] === 'number' ? payload['exp'] : undefined;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (exp && exp <= nowInSeconds) {
      return null;
    }

    const email = typeof payload['email'] === 'string' ? payload['email'] : undefined;
    if (!email) {
      return null;
    }

    return {
      id: typeof payload['id'] === 'number' ? payload['id'] : undefined,
      role: typeof payload['role'] === 'string' ? payload['role'] : undefined,
      email,
      name: email.split('@')[0]
    };
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const decoded = atob(padded);
      return JSON.parse(decoded) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private readCurrentUser(): PublicUser | null {
    const raw = localStorage.getItem(this.currentUserKey);

    if (!raw) {
      return null;
    }

    try {
      const user = JSON.parse(raw) as PublicUser;
      if (!user?.email) {
        return null;
      }
      return user;
    } catch {
      return null;
    }
  }
}
