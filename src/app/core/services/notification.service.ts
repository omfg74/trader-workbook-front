import { Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly loading = signal(false);
  private pending = 0;

  constructor(private readonly snackBar: MatSnackBar) {}

  showSuccess(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 3000 });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Закрыть', { duration: 5000 });
  }

  fromHttpError(err: unknown, fallback = 'Произошла ошибка'): void {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as ApiError | string | null;
      if (body && typeof body === 'object' && 'message' in body && body.message) {
        this.showError(body.message);
        return;
      }
      if (typeof body === 'string' && body.trim()) {
        this.showError(body);
        return;
      }
      this.showError(err.message || fallback);
      return;
    }
    this.showError(fallback);
  }

  startLoading(): void {
    this.pending += 1;
    this.loading.set(true);
  }

  stopLoading(): void {
    this.pending = Math.max(0, this.pending - 1);
    if (this.pending === 0) {
      this.loading.set(false);
    }
  }
}
