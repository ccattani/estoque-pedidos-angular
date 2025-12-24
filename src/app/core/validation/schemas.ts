import { z } from 'zod';

export const productCreateSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  sku: z.string().min(2, 'SKU obrigatório'),
  price: z.number().positive('Preço deve ser positivo'),
  stockCurrent: z.number().min(0, 'Estoque atual inválido'),
  stockMin: z.number().min(0, 'Estoque mínimo inválido'),
  active: z.boolean(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const orderDraftSchema = z.object({
  customerName: z.string().min(2, 'Cliente obrigatório'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Produto obrigatório'),
        qty: z.number().int().positive('Quantidade inválida'),
      })
    )
    .min(1, 'Itens obrigatórios'),
});

export const movementSchema = z.object({
  productId: z.string().min(1, 'Produto obrigatório'),
  type: z.enum(['IN', 'OUT', 'ADJUST']),
  qty: z.number().positive('Quantidade inválida'),
  reason: z.string().min(2, 'Motivo obrigatório'),
});
