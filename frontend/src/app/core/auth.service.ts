import { computed, Injectable, signal } from '@angular/core';

export interface PublicUser {
  name: string;
  email: string;
}

interface StoredUser extends PublicUser {
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usersKey = 'clinicbook_users';
  private readonly currentUserKey = 'clinicbook_current_user';

  private readonly currentUserState = signal<PublicUser | null>(this.readCurrentUser());

  readonly currentUser = this.currentUserState.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  register(payload: RegisterPayload): { success: boolean; message?: string } {
    const users = this.readUsers();
    const email = payload.email.trim().toLowerCase();

    if (users.some((user) => user.email === email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    users.push({
      name: payload.name.trim(),
      email,
      password: payload.password
    });

    this.writeUsers(users);
    this.setCurrentUser({ name: payload.name.trim(), email });

    return { success: true };
  }

  login(email: string, password: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.readUsers().find((entry) => entry.email === normalizedEmail && entry.password === password);

    if (!user) {
      return false;
    }

    this.setCurrentUser({ name: user.name, email: user.email });
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.currentUserKey);
    this.currentUserState.set(null);
  }

  private setCurrentUser(user: PublicUser): void {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    this.currentUserState.set(user);
  }

  private readUsers(): StoredUser[] {
    const raw = localStorage.getItem(this.usersKey);

    if (!raw) {
      return [];
    }

    try {
      const users = JSON.parse(raw) as StoredUser[];
      return Array.isArray(users) ? users : [];
    } catch {
      return [];
    }
  }

  private writeUsers(users: StoredUser[]): void {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  private readCurrentUser(): PublicUser | null {
    const raw = localStorage.getItem(this.currentUserKey);

    if (!raw) {
      return null;
    }

    try {
      const user = JSON.parse(raw) as PublicUser;
      if (!user?.email || !user?.name) {
        return null;
      }
      return user;
    } catch {
      return null;
    }
  }
}
