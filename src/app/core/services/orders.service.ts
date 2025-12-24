import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Order, OrderItem, OrderStatus } from '../models/pedido.model';
import { uid } from '../utils/id';
import { ProductsService } from './products.service';
import { InventoryService } from './inventory.service';
import { ApiError } from '../errors/api-error';
import { orderDraftSchema } from '../validation/schemas';
import { parseOrThrow } from '../validation/validate';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly _orders$ = new BehaviorSubject<Order[]>([]);
  readonly orders$ = this._orders$.asObservable();

  constructor(
    private products: ProductsService,
    private inventory: InventoryService
  ) {}

  get snapshot(): Order[] {
    return this._orders$.value;
  }

  // GET /orders
  list(): Order[] {
    return this.snapshot;
  }

  // GET /orders/:id
  getById(id: string) {
    return this.snapshot.find(o => o.id === id);
  }

  getByIdOrThrow(id: string): Order {
    const order = this.getById(id);
    if (!order) throw new ApiError('NOT_FOUND', 'Pedido não encontrado');
    return order;
  }

  private calcTotal(items: OrderItem[]) {
    return items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0);
  }

  // POST /orders (draft)
  createDraft(input: { customerName: string; items: { productId: string; qty: number }[] }) {
    const payload = parseOrThrow(orderDraftSchema, input);
    const items: OrderItem[] = payload.items.map(i => {
      const p = this.products.getById(i.productId);
      if (!p) throw new ApiError('NOT_FOUND', 'Produto inválido', { productId: i.productId });
      return { productId: p.id, qty: i.qty, unitPrice: p.price };
    });

    const order: Order = {
      id: uid(),
      number: `PED-${String(this.snapshot.length + 1).padStart(5, '0')}`,
      customerName: payload.customerName,
      status: 'DRAFT',
      items,
      total: this.calcTotal(items),
      createdAt: new Date().toISOString(),
    };

    this._orders$.next([order, ...this.snapshot]);
    return order;
  }

  setStatus(id: string, status: OrderStatus) {
    const order = this.getByIdOrThrow(id);

    // regra: confirmar dá baixa no estoque
    if (order.status !== 'CONFIRMED' && status === 'CONFIRMED') {
      // valida estoque antes
      for (const it of order.items) {
        const p = this.products.getById(it.productId);
        if (!p) throw new ApiError('NOT_FOUND', 'Produto inválido', { productId: it.productId });
        if (p.stockCurrent < it.qty) {
          throw new ApiError('INSUFFICIENT_STOCK', `Estoque insuficiente: ${p.name}`, {
            productId: p.id,
            available: p.stockCurrent,
            required: it.qty,
          });
        }
      }

      // baixa
      for (const it of order.items) {
        this.inventory.register({
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

  // POST /orders/:id/confirm
  confirm(id: string) {
    this.setStatus(id, 'CONFIRMED');
  }
}
