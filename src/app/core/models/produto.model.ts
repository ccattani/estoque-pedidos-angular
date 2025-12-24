export type UUID = string;

export interface Produto {
  id: UUID;
  name: string;
  sku: string;
  price: number;
  stockCurrent: number;
  stockMin: number;
  active: boolean;
  createdAt: string; // ISO
}
