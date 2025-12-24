import { TestBed } from '@angular/core/testing';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductsService);
  });

  it('should start with initial products', () => {
    expect(service.snapshot.length).toBeGreaterThan(0);
  });

  it('should create a product', () => {
    const before = service.snapshot.length;

    const created = service.create({
      name: 'Monitor',
      sku: 'MON-001',
      price: 999.9,
      stockCurrent: 10,
      stockMin: 2,
      active: true,
    });

    expect(service.snapshot.length).toBe(before + 1);
    expect(service.getById(created.id)?.name).toBe('Monitor');
  });

  it('should update a product', () => {
    const p = service.snapshot[0];
    service.update(p.id, { name: 'UPDATED' });

    expect(service.getById(p.id)?.name).toBe('UPDATED');
  });

  it('should remove a product', () => {
    const p = service.snapshot[0];
    service.remove(p.id);

    expect(service.getById(p.id)).toBeUndefined();
  });
});
