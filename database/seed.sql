PRAGMA foreign_keys = ON;

INSERT OR REPLACE INTO products (
  id,
  name,
  sku,
  price,
  stock_current,
  stock_min,
  active,
  created_at
) VALUES
  ('p1', 'Teclado Mecânico', 'TEC-001', 299.9, 20, 5, 1, datetime('now')),
  ('p2', 'Mouse Gamer', 'MOU-002', 159.9, 8, 10, 1, datetime('now'));
