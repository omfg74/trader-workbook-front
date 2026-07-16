import { Component, OnInit, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { SecurityService } from '../../core/services/security.service';
import { SecurityTypeService } from '../../core/services/security-type.service';
import { IssuerService } from '../../core/services/issuer.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { SecurityDialogComponent } from './security-dialog.component';
import { Issuer, Security, SecurityType } from '../../core/models/api.models';

@Component({
  selector: 'app-security-manage',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './security-manage.component.html',
  styleUrl: './admin-table.scss',
})
export class SecurityManageComponent implements OnInit {
  private readonly securityService = inject(SecurityService);
  private readonly typeService = inject(SecurityTypeService);
  private readonly issuerService = inject(IssuerService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  displayedColumns = ['ticker', 'name', 'typeName', 'issuerName', 'actions'];
  rows: Security[] = [];
  types: SecurityType[] = [];
  issuers: Issuer[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    forkJoin({
      securities: this.securityService.getSecurities(),
      types: this.typeService.list(),
      issuers: this.issuerService.list(),
    }).subscribe({
      next: ({ securities, types, issuers }) => {
        this.rows = securities;
        this.types = types;
        this.issuers = issuers;
      },
      error: (err) => this.notifications.fromHttpError(err),
    });
  }

  create(): void {
    forkJoin({
      types: this.typeService.list(),
      issuers: this.issuerService.list(),
    }).subscribe({
      next: ({ types, issuers }) => {
        this.types = types;
        this.issuers = issuers;
        if (!types.length) {
          this.notifications.showError('Сначала создайте тип бумаги в разделе «Типы бумаг»');
          return;
        }
        const ref = this.dialog.open(SecurityDialogComponent, {
          data: { types, issuers },
          width: '460px',
          autoFocus: 'dialog',
          restoreFocus: true,
        });
        ref.afterClosed().subscribe((data) => {
          if (!data) {
            return;
          }
          this.securityService.create(data).subscribe({
            next: () => {
              this.notifications.showSuccess('Создано');
              this.load();
            },
            error: (err) => this.notifications.fromHttpError(err),
          });
        });
      },
      error: (err) => this.notifications.fromHttpError(err),
    });
  }

  edit(row: Security): void {
    forkJoin({
      types: this.typeService.list(),
      issuers: this.issuerService.list(),
    }).subscribe({
      next: ({ types, issuers }) => {
        this.types = types;
        this.issuers = issuers;
        const ref = this.dialog.open(SecurityDialogComponent, {
          data: { value: row, types, issuers },
          width: '460px',
          autoFocus: 'dialog',
          restoreFocus: true,
        });
        ref.afterClosed().subscribe((data) => {
          if (!data) {
            return;
          }
          this.securityService.update(row.id, data).subscribe({
            next: () => {
              this.notifications.showSuccess('Обновлено');
              this.load();
            },
            error: (err) => this.notifications.fromHttpError(err),
          });
        });
      },
      error: (err) => this.notifications.fromHttpError(err),
    });
  }

  remove(row: Security): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Удалить?', message: `${row.ticker} — ${row.name}` },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) {
        return;
      }
      this.securityService.delete(row.id).subscribe({
        next: () => {
          this.notifications.showSuccess('Удалено');
          this.load();
        },
        error: (err) => this.notifications.fromHttpError(err),
      });
    });
  }
}
