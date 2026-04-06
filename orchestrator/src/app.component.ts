import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

type RemoteMount = (container: Element) => void | (() => void);

type RemoteModule = {
  mount?: RemoteMount;
  default?: RemoteMount | { mount?: RemoteMount };
};

type RemoteDescriptor = {
  label: string;
  remoteEntryUrl: string;
  importModule: () => Promise<RemoteModule>;
  container: Element;
};

const reactRemoteEntry =
  import.meta.env.VITE_REACT_REMOTE_ENTRY ?? 'http://localhost:5174/assets/remoteEntry.js';
const vueRemoteEntry =
  import.meta.env.VITE_VUE_REMOTE_ENTRY ?? 'http://localhost:5175/assets/remoteEntry.js';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <header>
      <h1>Module Federation Orchestrator</h1>
      <p>Host app that composes React and Vue remotes.</p>
    </header>

    <div class="grid">
      <section class="remote-shell">
        <h2>React Remote</h2>
        <div #reactMount class="remote-mount"></div>
      </section>

      <section class="remote-shell">
        <h2>Vue Remote</h2>
        <div #vueMount class="remote-mount"></div>
      </section>
    </div>
  `,
})
export class AppComponent implements AfterViewInit {
  @ViewChild('reactMount', { static: true })
  private reactMountRef!: ElementRef<HTMLElement>;

  @ViewChild('vueMount', { static: true })
  private vueMountRef!: ElementRef<HTMLElement>;

  private cleanups: Array<() => void> = [];

  async ngAfterViewInit() {
    this.cleanups = await Promise.all([
      this.attachRemote({
        label: 'React remote',
        remoteEntryUrl: reactRemoteEntry,
        importModule: () => import('react_remote/mount'),
        container: this.reactMountRef.nativeElement,
      }),
      this.attachRemote({
        label: 'Vue remote',
        remoteEntryUrl: vueRemoteEntry,
        importModule: () => import('vue_remote/mount'),
        container: this.vueMountRef.nativeElement,
      }),
    ]);

    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        this.cleanups.forEach((cleanup) => cleanup());
      });
    }
  }

  private normalizeErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }

  private async waitForRemoteEntry(url: string, timeoutMs = 10000) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      try {
        const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
        if (response.ok) {
          return;
        }
      } catch {
        // Remote not ready yet.
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    throw new Error(`Remote entry not reachable: ${url}`);
  }

  private async attachRemote({
    label,
    remoteEntryUrl,
    importModule,
    container,
  }: RemoteDescriptor): Promise<() => void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      try {
        await this.waitForRemoteEntry(remoteEntryUrl);
        const mod = await importModule();

        const mount =
          (typeof mod === 'function' ? mod : undefined) ||
          mod.mount ||
          (typeof mod.default === 'function' ? mod.default : undefined) ||
          (typeof mod.default === 'object' ? mod.default?.mount : undefined);

        if (!mount) {
          throw new Error(`No mount function found for ${label}.`);
        }

        const cleanup = mount(container);
        return typeof cleanup === 'function' ? cleanup : () => {};
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }

    const details = this.normalizeErrorMessage(lastError);
    container.innerHTML = `<p class="error">Failed to load ${label}.</p><pre class="error-details">${details}</pre>`;
    return () => {};
  }
}
