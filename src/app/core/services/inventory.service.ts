import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Movement } from '../models/movement.model';
import { uid } from '../utils/id';
import { ProductsService } from './products.service';
import { DB } from '../data/in-memory-db';
import { ApiError } from '../errors/api-error';
import { movementSchema } from '../validation/schemas';
import { parseOrThrow } from '../validation/validate';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly _movements$ = new BehaviorSubject<Movement[]>(structuredClone(DB.movements ?? []));
  readonly movements$ = this._movements$.asObservable();

  constructor(private products: ProductsService) {}

  // GET /movements
  list(): Movement[] {
    return this._movements$.value;
  }

  // POST /movements
  register(m: Omit<Movement, 'id' | 'createdAt'>) {
    const payload = parseOrThrow(movementSchema, m);
    const movement: Movement = { ...payload, id: uid(), createdAt: new Date().toISOString() };

    const product = this.products.getById(payload.productId);
    if (!product) throw new ApiError('NOT_FOUND', 'Produto não encontrado');

    let newStock = product.stockCurrent;

    if (payload.type === 'IN') newStock += payload.qty;
    if (payload.type === 'OUT') newStock -= payload.qty;
    if (payload.type === 'ADJUST') newStock = payload.qty;

    if (newStock < 0) {
      throw new ApiError('INSUFFICIENT_STOCK', `Estoque insuficiente: ${product.name}`, {
        productId: product.id,
        available: product.stockCurrent,
        required: payload.qty,
      });
    }

    this.products.update(product.id, { stockCurrent: newStock });
    this._movements$.next([movement, ...this._movements$.value]);

    return movement;
  }
}
