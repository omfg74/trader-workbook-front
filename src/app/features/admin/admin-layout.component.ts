import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  private readonly bp = inject(BreakpointObserver);
  readonly isMobile = toSignal(
    this.bp.observe([Breakpoints.Handset]).pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  readonly links = [
    { path: '/admin/security-types', label: 'Типы бумаг', icon: 'category' },
    { path: '/admin/issuers', label: 'Эмитенты', icon: 'business' },
    { path: '/admin/securities', label: 'Инструменты', icon: 'show_chart' },
    { path: '/admin/users', label: 'Пользователи', icon: 'people' },
  ];
}
