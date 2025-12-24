import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../../core/services/orders.service';
import { Order } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss',
})
export class OrdersListComponent {
  orders = signal<Order[]>([]);

  constructor(private ordersService: OrdersService) {
    this.ordersService.orders$.subscribe(os => this.orders.set(os));
  }

  badgeClass(status: Order['status']) {
    return status.toLowerCase();
  }
}
