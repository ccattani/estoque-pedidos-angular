import { Movement } from "../models/movement.model";
import { Order } from "../models/pedido.model";
import { Produto } from "../models/produto.model";

export interface InMemoryDB {
  products: Produto[];
  orders: Order[];
  movements: Movement[];
}

export const DB: InMemoryDB = {
  products: [
    {
      id: 'p1',
      name: 'Teclado Mecânico',
      sku: 'TEC-001',
      price: 299.9,
      stockCurrent: 20,
      stockMin: 5,
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'p2',
      name: 'Mouse Gamer',
      sku: 'MOU-002',
      price: 159.9,
      stockCurrent: 8,
      stockMin: 10,
      active: true,
      createdAt: new Date().toISOString(),
    },
  ],
  orders: [],
  movements: [],
};
