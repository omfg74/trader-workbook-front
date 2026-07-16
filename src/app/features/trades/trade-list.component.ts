import { Component, OnInit, inject, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap, startWith, of } from 'rxjs';
import { TradeService } from '../../core/services/trade.service';
import { SecurityService } from '../../core/services/security.service';
import { SecurityTypeService } from '../../core/services/security-type.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { Security, SecurityType, Trade, TradeStatus } from '../../core/models/api.models';

@Component({
  selector: 'app-trade-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatAutocompleteModule,
  ],
  templateUrl: './trade-list.component.html',
  styleUrl: './trade-list.component.scss',
})
export class TradeListComponent implements OnInit {
  private readonly tradeService = inject(TradeService);
  private readonly securityService = inject(SecurityService);
  private readonly securityTypeService = inject(SecurityTypeService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);

  displayedColumns = [
    'securityTicker',
    'securityName',
    'typeName',
    'issuerName',
    'side',
    'purchasePrice',
    'purchaseDate',
    'status',
    'pnl',
    'actions',
  ];

  trades: Trade[] = [];
  totalElements = 0;
  pageIndex = 0;
  pageSize = 20;
  sortParam = 'purchaseDate,desc';
  securities: Security[] = [];
  filteredSecurities: Security[] = [];
  securityTypes: SecurityType[] = [];
  securityMap = new Map<number, Security>();

  readonly filters = this.fb.nonNullable.group({
    nameSearch: [''],
    status: ['' as TradeStatus | ''],
    typeId: [null as number | null],
    securityId: [null as number | null],
    securityQuery: [''],
    dateFrom: [null as Date | null],
    dateTo: [null as Date | null],
    all: [false],
  });

  ngOnInit(): void {
    this.securityTypeService.list().subscribe({
      next: (types) => (this.securityTypes = types),
      error: (err) => this.notifications.fromHttpError(err),
    });

    this.securityService.getSecurities().subscribe({
      next: (list) => {
        this.securities = list;
        this.filteredSecurities = list;
        this.securityMap = new Map(list.map((s) => [s.id, s]));
      },
      error: (err) => this.notifications.fromHttpError(err),
    });

    this.filters.controls.securityQuery.valueChanges
      .pipe(
        startWith(''),
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((q) => {
          if (!q?.trim()) {
            return of(this.securities);
          }
          return this.securityService.getSecurities(q);
        }),
      )
      .subscribe((list) => (this.filteredSecurities = list));

    this.load();
  }

  load(): void {
    const f = this.filters.getRawValue();
    let securityId = f.securityId;

    if (!securityId && (f.nameSearch.trim() || f.typeId != null)) {
      const matches = this.securities.filter((s) => {
        const byName =
          !f.nameSearch.trim() ||
          s.name.toLowerCase().includes(f.nameSearch.trim().toLowerCase()) ||
          s.ticker.toLowerCase().includes(f.nameSearch.trim().toLowerCase());
        const byType = f.typeId == null || s.typeId === f.typeId;
        return byName && byType;
      });
      if (matches.length === 1) {
        securityId = matches[0].id;
      } else if (matches.length === 0) {
        this.trades = [];
        this.totalElements = 0;
        return;
      } else if (f.typeId != null || f.nameSearch.trim()) {
        // Multiple matches — fetch without securityId and filter client-side on page
        securityId = null;
      }
    }

    this.tradeService
      .getTrades({
        all: this.auth.isAdmin() ? f.all : false,
        status: f.status || undefined,
        securityId: securityId ?? undefined,
        dateFrom: f.dateFrom ? f.dateFrom.toISOString() : undefined,
        dateTo: f.dateTo ? this.endOfDay(f.dateTo) : undefined,
        page: this.pageIndex,
        size: this.pageSize,
        sort: this.sortParam,
      })
      .subscribe({
        next: (page) => {
          let content = page.content;
          if (!securityId && (f.nameSearch.trim() || f.typeId != null)) {
            content = content.filter((t) => {
              const sec = this.securityMap.get(t.securityId);
              const byName =
                !f.nameSearch.trim() ||
                t.securityName.toLowerCase().includes(f.nameSearch.trim().toLowerCase()) ||
                t.securityTicker.toLowerCase().includes(f.nameSearch.trim().toLowerCase());
              const byType = f.typeId == null || sec?.typeId === f.typeId;
              return byName && byType;
            });
          }
          this.trades = content;
          this.totalElements = page.totalElements;
        },
        error: (err) => this.notifications.fromHttpError(err),
      });
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.load();
  }

  resetFilters(): void {
    this.filters.reset({
      nameSearch: '',
      status: '',
      typeId: null,
      securityId: null,
      securityQuery: '',
      dateFrom: null,
      dateTo: null,
      all: false,
    });
    this.applyFilters();
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  onSort(sort: Sort): void {
    if (!sort.active || !sort.direction) {
      this.sortParam = 'purchaseDate,desc';
    } else {
      this.sortParam = `${sort.active},${sort.direction}`;
    }
    this.load();
  }

  displaySecurity(sec: Security | null): string {
    return sec ? `${sec.ticker} — ${sec.name}` : '';
  }

  onSecuritySelected(sec: Security): void {
    this.filters.patchValue({ securityId: sec.id, securityQuery: `${sec.ticker} — ${sec.name}` });
  }

  typeName(trade: Trade): string {
    return this.securityMap.get(trade.securityId)?.typeName ?? '—';
  }

  issuerName(trade: Trade): string {
    return this.securityMap.get(trade.securityId)?.issuerName ?? '—';
  }

  deleteTrade(trade: Trade): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Удалить сделку?',
        message: `${trade.securityTicker} от ${new Date(trade.purchaseDate).toLocaleDateString()}`,
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) {
        return;
      }
      this.tradeService.deleteTrade(trade.id).subscribe({
        next: () => {
          this.notifications.showSuccess('Сделка удалена');
          this.load();
        },
        error: (err) => this.notifications.fromHttpError(err),
      });
    });
  }

  exportCsv(): void {
    const headers = [
      'id',
      'ticker',
      'name',
      'side',
      'purchasePrice',
      'purchaseDate',
      'status',
      'pnl',
      'sellPrice',
      'sellDate',
    ];
    const rows = this.trades.map((t) =>
      [
        t.id,
        t.securityTicker,
        t.securityName,
        t.side,
        t.purchasePrice,
        t.purchaseDate,
        t.status,
        t.pnl ?? '',
        t.sellPrice ?? '',
        t.sellDate ?? '',
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private endOfDay(date: Date): string {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }
}
