import { Component, OnInit, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { IssuerService } from '../../core/services/issuer.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ReferenceDialogComponent } from './reference-dialog.component';
import { Issuer } from '../../core/models/api.models';

@Component({
  selector: 'app-issuer-manage',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './reference-manage.component.html',
  styleUrl: './admin-table.scss',
})
export class IssuerManageComponent implements OnInit {
  private readonly service = inject(IssuerService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  title = 'Эмитенты';
  displayedColumns = ['name', 'description', 'actions'];
  rows: Issuer[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.list().subscribe({
      next: (rows) => (this.rows = rows),
      error: (err) => this.notifications.fromHttpError(err),
    });
  }

  create(): void {
    const ref = this.dialog.open(ReferenceDialogComponent, {
      data: { title: 'Новый эмитент' },
      width: '420px',
    });
    ref.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }
      this.service.create(data).subscribe({
        next: () => {
          this.notifications.showSuccess('Создано');
          this.load();
        },
        error: (err) => this.notifications.fromHttpError(err),
      });
    });
  }

  edit(row: Issuer): void {
    const ref = this.dialog.open(ReferenceDialogComponent, {
      data: { title: 'Изменить эмитента', value: { name: row.name, description: row.description } },
      width: '420px',
    });
    ref.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }
      this.service.update(row.id, data).subscribe({
        next: () => {
          this.notifications.showSuccess('Обновлено');
          this.load();
        },
        error: (err) => this.notifications.fromHttpError(err),
      });
    });
  }

  remove(row: Issuer): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Удалить?', message: row.name },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) {
        return;
      }
      this.service.delete(row.id).subscribe({
        next: () => {
          this.notifications.showSuccess('Удалено');
          this.load();
        },
        error: (err) => this.notifications.fromHttpError(err),
      });
    });
  }
}
