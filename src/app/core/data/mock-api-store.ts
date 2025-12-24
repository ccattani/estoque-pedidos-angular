import { DB } from './in-memory-db';
import { uid } from '../utils/id';
import { Produto } from '../models/produto.model';
import { Order, OrderItem } from '../models/pedido.model';
import { Movement, MovementType } from '../models/movement.model';

type CreateProductInput = Omit<Produto, 'id' | 'createdAt'>;
type UpdateProductInput = Partial<Omit<Produto, 'id' | 'createdAt'>>;

type CreateOrderInput = {
  customerName: string;
  items: { productId: string; qty: number }[];
};

type CreateMovementInput = Omit<Movement, 'id' | 'createdAt'>;

const store = {
  products: structuredClone(DB.products),
  orders: structuredClone(DB.orders ?? []),
  movements: structuredClone(DB.movements ?? []),
};

const nowIso = () => new Date().toISOString();

const getProductById = (id: string) => store.products.find(p => p.id === id);

const ensureProduct = (id: string): Produto => {
  const product = getProductById(id);
  if (!product) throw new Error('Produto não encontrado');
  return product;
};

const calcTotal = (items: OrderItem[]) =>
  items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);

const nextOrderNumber = () =>
  `PED-${String(store.orders.length + 1).padStart(5, '0')}`;

const applyMovement = (product: Produto, type: MovementType, qty: number) => {
  let newStock = product.stockCurrent;

  if (type === 'IN') newStock += qty;
  if (type === 'OUT') newStock -= qty;
  if (type === 'ADJUST') newStock = qty;

  if (newStock < 0) throw new Error('Estoque não pode ficar negativo');

  product.stockCurrent = newStock;
};

export const mockApiStore = {
  listProducts(): Produto[] {
    return [...store.products];
  },
  getProduct(id: string): Produto {
    return ensureProduct(id);
  },
  createProduct(input: CreateProductInput): Produto {
    const product: Produto = { ...input, id: uid(), createdAt: nowIso() };
    store.products = [product, ...store.products];
    return product;
  },
  updateProduct(id: string, patch: UpdateProductInput): Produto {
    const product = ensureProduct(id);
    const updated = { ...product, ...patch };
    store.products = store.products.map(p => (p.id === id ? updated : p));
    return updated;
  },
  deleteProduct(id: string): void {
    ensureProduct(id);
    store.products = store.products.filter(p => p.id !== id);
  },
  listOrders(): Order[] {
    return [...store.orders];
  },
  getOrder(id: string): Order {
    const order = store.orders.find(o => o.id === id);
    if (!order) throw new Error('Pedido não encontrado');
    return order;
  },
  createOrderDraft(input: CreateOrderInput): Order {
    const items: OrderItem[] = input.items.map(item => {
      const product = ensureProduct(item.productId);
      return {
        productId: product.id,
        qty: item.qty,
        unitPrice: product.price,
      };
    });

    const order: Order = {
      id: uid(),
      number: nextOrderNumber(),
      customerName: input.customerName,
      status: 'DRAFT',
      items,
      total: calcTotal(items),
      createdAt: nowIso(),
    };

    store.orders = [order, ...store.orders];
    return order;
  },
  confirmOrder(id: string): Order {
    const order = this.getOrder(id);

    if (order.status !== 'CONFIRMED') {
      for (const item of order.items) {
        const product = ensureProduct(item.productId);
        if (product.stockCurrent < item.qty) {
          throw new Error(`Estoque insuficiente: ${product.name}`);
        }
      }

      for (const item of order.items) {
        const product = ensureProduct(item.productId);
        applyMovement(product, 'OUT', item.qty);

        const movement: Movement = {
          id: uid(),
          productId: item.productId,
          type: 'OUT',
          qty: item.qty,
          reason: `Baixa por confirmação do pedido ${order.number}`,
          createdAt: nowIso(),
        };

        store.movements = [movement, ...store.movements];
      }
    }

    const updated = { ...order, status: 'CONFIRMED' as const };
    store.orders = store.orders.map(o => (o.id === id ? updated : o));
    return updated;
  },
  listMovements(): Movement[] {
    return [...store.movements];
  },
  registerMovement(input: CreateMovementInput): Movement {
    const product = ensureProduct(input.productId);
    applyMovement(product, input.type, input.qty);

    const movement: Movement = {
      ...input,
      id: uid(),
      createdAt: nowIso(),
    };

    store.movements = [movement, ...store.movements];
    return movement;
  },
};
