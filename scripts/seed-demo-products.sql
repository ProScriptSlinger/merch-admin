-- Insertar productos demo
INSERT INTO product (name, category, image_url, low_stock_threshold) VALUES
('Camiseta Evento 2024', 'Apparel', '/placeholder.svg?width=400&height=400', 10),
('Hoodie Oficial', 'Apparel', '/placeholder.svg?width=400&height=400', 5),
('Gorra Snapback', 'Accessories', '/placeholder.svg?width=400&height=400', 8),
('Botella de Agua', 'Accessories', '/placeholder.svg?width=400&height=400', 15),
('Tote Bag', 'Accessories', '/placeholder.svg?width=400&height=400', 12),
('Sudadera Zip', 'Apparel', '/placeholder.svg?width=400&height=400', 6);

-- Insertar variantes para Camiseta Evento 2024
INSERT INTO product_variant (product_id, size, quantity) 
SELECT product_id, 'S', 25 FROM product WHERE name = 'Camiseta Evento 2024'
UNION ALL
SELECT product_id, 'M', 40 FROM product WHERE name = 'Camiseta Evento 2024'
UNION ALL
SELECT product_id, 'L', 35 FROM product WHERE name = 'Camiseta Evento 2024'
UNION ALL
SELECT product_id, 'XL', 20 FROM product WHERE name = 'Camiseta Evento 2024'
UNION ALL
SELECT product_id, 'XXL', 10 FROM product WHERE name = 'Camiseta Evento 2024';

-- Insertar variantes para Hoodie Oficial
INSERT INTO product_variant (product_id, size, quantity) 
SELECT product_id, 'S', 15 FROM product WHERE name = 'Hoodie Oficial'
UNION ALL
SELECT product_id, 'M', 25 FROM product WHERE name = 'Hoodie Oficial'
UNION ALL
SELECT product_id, 'L', 20 FROM product WHERE name = 'Hoodie Oficial'
UNION ALL
SELECT product_id, 'XL', 12 FROM product WHERE name = 'Hoodie Oficial'
UNION ALL
SELECT product_id, 'XXL', 8 FROM product WHERE name = 'Hoodie Oficial';

-- Insertar variantes para Gorra Snapback (solo una talla)
INSERT INTO product_variant (product_id, size, quantity) 
SELECT product_id, 'One Size', 50 FROM product WHERE name = 'Gorra Snapback';

-- Insertar variantes para Botella de Agua (solo una talla)
INSERT INTO product_variant (product_id, size, quantity) 
SELECT product_id, 'One Size', 100 FROM product WHERE name = 'Botella de Agua';

-- Insertar variantes para Tote Bag (solo una talla)
INSERT INTO product_variant (product_id, size, quantity) 
SELECT product_id, 'One Size', 75 FROM product WHERE name = 'Tote Bag';

-- Insertar variantes para Sudadera Zip
INSERT INTO product_variant (product_id, size, quantity) 
SELECT product_id, 'S', 12 FROM product WHERE name = 'Sudadera Zip'
UNION ALL
SELECT product_id, 'M', 18 FROM product WHERE name = 'Sudadera Zip'
UNION ALL
SELECT product_id, 'L', 15 FROM product WHERE name = 'Sudadera Zip'
UNION ALL
SELECT product_id, 'XL', 10 FROM product WHERE name = 'Sudadera Zip'
UNION ALL
SELECT product_id, 'XXL', 5 FROM product WHERE name = 'Sudadera Zip';
