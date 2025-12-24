import { UUID } from './produto.model';

export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'SHIPPED' | 'CANCELED';

export interface OrderItem {
  productId: UUID;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: UUID;
  number: string;
  customerName: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string; // ISO
}
