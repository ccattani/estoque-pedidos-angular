type Issue = { path: (string | number)[]; message: string };

export class ZodError extends Error {
  constructor(public readonly issues: Issue[]) {
    super('Invalid input');
  }

  flatten() {
    const fieldErrors: Record<string, string[]> = {};
    const formErrors: string[] = [];

    for (const issue of this.issues) {
      const [field] = issue.path;
      if (typeof field === 'string') {
        fieldErrors[field] ??= [];
        fieldErrors[field].push(issue.message);
      } else {
        formErrors.push(issue.message);
      }
    }

    return { formErrors, fieldErrors };
  }
}

export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: ZodError };

export interface ZodType<T> {
  safeParse(input: unknown, path?: (string | number)[]): SafeParseResult<T>;
}

class StringSchema implements ZodType<string> {
  private minLength?: number;
  private minMessage?: string;

  min(length: number, message?: string) {
    this.minLength = length;
    this.minMessage = message;
    return this;
  }

  safeParse(input: unknown, path: (string | number)[] = []): SafeParseResult<string> {
    if (typeof input !== 'string') {
      return { success: false, error: new ZodError([{ path, message: 'Tipo inválido' }]) };
    }
    if (this.minLength !== undefined && input.length < this.minLength) {
      return {
        success: false,
        error: new ZodError([{ path, message: this.minMessage ?? 'Texto curto' }]),
      };
    }
    return { success: true, data: input };
  }
}

class NumberSchema implements ZodType<number> {
  private minValue?: number;
  private minMessage?: string;
  private requirePositive = false;
  private positiveMessage?: string;
  private requireInt = false;
  private intMessage?: string;

  min(value: number, message?: string) {
    this.minValue = value;
    this.minMessage = message;
    return this;
  }

  positive(message?: string) {
    this.requirePositive = true;
    this.positiveMessage = message;
    return this;
  }

  int(message?: string) {
    this.requireInt = true;
    this.intMessage = message;
    return this;
  }

  safeParse(input: unknown, path: (string | number)[] = []): SafeParseResult<number> {
    if (typeof input !== 'number' || Number.isNaN(input)) {
      return { success: false, error: new ZodError([{ path, message: 'Tipo inválido' }]) };
    }
    if (this.minValue !== undefined && input < this.minValue) {
      return {
        success: false,
        error: new ZodError([{ path, message: this.minMessage ?? 'Valor inválido' }]),
      };
    }
    if (this.requirePositive && input <= 0) {
      return {
        success: false,
        error: new ZodError([{ path, message: this.positiveMessage ?? 'Valor inválido' }]),
      };
    }
    if (this.requireInt && !Number.isInteger(input)) {
      return {
        success: false,
        error: new ZodError([{ path, message: this.intMessage ?? 'Valor inválido' }]),
      };
    }
    return { success: true, data: input };
  }
}

class BooleanSchema implements ZodType<boolean> {
  safeParse(input: unknown, path: (string | number)[] = []): SafeParseResult<boolean> {
    if (typeof input !== 'boolean') {
      return { success: false, error: new ZodError([{ path, message: 'Tipo inválido' }]) };
    }
    return { success: true, data: input };
  }
}

class EnumSchema<T extends string> implements ZodType<T> {
  constructor(private values: readonly T[]) {}

  safeParse(input: unknown, path: (string | number)[] = []): SafeParseResult<T> {
    if (typeof input !== 'string' || !this.values.includes(input as T)) {
      return { success: false, error: new ZodError([{ path, message: 'Valor inválido' }]) };
    }
    return { success: true, data: input as T };
  }
}

type Shape = Record<string, ZodType<unknown>>;

class ObjectSchema<T extends Shape> implements ZodType<{ [K in keyof T]: Infer<T[K]> }> {
  private isPartial = false;
  constructor(private shape: T) {}

  partial() {
    this.isPartial = true;
    return this;
  }

  safeParse(input: unknown, path: (string | number)[] = []): SafeParseResult<any> {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      return { success: false, error: new ZodError([{ path, message: 'Objeto inválido' }]) };
    }
    const data: Record<string, unknown> = {};
    const issues: Issue[] = [];

    for (const key of Object.keys(this.shape)) {
      const schema = this.shape[key];
      const value = (input as Record<string, unknown>)[key];
      if (value === undefined) {
        if (!this.isPartial) {
          issues.push({ path: [...path, key], message: 'Campo obrigatório' });
        }
        continue;
      }
      const result = schema.safeParse(value, [...path, key]);
      if (!result.success) {
        issues.push(...result.error.issues);
      } else {
        data[key] = result.data;
      }
    }

    if (issues.length) {
      return { success: false, error: new ZodError(issues) };
    }
    return { success: true, data };
  }
}

class ArraySchema<T> implements ZodType<T[]> {
  private minLength?: number;
  private minMessage?: string;

  constructor(private itemSchema: ZodType<T>) {}

  min(length: number, message?: string) {
    this.minLength = length;
    this.minMessage = message;
    return this;
  }

  safeParse(input: unknown, path: (string | number)[] = []): SafeParseResult<T[]> {
    if (!Array.isArray(input)) {
      return { success: false, error: new ZodError([{ path, message: 'Lista inválida' }]) };
    }

    if (this.minLength !== undefined && input.length < this.minLength) {
      return {
        success: false,
        error: new ZodError([{ path, message: this.minMessage ?? 'Lista inválida' }]),
      };
    }

    const data: T[] = [];
    const issues: Issue[] = [];
    input.forEach((item, index) => {
      const result = this.itemSchema.safeParse(item, [...path, index]);
      if (!result.success) {
        issues.push(...result.error.issues);
      } else {
        data.push(result.data);
      }
    });

    if (issues.length) {
      return { success: false, error: new ZodError(issues) };
    }

    return { success: true, data };
  }
}

type Infer<T> = T extends ZodType<infer U> ? U : never;

export const z = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  enum: <T extends string>(values: readonly T[]) => new EnumSchema(values),
  object: <T extends Shape>(shape: T) => new ObjectSchema(shape),
  array: <T>(schema: ZodType<T>) => new ArraySchema(schema),
};
