import { createApp } from 'vue';
import App from './App.vue';

export function mount(container: Element) {
  const app = createApp(App);
  app.mount(container);

  return () => app.unmount();
}
