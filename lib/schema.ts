// lib/schema.ts
// This file defines the database schema using raw SQL.
// It's kept simple for demonstration purposes with @neondatabase/serverless.

export namespace schema {
  // Define your table schemas here using raw SQL types.
  // Example:
  // export const products = `
  //   CREATE TABLE IF NOT EXISTS products (
  //     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  //     name VARCHAR(255) NOT NULL,
  //     description TEXT,
  //     price DECIMAL(10, 2) NOT NULL
  //   );
  // `;

  // Product table schema
  export const Product = `
    CREATE TABLE IF NOT EXISTS Product (
      product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255),
      size VARCHAR(50),
      image_url VARCHAR(255),
      total_quantity INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `

  // StandStock table schema (example, adjust as needed)
  export const StandStock = `
    CREATE TABLE IF NOT EXISTS StandStock (
      stand_id UUID NOT NULL,
      product_id UUID NOT NULL,
      assigned_quantity INTEGER NOT NULL DEFAULT 0,
      delivered_quantity INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (stand_id, product_id)
      --FOREIGN KEY (product_id) REFERENCES Product(product_id) -- Uncomment if you create a separate Stands table
    );
  `

  // SaleItem table schema (example, adjust as needed)
  export const SaleItem = `
    CREATE TABLE IF NOT EXISTS SaleItem (
      sale_id UUID NOT NULL,
      product_id UUID NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (sale_id, product_id)
      --FOREIGN KEY (product_id) REFERENCES Product(product_id) -- Uncomment if you create a separate Sales table
    );
  `

  // Add other table schemas as needed (Stands, Sales, etc.)
}
