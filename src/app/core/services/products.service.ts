import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DB } from '../data/in-memory-db';
import { uid } from '../utils/id';
import { Produto } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly _products$ = new BehaviorSubject<Produto[]>(structuredClone(DB.products));
  readonly products$ = this._products$.asObservable();

  get snapshot(): Produto[] {
    return this._products$.value;
  }

  getById(id: string): Produto | undefined {
    return this.snapshot.find(p => p.id === id);
  }

  create(input: Omit<Produto, 'id' | 'createdAt'>) {
    const product: Produto = { ...input, id: uid(), createdAt: new Date().toISOString() };
    this._products$.next([product, ...this.snapshot]);
    return product;
  }

  update(id: string, patch: Partial<Omit<Produto, 'id' | 'createdAt'>>) {
    const next = this.snapshot.map(p => (p.id === id ? { ...p, ...patch } : p));
    this._products$.next(next);
  }

  remove(id: string) {
    this._products$.next(this.snapshot.filter(p => p.id !== id));
  }
}
