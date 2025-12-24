import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { Produto } from '../../../core/models/produto.model';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
})
export class ProductsListComponent {
  q = signal('');
  status = signal<'all' | 'active' | 'inactive'>('all');
  products = signal<Produto[]>([]);

  // lista filtrada
  filtered = computed(() => {
    const query = this.q().trim().toLowerCase();
    const st = this.status();

    return this.products()
      .filter(p => {
        const matchQuery =
          !query ||
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query);

        const matchStatus =
          st === 'all' ||
          (st === 'active' && p.active) ||
          (st === 'inactive' && !p.active);

        return matchQuery && matchStatus;
      });
  });

  constructor(private productsService: ProductsService) {
    // manter sincronizado com BehaviorSubject
    this.productsService.products$.subscribe(ps => this.products.set(ps));
    this.productsService.refresh().subscribe();
  }

  isLowStock(p: Produto) {
    return p.active && p.stockCurrent < p.stockMin;
  }

  remove(id: string) {
    this.productsService.remove(id).subscribe();
  }
}
