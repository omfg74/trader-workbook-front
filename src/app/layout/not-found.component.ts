import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="not-found">
      <h1>404</h1>
      <p>Страница не найдена</p>
      <a mat-flat-button color="primary" routerLink="/trades">К сделкам</a>
    </div>
  `,
  styles: `
    .not-found {
      text-align: center;
      padding: 4rem 1rem;
    }
    h1 { font-size: 4rem; margin: 0; }
  `,
})
export class NotFoundComponent {}
