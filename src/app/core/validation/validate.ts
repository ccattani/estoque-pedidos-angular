import { ZodType } from 'zod';
import { ApiError } from '../errors/api-error';

export function parseOrThrow<T>(schema: ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new ApiError('VALIDATION_ERROR', 'Payload inválido', parsed.error.flatten());
  }
  return parsed.data;
}
