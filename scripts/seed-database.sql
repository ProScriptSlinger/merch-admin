-- Seed Database Script for Merch Admin
-- This script populates the database with sample data for testing and development

-- Clear existing data (optional - uncomment if you want to start fresh)
-- DELETE FROM public.stock_movements;
-- DELETE FROM public.order_items;
-- DELETE FROM public.orders;
-- DELETE FROM public.stand_stock;
-- DELETE FROM public.product_variants;
-- DELETE FROM public.product_images;
-- DELETE FROM public.products;
-- DELETE FROM public.stands;
-- DELETE FROM public.categories;

-- Insert sample categories (if not already inserted)
INSERT INTO public.categories (name, description) VALUES
('Outerwear', 'Ropa exterior como camperas y abrigos'),
('Pantalones', 'Jeans, pantalones y shorts'),
('Remeras', 'Remeras básicas y de diseño'),
('Calzado', 'Zapatillas y zapatos'),
('Buzos', 'Buzos con y sin capucha'),
('Accesorios', 'Gorras, mochilas y otros accesorios')
ON CONFLICT (name) DO NOTHING;

-- Insert sample stands
INSERT INTO public.stands (name, location, description, is_active) VALUES
('Stand Principal', 'Entrada Principal', 'Stand principal en la entrada del evento', true),
('Stand VIP', 'Área VIP', 'Stand exclusivo para área VIP', true),
('Stand Móvil 1', 'Zona Norte', 'Stand móvil en la zona norte', true),
('Stand Móvil 2', 'Zona Sur', 'Stand móvil en la zona sur', true),
('Stand Backstage', 'Backstage', 'Stand para artistas y staff', true),
('Stand Online', 'Virtual', 'Pedidos online y delivery', true)
ON CONFLICT DO NOTHING;

-- Insert sample products with variants
-- Product 1: Campera de Cuero
INSERT INTO public.products (name, category_id, description, low_stock_threshold) VALUES
('Campera de Cuero', 
 (SELECT id FROM public.categories WHERE name = 'Outerwear'), 
 'Campera de cuero premium con diseño exclusivo del evento', 
 5)
RETURNING id INTO product_id_1;

-- Product 2: Jeans Slim
INSERT INTO public.products (name, category_id, description, low_stock_threshold) VALUES
('Jeans Slim', 
 (SELECT id FROM public.categories WHERE name = 'Pantalones'), 
 'Jeans slim fit con parche del evento', 
 8)
RETURNING id INTO product_id_2;

-- Product 3: Remera Básica
INSERT INTO public.products (name, category_id, description, low_stock_threshold) VALUES
('Remera Básica', 
 (SELECT id FROM public.categories WHERE name = 'Remeras'), 
 'Remera básica 100% algodón con logo del evento', 
 15)
RETURNING id INTO product_id_3;

-- Product 4: Zapatillas Deportivas
INSERT INTO public.products (name, category_id, description, low_stock_threshold) VALUES
('Zapatillas Deportivas', 
 (SELECT id FROM public.categories WHERE name = 'Calzado'), 
 'Zapatillas deportivas con diseño exclusivo', 
 10)
RETURNING id INTO product_id_4;

-- Product 5: Buzo con Capucha
INSERT INTO public.products (name, category_id, description, low_stock_threshold) VALUES
('Buzo con Capucha', 
 (SELECT id FROM public.categories WHERE name = 'Buzos'), 
 'Buzo con capucha y logo bordado del evento', 
 12)
RETURNING id INTO product_id_5;

-- Product 6: Gorra Snapback
INSERT INTO public.products (name, category_id, description, low_stock_threshold) VALUES
('Gorra Snapback', 
 (SELECT id FROM public.categories WHERE name = 'Accesorios'), 
 'Gorra snapback con logo del evento', 
 20)
RETURNING id INTO product_id_6;

-- Insert product variants for each product
-- Campera de Cuero variants
INSERT INTO public.product_variants (product_id, size, quantity, price) VALUES
((SELECT id FROM public.products WHERE name = 'Campera de Cuero'), 'S', 15, 45000.00),
((SELECT id FROM public.products WHERE name = 'Campera de Cuero'), 'M', 25, 45000.00),
((SELECT id FROM public.products WHERE name = 'Campera de Cuero'), 'L', 20, 45000.00),
((SELECT id FROM public.products WHERE name = 'Campera de Cuero'), 'XL', 12, 45000.00);

-- Jeans Slim variants
INSERT INTO public.product_variants (product_id, size, quantity, price) VALUES
((SELECT id FROM public.products WHERE name = 'Jeans Slim'), '38', 18, 28000.00),
((SELECT id FROM public.products WHERE name = 'Jeans Slim'), '40', 22, 28000.00),
((SELECT id FROM public.products WHERE name = 'Jeans Slim'), '42', 25, 28000.00),
((SELECT id FROM public.products WHERE name = 'Jeans Slim'), '44', 15, 28000.00);

