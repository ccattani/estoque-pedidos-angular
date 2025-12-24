import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Movement } from '../models/movement.model';
import { uid } from '../utils/id';
import { ProductsService } from './products.service';
import { DB } from '../data/in-memory-db';
import { withTransaction } from '../utils/transaction';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly _movements$ = new BehaviorSubject<Movement[]>(structuredClone(DB.movements ?? []));
  readonly movements$ = this._movements$.asObservable();

  constructor(private products: ProductsService) {}

  get snapshot(): Movement[] {
    return this._movements$.value;
  }

  restore(movements: Movement[]) {
    this._movements$.next(structuredClone(movements));
  }

  registerMovement(m: Omit<Movement, 'id' | 'createdAt'>) {
    return withTransaction(
      () => ({
        products: structuredClone(this.products.snapshot),
        movements: structuredClone(this.snapshot),
      }),
      snapshot => {
        this.products.restore(snapshot.products);
        this.restore(snapshot.movements);
      },
      () => {
        const movement: Movement = { ...m, id: uid(), createdAt: new Date().toISOString() };

        const product = this.products.getById(m.productId);
        if (!product) throw new Error('Produto não encontrado');

        let newStock = product.stockCurrent;

        if (m.type === 'IN') newStock += m.qty;
        if (m.type === 'OUT') newStock -= m.qty;
        if (m.type === 'ADJUST') newStock = m.qty;

        if (newStock < 0) throw new Error('Estoque não pode ficar negativo');

        this.products.update(product.id, { stockCurrent: newStock });
        this._movements$.next([movement, ...this._movements$.value]);

        return movement;
      }
    );
  }
}
