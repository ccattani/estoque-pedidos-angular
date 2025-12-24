import { TestBed } from '@angular/core/testing';
import { OrdersService } from './orders.service';
import { ProductsService } from './products.service';

describe('OrdersService', () => {
  let orders: OrdersService;
  let products: ProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    orders = TestBed.inject(OrdersService);
    products = TestBed.inject(ProductsService);
  });

  it('should confirm an order and decrease stock', () => {
    const p = products.snapshot[0];
    products.update(p.id, { stockCurrent: 10 }); // garante estoque conhecido

    const beforeStock = products.getById(p.id)!.stockCurrent;

    const order = orders.createDraft({
      customerName: 'Cliente A',
      items: [{ productId: p.id, qty: 2 }],
    });

    orders.setStatus(order.id, 'CONFIRMED');

    const afterStock = products.getById(p.id)!.stockCurrent;
    expect(afterStock).toBe(beforeStock - 2);

    const updatedOrder = orders.getById(order.id)!;
    expect(updatedOrder.status).toBe('CONFIRMED');
  });

  it('should throw when stock is insufficient and NOT change stock/status', () => {
    const p = products.snapshot[0];
    products.update(p.id, { stockCurrent: 1 }); // estoque insuficiente

    const beforeStock = products.getById(p.id)!.stockCurrent;

    const order = orders.createDraft({
      customerName: 'Cliente B',
      items: [{ productId: p.id, qty: 2 }],
    });

    expect(() => orders.setStatus(order.id, 'CONFIRMED')).toThrow();

    const afterStock = products.getById(p.id)!.stockCurrent;
    expect(afterStock).toBe(beforeStock);

    const updatedOrder = orders.getById(order.id)!;
    expect(updatedOrder.status).toBe('DRAFT'); // não pode confirmar
  });
});
