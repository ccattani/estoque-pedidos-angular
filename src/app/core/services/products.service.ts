import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Produto } from '../models/produto.model';
import { productCreateSchema, productUpdateSchema } from '../validation/schemas';
import { parseOrThrow } from '../validation/validate';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly baseUrl = '/api/products';
  private readonly _products$ = new BehaviorSubject<Produto[]>([]);
  readonly products$ = this._products$.asObservable();

  constructor(private http: HttpClient) {
    this.refresh().subscribe();
  }

  get snapshot(): Produto[] {
    return this._products$.value;
  }

  // GET /products
  list(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.baseUrl);
  }

  // GET /products/:id
  getById(id: string): Observable<Produto> {
    return this.http.get<Produto>(`${this.baseUrl}/${id}`);
  }

  // POST /products
  create(input: Omit<Produto, 'id' | 'createdAt'>): Observable<Produto> {
    const payload = parseOrThrow(productCreateSchema, input);
    return this.http.post<Produto>(this.baseUrl, payload).pipe(
      tap(product => {
        this._products$.next([product, ...this.snapshot]);
      })
    );
  }

  // PUT /products/:id
  update(
    id: string,
    patch: Partial<Omit<Produto, 'id' | 'createdAt'>>
  ): Observable<Produto> {
    const payload = parseOrThrow(productUpdateSchema, patch);
    return this.http.put<Produto>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(product => {
        const next = this.snapshot.map(p => (p.id === id ? product : p));
        this._products$.next(next);
      })
    );
  }

  // DELETE /products/:id
  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this._products$.next(this.snapshot.filter(p => p.id !== id));
      })
    );
  }

  refresh(): Observable<Produto[]> {
    return this.list().pipe(
      tap(products => {
        this._products$.next(products);
      })
    );
  }
}
