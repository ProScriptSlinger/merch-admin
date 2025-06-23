-- Seed demo orders with QR codes for testing
-- This script creates sample orders that can be scanned with QR codes

-- First, let's create some demo products if they don't exist
INSERT INTO public.products (id, name, description, low_stock_threshold) 
VALUES 
  ('prod-001', 'Campera de Cuero', 'Campera de cuero premium', 5),
  ('prod-002', 'Jeans Slim', 'Jeans slim fit moderno', 8),
  ('prod-003', 'Remera Básica', 'Remera básica de algodón', 15)
ON CONFLICT (id) DO NOTHING;

-- Add demo product images
INSERT INTO public.product_images (id, product_id, image_url, is_primary, sort_order) 
VALUES 
  ('img-001-1', 'prod-001', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', true, 1),
  ('img-001-2', 'prod-001', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop', false, 2),
  ('img-002-1', 'prod-002', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', true, 1),
  ('img-002-2', 'prod-002', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop', false, 2),
  ('img-003-1', 'prod-003', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', true, 1),
  ('img-003-2', 'prod-003', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop', false, 2)
ON CONFLICT (id) DO NOTHING;

-- Create product variants
INSERT INTO public.product_variants (id, product_id, size, quantity, price) 
VALUES 
  ('var-001-s', 'prod-001', 'S', 20, 25000),
  ('var-001-m', 'prod-001', 'M', 25, 25000),
  ('var-001-l', 'prod-001', 'L', 15, 25000),
  ('var-002-38', 'prod-002', '38', 18, 18000),
  ('var-002-40', 'prod-002', '40', 22, 18000),
  ('var-002-42', 'prod-002', '42', 20, 18000),
  ('var-003-s', 'prod-003', 'S', 30, 8500),
  ('var-003-m', 'prod-003', 'M', 35, 8500),
  ('var-003-l', 'prod-003', 'L', 25, 8500)
ON CONFLICT (id) DO NOTHING;

-- Create demo orders with QR codes
INSERT INTO public.orders (id, customer_name, customer_email, qr_code, status, payment_method, total_amount, sale_type) 
VALUES 
  (
    'order-001', 
    'Juan Pérez', 
    'juan.perez@email.com', 
    'ORDER-QR-001', 
    'pending', 
    'Efectivo', 
    43000, 
    'POS'
  ),
  (
    'order-002', 
    'María García', 
    'maria.garcia@email.com', 
    'ORDER-QR-002', 
    'pending', 
    'QR_MercadoPago', 
    63500, 
    'Online'
  ),
  (
    'order-003', 
    'Carlos López', 
    'carlos.lopez@email.com', 
    'ORDER-QR-003', 
    'pending', 
    'Efectivo', 
    47500, 
    'POS'
  )
ON CONFLICT (id) DO NOTHING;

-- Create order items for the first order (Juan Pérez)
INSERT INTO public.order_items (id, order_id, product_variant_id, quantity, unit_price) 
VALUES 
  ('item-001-1', 'order-001', 'var-001-m', 1, 25000),
  ('item-001-2', 'order-001', 'var-002-42', 1, 18000)
ON CONFLICT (id) DO NOTHING;

-- Create order items for the second order (María García)
INSERT INTO public.order_items (id, order_id, product_variant_id, quantity, unit_price) 
VALUES 
  ('item-002-1', 'order-002', 'var-003-l', 2, 8500),
  ('item-002-2', 'order-002', 'var-001-s', 1, 25000),
  ('item-002-3', 'order-002', 'var-002-40', 1, 18000)
ON CONFLICT (id) DO NOTHING;

-- Create order items for the third order (Carlos López)
INSERT INTO public.order_items (id, order_id, product_variant_id, quantity, unit_price) 
VALUES 
  ('item-003-1', 'order-003', 'var-003-s', 3, 8500),
  ('item-003-2', 'order-003', 'var-001-l', 1, 25000)
ON CONFLICT (id) DO NOTHING;

-- Update product variant quantities (reduce stock for orders)
UPDATE public.product_variants SET quantity = quantity - 1 WHERE id = 'var-001-m';
UPDATE public.product_variants SET quantity = quantity - 1 WHERE id = 'var-002-42';
UPDATE public.product_variants SET quantity = quantity - 2 WHERE id = 'var-003-l';
UPDATE public.product_variants SET quantity = quantity - 1 WHERE id = 'var-001-s';
UPDATE public.product_variants SET quantity = quantity - 1 WHERE id = 'var-002-40';
UPDATE public.product_variants SET quantity = quantity - 3 WHERE id = 'var-003-s';
UPDATE public.product_variants SET quantity = quantity - 1 WHERE id = 'var-001-l';

-- Log stock movements for the orders
INSERT INTO public.stock_movements (product_variant_id, movement_type, quantity, previous_quantity, new_quantity, reason) 
VALUES 
  ('var-001-m', 'out', -1, 25, 24, 'Order order-001'),
  ('var-002-42', 'out', -1, 20, 19, 'Order order-001'),
  ('var-003-l', 'out', -2, 25, 23, 'Order order-002'),
  ('var-001-s', 'out', -1, 20, 19, 'Order order-002'),
  ('var-002-40', 'out', -1, 22, 21, 'Order order-002'),
  ('var-003-s', 'out', -3, 30, 27, 'Order order-003'),
  ('var-001-l', 'out', -1, 15, 14, 'Order order-003');

-- Display the created orders
SELECT 
  o.id,
  o.customer_name,
  o.customer_email,
  o.qr_code,
  o.status,
  o.payment_method,
  o.total_amount,
  o.created_at
FROM public.orders o
WHERE o.qr_code IN ('ORDER-QR-001', 'ORDER-QR-002', 'ORDER-QR-003')
ORDER BY o.created_at; 