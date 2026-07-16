import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReferenceRequest } from '../../core/models/api.models';

export interface ReferenceDialogData {
  title: string;
  value?: ReferenceRequest;
}

@Component({
  selector: 'app-reference-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Название</mat-label>
          <input matInput formControlName="name" />
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
    .dialog-form { display: flex; flex-direction: column; min-width: 280px; margin-top: 0.5rem; }
    .full { width: 100%; }
  `,
})
export class ReferenceDialogComponent {
  readonly data = inject<ReferenceDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ReferenceDialogComponent, ReferenceRequest>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: [this.data.value?.name ?? '', Validators.required],
    description: [this.data.value?.description ?? ''],
  });

  save(): void {
    if (this.form.invalid) {
      return;
    }
    const v = this.form.getRawValue();
    this.dialogRef.close({
      name: v.name,
      description: v.description || null,
    });
  }
}
