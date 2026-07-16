import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, switchMap, of, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
} from '../models/api.models';

const ACCESS_KEY = 'tw_access';
const REFRESH_KEY = 'tw_refresh';
const USER_KEY = 'tw_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;
  private readonly userSignal = signal<User | null>(this.readUser());
  private readonly accessTokenSignal = signal<string | null>(localStorage.getItem(ACCESS_KEY));

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(
    () => !!this.accessTokenSignal() && !!this.userSignal(),
  );
  readonly isAdmin = computed(() => this.userSignal()?.role === 'ADMIN');

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  getAccessToken(): string | null {
    return this.accessTokenSignal() ?? localStorage.getItem(ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.api}/auth/register`, data);
  }

  login(data: LoginRequest): Observable<User> {
    return this.http.post<TokenResponse>(`${this.api}/auth/login`, data).pipe(
      tap((tokens) => this.storeTokens(tokens)),
      switchMap(() => this.me()),
    );
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.api}/auth/me`).pipe(
      tap((user) => this.storeUser(user)),
    );
  }

  refresh(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }
    return this.http
      .post<TokenResponse>(`${this.api}/auth/refresh`, { refreshToken })
      .pipe(tap((tokens) => this.storeTokens(tokens)));
  }

  logout(navigate = true): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this.accessTokenSignal.set(null);
    this.userSignal.set(null);
    if (navigate) {
      void this.router.navigateByUrl('/login');
    }
  }

  tryRestoreSession(): Observable<User | null> {
    if (!this.getAccessToken()) {
      return of(null);
    }
    return this.me().pipe(
      catchError(() => {
        if (!this.getRefreshToken()) {
          this.logout(false);
          return of(null);
        }
        return this.refresh().pipe(
          switchMap(() => this.me()),
          catchError(() => {
            this.logout(false);
            return of(null);
          }),
        );
      }),
    );
  }

  private storeTokens(tokens: TokenResponse): void {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    this.accessTokenSignal.set(tokens.accessToken);
  }

  private storeUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSignal.set(user);
  }

  private readUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
