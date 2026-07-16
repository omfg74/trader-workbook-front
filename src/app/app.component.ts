import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: `:host { display: block; min-height: 100%; }`,
})
export class AppComponent {
  // Ensure theme is applied on cold start (login/register too)
  private readonly theme = inject(ThemeService);
}
