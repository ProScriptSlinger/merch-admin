-- Fix RLS Policies to resolve infinite recursion issue
-- This script should be run in your Supabase SQL Editor

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins and managers can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins and managers can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins and managers can manage product images" ON public.product_images;
DROP POLICY IF EXISTS "Admins and managers can manage product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admins and managers can manage stands" ON public.stands;
DROP POLICY IF EXISTS "Admins and managers can manage stand stock" ON public.stand_stock;
DROP POLICY IF EXISTS "Admins and managers can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Admins and managers can manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins and managers can manage stock movements" ON public.stock_movements;

-- Create new policies that use service role instead of recursive user queries
-- Allow service role to bypass RLS (for admin operations)
CREATE POLICY "Service role bypass" ON public.users FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for products (read access for all authenticated users)
CREATE POLICY "Service role can manage products" ON public.products FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for other tables
CREATE POLICY "Service role can manage categories" ON public.categories FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage product images" ON public.product_images FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage product variants" ON public.product_variants FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage stands" ON public.stands FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage stand stock" ON public.stand_stock FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage orders" ON public.orders FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage order items" ON public.order_items FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage stock movements" ON public.stock_movements FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Verify the policies are working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname; 