import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { debounceTime, distinctUntilChanged, switchMap, startWith, of } from 'rxjs';
import { TradeService } from '../../core/services/trade.service';
import { SecurityService } from '../../core/services/security.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Security, Side, Trade } from '../../core/models/api.models';

@Component({
  selector: 'app-trade-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DecimalPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatCheckboxModule,
  ],
  templateUrl: './trade-edit.component.html',
  styleUrl: './trade-edit.component.scss',
})
export class TradeEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tradeService = inject(TradeService);
  private readonly securityService = inject(SecurityService);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  tradeId: number | null = null;
  isEdit = false;
  filteredSecurities: Security[] = [];
  hasAnySecurities = false;
  selectedSecurity = signal<Security | null>(null);

  readonly form = this.fb.nonNullable.group({
    securityQuery: ['', Validators.required],
    securityId: [null as number | null, Validators.required],
    side: ['BUY' as Side, Validators.required],
    purchasePrice: [null as number | null, [Validators.required, Validators.min(0)]],
    exchangeCommission: [0, [Validators.required, Validators.min(0)]],
    brokerCommission: [0, [Validators.required, Validators.min(0)]],
    purchaseDate: [new Date() as Date | null, Validators.required],
    comment: [''],
    sellPrice: [null as number | null],
    sellDate: [null as Date | null],
    clearSale: [false],
  });

  pnlDisplay: number | null = null;

  ngOnInit(): void {
    this.securityService.getSecurities().subscribe({
      next: (list) => {
        this.hasAnySecurities = list.length > 0;
        this.filteredSecurities = list;
      },
      error: (err) => this.notifications.fromHttpError(err),
    });

    this.form.valueChanges.subscribe(() => {
      const v = this.form.getRawValue();
      const sell = v.clearSale ? null : v.sellPrice;
      if (sell == null || sell === ('' as unknown) || Number.isNaN(Number(sell))) {
        this.pnlDisplay = null;
      } else {
        this.pnlDisplay =
          Number(sell) - Number(v.purchasePrice) - Number(v.exchangeCommission) - Number(v.brokerCommission);
      }
    });

    this.form.controls.securityQuery.valueChanges
      .pipe(
        startWith(''),
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((q) => {
          if (typeof q !== 'string') {
            return of(this.filteredSecurities);
          }
          const selected = this.selectedSecurity();
          const label = selected ? `${selected.ticker} — ${selected.name}` : '';
          if (q !== label) {
            this.form.controls.securityId.setValue(null, { emitEvent: false });
            this.selectedSecurity.set(null);
          }
          return this.securityService.getSecurities(q || undefined);
        }),
      )
      .subscribe((list) => (this.filteredSecurities = list));

    this.form.controls.clearSale.valueChanges.subscribe((clear) => {
      if (clear) {
        this.form.patchValue({ sellPrice: null, sellDate: null }, { emitEvent: true });
        this.form.controls.sellPrice.disable({ emitEvent: false });
        this.form.controls.sellDate.disable({ emitEvent: false });
      } else {
        this.form.controls.sellPrice.enable({ emitEvent: false });
        this.form.controls.sellDate.enable({ emitEvent: false });
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && this.route.snapshot.routeConfig?.path?.includes('edit')) {
      this.tradeId = Number(idParam);
      this.isEdit = true;
      this.tradeService.getTrade(this.tradeId).subscribe({
        next: (trade) => this.patchTrade(trade),
        error: (err) => {
          this.notifications.fromHttpError(err);
          void this.router.navigateByUrl('/trades');
        },
      });
    }
  }

  displaySecurity = (value: string | Security | null): string => {
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    return `${value.ticker} — ${value.name}`;
  };

  onSecuritySelected(sec: Security): void {
    this.selectedSecurity.set(sec);
    this.form.patchValue({
      securityId: sec.id,
      securityQuery: `${sec.ticker} — ${sec.name}`,
    });
  }

  submit(): void {
    if (!this.form.value.securityId) {
      this.form.controls.securityId.markAsTouched();
      this.form.controls.securityQuery.markAsTouched();
      this.notifications.showError(
        this.hasAnySecurities
          ? 'Выберите инструмент из выпадающего списка'
          : 'Сначала создайте инструмент в Админке → Инструменты',
      );
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notifications.showError('Заполните обязательные поля');
      return;
    }

    const v = this.form.getRawValue();
    const purchaseDate = v.purchaseDate ? new Date(v.purchaseDate).toISOString() : undefined;

    if (!this.isEdit || this.tradeId == null) {
      this.tradeService
        .createTrade({
          securityId: v.securityId!,
          side: v.side,
          purchasePrice: Number(v.purchasePrice),
          exchangeCommission: Number(v.exchangeCommission),
          brokerCommission: Number(v.brokerCommission),
          comment: v.comment || null,
          purchaseDate,
        })
        .subscribe({
          next: (trade) => {
            this.notifications.showSuccess('Сделка создана');
            void this.router.navigateByUrl(`/trades/${trade.id}`);
          },
          error: (err) => this.notifications.fromHttpError(err),
        });
      return;
    }

    const update: Record<string, unknown> = {
      securityId: v.securityId,
      side: v.side,
      purchasePrice: Number(v.purchasePrice),
      exchangeCommission: Number(v.exchangeCommission),
      brokerCommission: Number(v.brokerCommission),
      comment: v.comment || null,
      purchaseDate,
    };

    if (v.clearSale) {
      update['clearSale'] = true;
    } else {
      if (v.sellPrice != null && v.sellPrice !== ('' as unknown)) {
        update['sellPrice'] = Number(v.sellPrice);
      }
      if (v.sellDate) {
        update['sellDate'] = new Date(v.sellDate).toISOString();
      }
    }

    this.tradeService.updateTrade(this.tradeId, update).subscribe({
      next: (trade) => {
        this.notifications.showSuccess('Сделка обновлена');
        void this.router.navigateByUrl(`/trades/${trade.id}`);
      },
      error: (err) => this.notifications.fromHttpError(err),
    });
  }

  private patchTrade(trade: Trade): void {
    this.selectedSecurity.set({
      id: trade.securityId,
      ticker: trade.securityTicker,
      name: trade.securityName,
      typeId: 0,
      typeName: '',
      issuerId: null,
      issuerName: null,
      description: null,
    });
    this.form.patchValue({
      securityId: trade.securityId,
      securityQuery: `${trade.securityTicker} — ${trade.securityName}`,
      side: trade.side,
      purchasePrice: trade.purchasePrice,
      exchangeCommission: trade.exchangeCommission,
      brokerCommission: trade.brokerCommission,
      purchaseDate: new Date(trade.purchaseDate),
      comment: trade.comment ?? '',
      sellPrice: trade.sellPrice,
      sellDate: trade.sellDate ? new Date(trade.sellDate) : null,
      clearSale: false,
    });
  }
}