-- Remera Básica variants
INSERT INTO public.product_variants (product_id, size, quantity, price) VALUES
((SELECT id FROM public.products WHERE name = 'Remera Básica'), 'S', 30, 12000.00),
((SELECT id FROM public.products WHERE name = 'Remera Básica'), 'M', 40, 12000.00),
((SELECT id FROM public.products WHERE name = 'Remera Básica'), 'L', 35, 12000.00),
((SELECT id FROM public.products WHERE name = 'Remera Básica'), 'XL', 25, 12000.00);

-- Zapatillas Deportivas variants
INSERT INTO public.product_variants (product_id, size, quantity, price) VALUES
((SELECT id FROM public.products WHERE name = 'Zapatillas Deportivas'), '39', 12, 35000.00),
((SELECT id FROM public.products WHERE name = 'Zapatillas Deportivas'), '40', 15, 35000.00),
((SELECT id FROM public.products WHERE name = 'Zapatillas Deportivas'), '41', 18, 35000.00),
((SELECT id FROM public.products WHERE name = 'Zapatillas Deportivas'), '42', 20, 35000.00),
((SELECT id FROM public.products WHERE name = 'Zapatillas Deportivas'), '43', 15, 35000.00);

-- Buzo con Capucha variants
INSERT INTO public.product_variants (product_id, size, quantity, price) VALUES
((SELECT id FROM public.products WHERE name = 'Buzo con Capucha'), 'S', 20, 25000.00),
((SELECT id FROM public.products WHERE name = 'Buzo con Capucha'), 'M', 25, 25000.00),
((SELECT id FROM public.products WHERE name = 'Buzo con Capucha'), 'L', 22, 25000.00),
((SELECT id FROM public.products WHERE name = 'Buzo con Capucha'), 'XL', 18, 25000.00);

-- Gorra Snapback variants
INSERT INTO public.product_variants (product_id, size, quantity, price) VALUES
((SELECT id FROM public.products WHERE name = 'Gorra Snapback'), 'Única', 50, 8000.00);

-- Insert sample product images
INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
-- Campera de Cuero images
((SELECT id FROM public.products WHERE name = 'Campera de Cuero'), '/placeholder.svg?width=400&height=400&text=Campera+Cuero+1', true, 0),
((SELECT id FROM public.products WHERE name = 'Campera de Cuero'), '/placeholder.svg?width=400&height=400&text=Campera+Cuero+2', false, 1),
((SELECT id FROM public.products WHERE name = 'Campera de Cuero'), '/placeholder.svg?width=400&height=400&text=Campera+Cuero+3', false, 2),

-- Jeans Slim images
((SELECT id FROM public.products WHERE name = 'Jeans Slim'), '/placeholder.svg?width=400&height=400&text=Jeans+Slim+1', true, 0),
((SELECT id FROM public.products WHERE name = 'Jeans Slim'), '/placeholder.svg?width=400&height=400&text=Jeans+Slim+2', false, 1),

-- Remera Básica images
((SELECT id FROM public.products WHERE name = 'Remera Básica'), '/placeholder.svg?width=400&height=400&text=Remera+Basica+1', true, 0),
((SELECT id FROM public.products WHERE name = 'Remera Básica'), '/placeholder.svg?width=400&height=400&text=Remera+Basica+2', false, 1),

-- Zapatillas Deportivas images
((SELECT id FROM public.products WHERE name = 'Zapatillas Deportivas'), '/placeholder.svg?width=400&height=400&text=Zapatillas+1', true, 0),
((SELECT id FROM public.products WHERE name = 'Zapatillas Deportivas'), '/placeholder.svg?width=400&height=400&text=Zapatillas+2', false, 1),
((SELECT id FROM public.products WHERE name = 'Zapatillas Deportivas'), '/placeholder.svg?width=400&height=400&text=Zapatillas+3', false, 2),

-- Buzo con Capucha images
((SELECT id FROM public.products WHERE name = 'Buzo con Capucha'), '/placeholder.svg?width=400&height=400&text=Buzo+Capucha+1', true, 0),
((SELECT id FROM public.products WHERE name = 'Buzo con Capucha'), '/placeholder.svg?width=400&height=400&text=Buzo+Capucha+2', false, 1),

-- Gorra Snapback images
((SELECT id FROM public.products WHERE name = 'Gorra Snapback'), '/placeholder.svg?width=400&height=400&text=Gorra+1', true, 0);

-- Insert sample stand stock assignments
INSERT INTO public.stand_stock (stand_id, product_variant_id, quantity) VALUES
-- Stand Principal stock
((SELECT id FROM public.stands WHERE name = 'Stand Principal'), 
 (SELECT pv.id FROM public.product_variants pv 
  JOIN public.products p ON p.id = pv.product_id 
  WHERE p.name = 'Campera de Cuero' AND pv.size = 'M'), 10),
