import 'zone.js';
import '@angular/compiler';
import './style.css';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';

bootstrapApplication(AppComponent).catch((error) => {
  // Keep startup diagnostics visible in console if Angular bootstrap fails.
  console.error(error);

  const details = error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : String(error);
  document.body.innerHTML = `<pre style="white-space:pre-wrap;padding:16px;color:#7f1d1d;background:#fee2e2;border-radius:8px;margin:16px">Angular bootstrap failed:\n${details}</pre>`;
});
