import { Injectable, signal, effect } from '@angular/core';

const THEME_KEY = 'tw_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal(localStorage.getItem(THEME_KEY) === 'dark');

  constructor() {
    effect(() => {
      const dark = this.dark();
      document.body.classList.toggle('theme-dark', dark);
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.dark.update((v) => !v);
  }
}
