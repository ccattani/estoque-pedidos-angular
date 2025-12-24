import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info', ms = 2500) {
    const id = crypto.randomUUID?.() ?? Math.random().toString(16).slice(2);
    const t: Toast = { id, type, message };
    this.toasts.set([t, ...this.toasts()]);

    window.setTimeout(() => this.dismiss(id), ms);
  }

  dismiss(id: string) {
    this.toasts.set(this.toasts().filter(t => t.id !== id));
  }
}
