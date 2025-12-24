import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
    const initReq = httpMock.expectOne('/api/products');
    initReq.flush([]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should refresh products from the API', () => {
    const payload = [
      {
        id: 'p1',
        name: 'Monitor',
        sku: 'MON-001',
        price: 999.9,
        stockCurrent: 10,
        stockMin: 2,
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];

    service.refresh().subscribe(products => {
      expect(products).toEqual(payload);
    });

    const req = httpMock.expectOne('/api/products');
    expect(req.request.method).toBe('GET');
    req.flush(payload);
    expect(service.snapshot.length).toBe(1);
  });

  it('should create a product', () => {
    const createdPayload = {
      id: 'p2',
      name: 'Monitor',
      sku: 'MON-001',
      price: 999.9,
      stockCurrent: 10,
      stockMin: 2,
      active: true,
      createdAt: new Date().toISOString(),
    };

    service
      .create({
        name: 'Monitor',
        sku: 'MON-001',
        price: 999.9,
        stockCurrent: 10,
        stockMin: 2,
        active: true,
      })
      .subscribe(product => {
        expect(product.id).toBe('p2');
      });

    const req = httpMock.expectOne('/api/products');
    expect(req.request.method).toBe('POST');
    req.flush(createdPayload);
    expect(service.snapshot.length).toBe(1);
  });

  it('should update a product', () => {
    service.refresh().subscribe();
    const refreshReq = httpMock.expectOne('/api/products');
    refreshReq.flush([
      {
        id: 'p1',
        name: 'Produto',
        sku: 'PRO-001',
        price: 10,
        stockCurrent: 1,
        stockMin: 1,
        active: true,
        createdAt: new Date().toISOString(),
      },
    ]);

    service.update('p1', { name: 'UPDATED' }).subscribe();
    const req = httpMock.expectOne('/api/products/p1');
    expect(req.request.method).toBe('PUT');
    req.flush({
      id: 'p1',
      name: 'UPDATED',
      sku: 'PRO-001',
      price: 10,
      stockCurrent: 1,
      stockMin: 1,
      active: true,
      createdAt: new Date().toISOString(),
    });

    expect(service.snapshot[0].name).toBe('UPDATED');
  });

  it('should remove a product', () => {
    service.refresh().subscribe();
    const refreshReq = httpMock.expectOne('/api/products');
    refreshReq.flush([
      {
        id: 'p1',
        name: 'Produto',
        sku: 'PRO-001',
        price: 10,
        stockCurrent: 1,
        stockMin: 1,
        active: true,
        createdAt: new Date().toISOString(),
      },
    ]);

    service.remove('p1').subscribe();
    const req = httpMock.expectOne('/api/products/p1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(service.snapshot.length).toBe(0);
  });
});
