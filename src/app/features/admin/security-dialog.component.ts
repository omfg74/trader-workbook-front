import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Issuer, Security, SecurityRequest, SecurityType } from '../../core/models/api.models';

export interface SecurityDialogData {
  value?: Security;
  types: SecurityType[];
  issuers: Issuer[];
}

@Component({
  selector: 'app-security-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.value ? 'Изменить инструмент' : 'Новый инструмент' }}</h2>
    <mat-dialog-content class="security-dialog-content">
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Тикер</mat-label>
          <input matInput formControlName="ticker" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Название</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Тип</mat-label>
          <mat-select formControlName="typeId" panelClass="security-select-panel">
            @if (!data.types.length) {
              <mat-option disabled>Нет типов — создайте в «Типы бумаг»</mat-option>
            }
            @for (t of data.types; track t.id) {
              <mat-option [value]="t.id">{{ t.name }}</mat-option>
            }
          </mat-select>
          @if (!data.types.length) {
            <mat-hint>Сначала добавьте тип бумаги</mat-hint>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Эмитент</mat-label>
          <mat-select formControlName="issuerId" panelClass="security-select-panel">
            <mat-option [value]="null">—</mat-option>
            @for (i of data.issuers; track i.id) {
              <mat-option [value]="i.id">{{ i.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Описание</mat-label>
          <textarea matInput rows="3" formControlName="description"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Отмена</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Сохранить</button>
    </mat-dialog-actions>
  `,
  styles: `
    .security-dialog-content {
      overflow: visible !important;
    }
    .dialog-form {
      display: flex;
      flex-direction: column;
      min-width: 300px;
      margin-top: 0.5rem;
      gap: 0.25rem;
    }
    .full {
      width: 100%;
    }
  `,
})
export class SecurityDialogComponent {
  readonly data = inject<SecurityDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<SecurityDialogComponent, SecurityRequest>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    ticker: [this.data.value?.ticker ?? '', Validators.required],
    name: [this.data.value?.name ?? '', Validators.required],
    typeId: [this.data.value?.typeId ?? (null as number | null), Validators.required],
    issuerId: [this.data.value?.issuerId ?? (null as number | null)],
    description: [this.data.value?.description ?? ''],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.dialogRef.close({
      ticker: v.ticker,
      name: v.name,
      typeId: v.typeId!,
      issuerId: v.issuerId,
      description: v.description || null,
    });
  }
}
