import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Order, OrderItem, OrderStatus } from '../models/pedido.model';
import { uid } from '../utils/id';
import { ProductsService } from './products.service';
import { InventoryService } from './inventory.service';
import { DB } from '../data/in-memory-db';
import { withTransaction } from '../utils/transaction';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly _orders$ = new BehaviorSubject<Order[]>(structuredClone(DB.orders ?? []));
  readonly orders$ = this._orders$.asObservable();

  constructor(
    private products: ProductsService,
    private inventory: InventoryService
  ) {}

  get snapshot(): Order[] {
    return this._orders$.value;
  }

  getById(id: string) {
    return this.snapshot.find(o => o.id === id);
  }

  private calcTotal(items: OrderItem[]) {
    return items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0);
  }

  createDraft(input: { customerName: string; items: { productId: string; qty: number }[] }) {
    const items: OrderItem[] = input.items.map(i => {
      const p = this.products.getById(i.productId);
      if (!p) throw new Error('Produto inválido');
      return { productId: p.id, qty: i.qty, unitPrice: p.price };
    });

    const order: Order = {
      id: uid(),
      number: `PED-${String(this.snapshot.length + 1).padStart(5, '0')}`,
      customerName: input.customerName,
      status: 'DRAFT',
      items,
      total: this.calcTotal(items),
      createdAt: new Date().toISOString(),
    };

    return withTransaction(
      () => ({ orders: structuredClone(this.snapshot) }),
      snapshot => {
        this._orders$.next(snapshot.orders);
      },
      () => {
        this._orders$.next([order, ...this.snapshot]);
        return order;
      }
    );
  }

  confirm(id: string) {
    return this.setStatus(id, 'CONFIRMED');
  }

  setStatus(id: string, status: OrderStatus) {
    return withTransaction(
      () => ({
        orders: structuredClone(this.snapshot),
        products: structuredClone(this.products.snapshot),
        movements: structuredClone(this.inventory.snapshot),
      }),
      snapshot => {
        this._orders$.next(snapshot.orders);
        this.products.restore(snapshot.products);
        this.inventory.restore(snapshot.movements);
      },
      () => {
        const order = this.getById(id);
        if (!order) throw new Error('Pedido não encontrado');

        // regra: confirmar dá baixa no estoque
        if (order.status !== 'CONFIRMED' && status === 'CONFIRMED') {
          // valida estoque antes
          for (const it of order.items) {
            const p = this.products.getById(it.productId);
            if (!p) throw new Error('Produto inválido');
            if (p.stockCurrent < it.qty) throw new Error(`Estoque insuficiente: ${p.name}`);
          }

          // baixa
          for (const it of order.items) {
            this.inventory.registerMovement({
              productId: it.productId,
              type: 'OUT',
              qty: it.qty,
              reason: `Baixa por confirmação do pedido ${order.number}`,
            });
          }
        }

        const next = this.snapshot.map(o => (o.id === id ? { ...o, status } : o));
        this._orders$.next(next);
      }
    );
  }
}
