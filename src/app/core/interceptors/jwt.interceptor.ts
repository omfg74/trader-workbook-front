import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

let refreshInFlight: ReturnType<AuthService['refresh']> | null = null;

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notifications = inject(NotificationService);

  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh');

  const token = auth.getAccessToken();
  const authReq =
    token && !isAuthEndpoint
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  notifications.startLoading();

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthEndpoint || req.url.includes('/auth/refresh')) {
        return throwError(() => err);
      }

      if (!refreshInFlight) {
        refreshInFlight = auth.refresh().pipe(
          finalize(() => {
            refreshInFlight = null;
          }),
        );
      }

      return refreshInFlight.pipe(
        switchMap(() => {
          const newToken = auth.getAccessToken();
          const retry = newToken
            ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
            : req;
          return next(retry);
        }),
        catchError((refreshErr) => {
          auth.logout();
          return throwError(() => refreshErr);
        }),
      );
    }),
    finalize(() => notifications.stopLoading()),
  );
};
