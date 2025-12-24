import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Produto } from '../../core/models/produto.model';
import { Order } from '../../core/models/pedido.model';
import { ProductsService } from '../../core/services/products.service';
import { OrdersService } from '../../core/services/orders.service';
import { InventoryService } from '../../core/services/inventory.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  products = signal<Produto[]>([]);
  orders = signal<Order[]>([]);
  movementsCount = signal<number>(0);

  // KPIs
  totalProducts = computed(() => this.products().length);
  lowStock = computed(() => this.products().filter(p => p.active && p.stockCurrent < p.stockMin));
  lowStockCount = computed(() => this.lowStock().length);

  ordersTotal = computed(() => this.orders().length);
  ordersDraft = computed(() => this.orders().filter(o => o.status === 'DRAFT').length);
  ordersConfirmed = computed(() => this.orders().filter(o => o.status === 'CONFIRMED').length);

  constructor(
    private productsService: ProductsService,
    private ordersService: OrdersService,
    private inventoryService: InventoryService
  ) {
    this.productsService.products$.subscribe(ps => this.products.set(ps));
    this.ordersService.orders$.subscribe(os => this.orders.set(os));
    this.inventoryService.movements$.subscribe(ms => this.movementsCount.set(ms.length));

    this.productsService.refresh().subscribe();
    this.ordersService.refresh().subscribe();
    this.inventoryService.refresh().subscribe();
  }
}