((SELECT id FROM public.stands WHERE name = 'Stand Principal'), 
 (SELECT pv.id FROM public.product_variants pv 
  JOIN public.products p ON p.id = pv.product_id 
  WHERE p.name = 'Remera Básica' AND pv.size = 'L'), 15),
((SELECT id FROM public.stands WHERE name = 'Stand Principal'), 
 (SELECT pv.id FROM public.product_variants pv 
  JOIN public.products p ON p.id = pv.product_id 
  WHERE p.name = 'Gorra Snapback' AND pv.size = 'Única'), 20),

-- Stand VIP stock
((SELECT id FROM public.stands WHERE name = 'Stand VIP'), 
 (SELECT pv.id FROM public.product_variants pv 
  JOIN public.products p ON p.id = pv.product_id 
  WHERE p.name = 'Campera de Cuero' AND pv.size = 'L'), 5),
((SELECT id FROM public.stands WHERE name = 'Stand VIP'), 
 (SELECT pv.id FROM public.product_variants pv 
  JOIN public.products p ON p.id = pv.product_id 
  WHERE p.name = 'Zapatillas Deportivas' AND pv.size = '42'), 8),

-- Stand Móvil 1 stock
((SELECT id FROM public.stands WHERE name = 'Stand Móvil 1'), 
 (SELECT pv.id FROM public.product_variants pv 
  JOIN public.products p ON p.id = pv.product_id 
  WHERE p.name = 'Remera Básica' AND pv.size = 'M'), 12),
((SELECT id FROM public.stands WHERE name = 'Stand Móvil 1'), 
 (SELECT pv.id FROM public.product_variants pv 
  JOIN public.products p ON p.id = pv.product_id 
  WHERE p.name = 'Buzo con Capucha' AND pv.size = 'M'), 8);

-- Insert sample orders (these will be created when users sign up and place orders)
-- Note: Orders require user_id, so they'll be created dynamically when users interact with the system

-- Insert sample stock movements
INSERT INTO public.stock_movements (product_variant_id, stand_id, movement_type, quantity, previous_quantity, new_quantity, reason) VALUES
-- Initial stock movements for Stand Principal
((SELECT pv.id FROM public.product_variants pv 
  JOIN public.products p ON p.id = pv.product_id 
  WHERE p.name = 'Campera de Cuero' AND pv.size = 'M'), 
 (SELECT id FROM public.stands WHERE name = 'Stand Principal'),
 'in', 10, 0, 10, 'Initial stock assignment'),

((SELECT pv.id FROM public.product_variants pv 
  JOIN public.products p ON p.id = pv.product_id 
  WHERE p.name = 'Remera Básica' AND pv.size = 'L'), 
 (SELECT id FROM public.stands WHERE name = 'Stand Principal'),
 'in', 15, 0, 15, 'Initial stock assignment'),

-- Initial stock movements for Stand VIP
((SELECT pv.id FROM public.product_variants pv 
  JOIN public.products p ON p.id = pv.product_id 
  WHERE p.name = 'Campera de Cuero' AND pv.size = 'L'), 
 (SELECT id FROM public.stands WHERE name = 'Stand VIP'),
 'in', 5, 0, 5, 'Initial stock assignment'),

((SELECT pv.id FROM public.product_variants pv 
  JOIN public.products p ON p.id = pv.product_id 
  WHERE p.name = 'Zapatillas Deportivas' AND pv.size = '42'), 
 (SELECT id FROM public.stands WHERE name = 'Stand VIP'),
 'in', 8, 0, 8, 'Initial stock assignment');

-- Create a sample admin user (you'll need to replace the UUID with an actual user ID from auth.users)
-- This is commented out because it requires a real user ID from Supabase Auth
/*
INSERT INTO public.users (id, email, full_name, role, qr_code, balance, total_purchases) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@merchadmin.com', 'Admin User', 'admin', 'QR_ADMIN_001', 0.00, 0)
ON CONFLICT (id) DO NOTHING;
*/

-- Display summary of seeded data
SELECT 'Categories' as table_name, COUNT(*) as count FROM public.categories
UNION ALL
SELECT 'Stands', COUNT(*) FROM public.stands
UNION ALL
SELECT 'Products', COUNT(*) FROM public.products
UNION ALL
SELECT 'Product Variants', COUNT(*) FROM public.product_variants
UNION ALL
SELECT 'Product Images', COUNT(*) FROM public.product_images
UNION ALL
SELECT 'Stand Stock', COUNT(*) FROM public.stand_stock
UNION ALL
SELECT 'Stock Movements', COUNT(*) FROM public.stock_movements
ORDER BY table_name; 