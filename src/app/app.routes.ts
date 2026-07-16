import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'trades' },
      {
        path: 'trades',
        loadComponent: () =>
          import('./features/trades/trade-list.component').then((m) => m.TradeListComponent),
      },
      {
        path: 'trades/new',
        loadComponent: () =>
          import('./features/trades/trade-edit.component').then((m) => m.TradeEditComponent),
      },
      {
        path: 'trades/:id',
        loadComponent: () =>
          import('./features/trades/trade-detail.component').then((m) => m.TradeDetailComponent),
      },
      {
        path: 'trades/:id/edit',
        loadComponent: () =>
          import('./features/trades/trade-edit.component').then((m) => m.TradeEditComponent),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'security-types' },
          {
            path: 'security-types',
            loadComponent: () =>
              import('./features/admin/security-type-manage.component').then(
                (m) => m.SecurityTypeManageComponent,
              ),
          },
          {
            path: 'issuers',
            loadComponent: () =>
              import('./features/admin/issuer-manage.component').then((m) => m.IssuerManageComponent),
          },
          {
            path: 'securities',
            loadComponent: () =>
              import('./features/admin/security-manage.component').then(
                (m) => m.SecurityManageComponent,
              ),
          },
          {
            path: 'users',
            loadComponent: () =>
              import('./features/admin/user-manage.component').then((m) => m.UserManageComponent),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./layout/not-found.component').then((m) => m.NotFoundComponent),
  },
];
