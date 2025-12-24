import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductsListComponent } from './products-list.component';
import { ProductsService } from '../../../core/services/products.service';

describe('ProductsListComponent', () => {
  it('should render products from service', async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ProductsListComponent],
      providers: [ProductsService],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductsListComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Produtos'); // título
    // como DB tem produtos iniciais, a tabela deve mostrar algum nome
    expect(el.textContent).toMatch(/Teclado|Mouse|Produto/i);
  });
});
