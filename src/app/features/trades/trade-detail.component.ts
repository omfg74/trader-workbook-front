import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TradeService } from '../../core/services/trade.service';
import { SecurityService } from '../../core/services/security.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { Security, Trade } from '../../core/models/api.models';

@Component({
  selector: 'app-trade-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './trade-detail.component.html',
  styleUrl: './trade-detail.component.scss',
})
export class TradeDetailComponent implements OnInit {
  private readonly tradeService = inject(TradeService);
  private readonly securityService = inject(SecurityService);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  trade: Trade | null = null;
  security: Security | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.tradeService.getTrade(id).subscribe({
      next: (trade) => {
        this.trade = trade;
        this.securityService.getSecurities().subscribe({
          next: (list) => {
            this.security = list.find((s) => s.id === trade.securityId) ?? null;
          },
        });
      },
      error: (err) => {
        this.notifications.fromHttpError(err);
        void this.router.navigate(['/trades']);
      },
    });
  }

  deleteTrade(): void {
    if (!this.trade) {
      return;
    }
    const trade = this.trade;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Удалить сделку?',
        message: `${trade.securityTicker} — ${trade.securityName}`,
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) {
        return;
      }
      this.tradeService.deleteTrade(trade.id).subscribe({
        next: () => {
          this.notifications.showSuccess('Сделка удалена');
          void this.router.navigate(['/trades']);
        },
        error: (err) => this.notifications.fromHttpError(err),
      });
    });
  }
}
