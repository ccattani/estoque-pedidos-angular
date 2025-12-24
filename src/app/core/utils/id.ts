export function uid(): string {
  // bom o suficiente p/ mock local
  return crypto.randomUUID?.() ?? Math.random().toString(16).slice(2) + Date.now().toString(16);
}
