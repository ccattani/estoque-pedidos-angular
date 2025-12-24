import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DB } from '../data/in-memory-db';
import { uid } from '../utils/id';
import { Produto } from '../models/produto.model';
import { ApiError } from '../errors/api-error';
import { productCreateSchema, productUpdateSchema } from '../validation/schemas';
import { parseOrThrow } from '../validation/validate';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly _products$ = new BehaviorSubject<Produto[]>(structuredClone(DB.products));
  readonly products$ = this._products$.asObservable();

  get snapshot(): Produto[] {
    return this._products$.value;
  }

  restore(products: Produto[]) {
    this._products$.next(structuredClone(products));
  }

  // GET /products
  list(): Produto[] {
    return this.snapshot;
  }

  // GET /products/:id
  getById(id: string): Produto | undefined {
    return this.snapshot.find(p => p.id === id);
  }

  getByIdOrThrow(id: string): Produto {
    const product = this.getById(id);
    if (!product) throw new ApiError('NOT_FOUND', 'Produto não encontrado');
    return product;
  }

  // POST /products
  create(input: Omit<Produto, 'id' | 'createdAt'>) {
    const payload = parseOrThrow(productCreateSchema, input);
    const product: Produto = { ...payload, id: uid(), createdAt: new Date().toISOString() };
    this._products$.next([product, ...this.snapshot]);
    return product;
  }

  // PUT /products/:id
  update(id: string, patch: Partial<Omit<Produto, 'id' | 'createdAt'>>) {
    this.getByIdOrThrow(id);
    const payload = parseOrThrow(productUpdateSchema, patch);
    const next = this.snapshot.map(p => (p.id === id ? { ...p, ...payload } : p));
    this._products$.next(next);
  }

  // DELETE /products/:id
  remove(id: string) {
    this.getByIdOrThrow(id);
    this._products$.next(this.snapshot.filter(p => p.id !== id));
  }
}
