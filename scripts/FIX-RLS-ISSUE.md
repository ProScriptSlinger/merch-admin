# Fix RLS Infinite Recursion Issue

## Problem
The error `infinite recursion detected in policy for relation "users"` occurs because the RLS policies are trying to query the `users` table to check user roles, but that same query triggers the RLS policy again, creating an infinite loop.

## Root Cause
The problematic policies were:
```sql
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
```

This policy tries to query the `users` table to check if the current user is an admin, but that query itself triggers the RLS policy, causing infinite recursion.

## Solution

### Option 1: Quick Fix (Recommended)
Run the SQL script `fix-rls-policies.sql` in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/fix-rls-policies.sql`
4. Execute the script

### Option 2: Manual Fix
If you prefer to fix it manually, run these commands in your Supabase SQL Editor:

```sql
-- Drop the problematic policies
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

-- Create new policies using service role
CREATE POLICY "Service role bypass" ON public.users FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role can manage products" ON public.products FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role can manage categories" ON public.categories FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role can manage product images" ON public.product_images FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role can manage product variants" ON public.product_variants FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role can manage stands" ON public.stands FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role can manage stand stock" ON public.stand_stock FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role can manage orders" ON public.orders FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role can manage order items" ON public.order_items FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role can manage stock movements" ON public.stock_movements FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
```

## What Changed

### Before (Problematic)
- RLS policies used `EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')`
- This caused infinite recursion when querying the users table

### After (Fixed)
- RLS policies use `auth.jwt() ->> 'role' = 'service_role'`
- Service role bypasses RLS entirely for admin operations
- No recursive queries to the users table

## Code Changes Made

### 1. Updated Products Service
The `lib/services/products.ts` file now uses the service role key for admin operations:

```typescript
// Create a service role client for admin operations
const createServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}
```

### 2. Admin Operations Use Service Role
All create, update, and delete operations now use the service role client:
- `createProduct()`
- `updateProduct()`
- `deleteProduct()`

### 3. Read Operations Use Regular Client
Read operations still use the regular client for proper RLS:
- `getProducts()`
- `getProduct()`
- `getCategories()`

## Environment Variables Required

Make sure your `.env.local` file has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing the Fix

1. Run the fix script in Supabase SQL Editor
2. Try to fetch products in your application
3. The infinite recursion error should be resolved
4. Admin operations (create, update, delete) should work properly

## Alternative Approach (If Needed)

If you need more granular role-based access control, you can implement it at the application level:

1. Create a user roles table or use JWT claims
2. Check user roles in your application code
3. Use service role for all database operations
4. Implement authorization logic in your API routes

## Verification

After applying the fix, you can verify the policies are working:

```sql
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
```

This should show the new policies without any recursive queries. 