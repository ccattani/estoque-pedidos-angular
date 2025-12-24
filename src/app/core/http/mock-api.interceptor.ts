import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { mockApiStore } from '../data/mock-api-store';

const notFound = (message: string) =>
  throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found', error: message }));

const badRequest = (message: string) =>
  throwError(() => new HttpErrorResponse({ status: 400, statusText: 'Bad Request', error: message }));

const ok = <T>(body: T): Observable<HttpEvent<T>> =>
  of(new HttpResponse({ status: 200, body }));

const noContent = (): Observable<HttpEvent<unknown>> =>
  of(new HttpResponse({ status: 204 }));

const parsePath = (url: string) => url.replace(/^\/+/, '').split('?')[0];

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  const path = parsePath(req.url).replace(/^api\//, '');
  const [resource, id, action] = path.split('/');

  try {
    if (resource === 'products') {
      if (req.method === 'GET' && !id) return ok(mockApiStore.listProducts());
      if (req.method === 'GET' && id) return ok(mockApiStore.getProduct(id));
      if (req.method === 'POST' && !id) return ok(mockApiStore.createProduct(req.body));
      if (req.method === 'PUT' && id) return ok(mockApiStore.updateProduct(id, req.body));
      if (req.method === 'DELETE' && id) {
        mockApiStore.deleteProduct(id);
        return noContent();
      }
    }

    if (resource === 'orders') {
      if (req.method === 'GET' && !id) return ok(mockApiStore.listOrders());
      if (req.method === 'GET' && id) return ok(mockApiStore.getOrder(id));
      if (req.method === 'POST' && !id) return ok(mockApiStore.createOrderDraft(req.body));
      if (req.method === 'POST' && id && action === 'confirm') {
        return ok(mockApiStore.confirmOrder(id));
      }
    }

    if (resource === 'movements') {
      if (req.method === 'GET') return ok(mockApiStore.listMovements());
      if (req.method === 'POST') return ok(mockApiStore.registerMovement(req.body));
    }

    return notFound(`Cannot ${req.method} ${req.url}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado';
    return badRequest(message);
  }
};
