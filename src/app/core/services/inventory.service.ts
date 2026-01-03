import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Movement } from '../models/movement.model';
import { uid } from '../utils/id';
import { ProductsService } from './products.service';
import { DB } from '../data/in-memory-db';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly _movements$ = new BehaviorSubject<Movement[]>(structuredClone(DB.movements ?? []));
  readonly movements$ = this._movements$.asObservable();

  constructor(private products: ProductsService) {}

  register(dadosMovimento: Omit<Movement, 'id' | 'createdAt'>) {
    const movement: Movement = { ...dadosMovimento, id: uid(), createdAt: new Date().toISOString() };

    const product = this.products.getById(dadosMovimento.productId);
    if (!product) throw new Error('Produto não encontrado');

    let newStock = product.stockCurrent;

    if (dadosMovimento.type === 'IN') newStock += dadosMovimento.qty;
    if (dadosMovimento.type === 'OUT') newStock -= dadosMovimento.qty;
    if (dadosMovimento.type === 'ADJUST') newStock = dadosMovimento.qty;

    if (newStock < 0) throw new Error('Estoque não pode ficar negativo');

    this.products.update(product.id, { stockCurrent: newStock });
    this._movements$.next([movement, ...this._movements$.value]);

    return movement;
  }
}
