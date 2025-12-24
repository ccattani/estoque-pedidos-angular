import { UUID } from "./produto.model";

export type MovementType = 'IN' | 'OUT' | 'ADJUST';

export interface Movement {
  id: UUID;
  productId: UUID;
  type: MovementType;
  qty: number;
  reason: string;
  createdAt: string; // ISO
}
