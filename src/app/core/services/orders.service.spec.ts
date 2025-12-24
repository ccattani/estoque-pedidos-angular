import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let orders: OrdersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    orders = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
    const initReq = httpMock.expectOne('/api/orders');
    initReq.flush([]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create a draft order via API', () => {
    const payload = {
      id: 'o1',
      number: 'PED-00001',
      customerName: 'Cliente A',
      status: 'DRAFT',
      items: [{ productId: 'p1', qty: 2, unitPrice: 10 }],
      total: 20,
      createdAt: new Date().toISOString(),
    };

    orders
      .createDraft({
        customerName: 'Cliente A',
        items: [{ productId: 'p1', qty: 2 }],
      })
      .subscribe(order => {
        expect(order.id).toBe('o1');
      });

    const req = httpMock.expectOne('/api/orders');
    expect(req.request.method).toBe('POST');
    req.flush(payload);
    expect(orders.snapshot.length).toBe(1);
  });

  it('should confirm an order via API', () => {
    orders.refresh().subscribe();
    const refreshReq = httpMock.expectOne('/api/orders');
    refreshReq.flush([
      {
        id: 'o1',
        number: 'PED-00001',
        customerName: 'Cliente A',
        status: 'DRAFT',
        items: [{ productId: 'p1', qty: 2, unitPrice: 10 }],
        total: 20,
        createdAt: new Date().toISOString(),
      },
    ]);

    orders.confirm('o1').subscribe(order => {
      expect(order.status).toBe('CONFIRMED');
    });

    const req = httpMock.expectOne('/api/orders/o1/confirm');
    expect(req.request.method).toBe('POST');
    req.flush({
      id: 'o1',
      number: 'PED-00001',
      customerName: 'Cliente A',
      status: 'CONFIRMED',
      items: [{ productId: 'p1', qty: 2, unitPrice: 10 }],
      total: 20,
      createdAt: new Date().toISOString(),
    });

    expect(orders.snapshot[0].status).toBe('CONFIRMED');
  });
});
