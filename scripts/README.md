# Database Seeding Scripts

This directory contains scripts to populate your Supabase database with sample data for testing and development.

## Files

- `seed-database.sql` - Full SQL script with all sample data
- `seed-database-simple.sql` - Simplified SQL script (recommended)
- `seed.js` - Node.js script to run the seeding programmatically

## Quick Start

### Option 1: Using npm script (Recommended)

1. Make sure your `.env.local` file has the required Supabase environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Run the seed script:
   ```bash
   npm run seed
   ```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `seed-database-simple.sql`
4. Execute the script

### Option 3: Using Supabase CLI

1. Install Supabase CLI if you haven't already
2. Run the SQL script:
   ```bash
   supabase db reset --linked
   # Then run the seed script in the SQL editor
   ```

## What Gets Seeded

The script creates the following sample data:

### Categories (6)
- Outerwear (Ropa exterior como camperas y abrigos)
- Pantalones (Jeans, pantalones y shorts)
- Remeras (Remeras básicas y de diseño)
- Calzado (Zapatillas y zapatos)
- Buzos (Buzos con y sin capucha)
- Accesorios (Gorras, mochilas y otros accesorios)

### Stands (6)
- Stand Principal (Entrada Principal)
- Stand VIP (Área VIP)
- Stand Móvil 1 (Zona Norte)
- Stand Móvil 2 (Zona Sur)
- Stand Backstage (Backstage)
- Stand Online (Virtual)

### Products (6)
- Campera de Cuero - Premium leather jacket
- Jeans Slim - Slim fit jeans
- Remera Básica - Basic t-shirt
- Zapatillas Deportivas - Sports shoes
- Buzo con Capucha - Hooded sweatshirt
- Gorra Snapback - Snapback cap

### Product Variants
Each product includes multiple size variants with different quantities and prices.

### Product Images
Sample product images using placeholder URLs that can be replaced with real images later.

### Stand Stock
Sample stock assignments for different stands.

### Stock Movements
Initial stock movement records for tracking inventory changes.

## Troubleshooting

### Common Issues

1. **Environment Variables Missing**
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `.env.local`

2. **Permission Errors**
   - Make sure you're using the service role key, not the anon key
   - Verify your RLS policies allow the operations

3. **Duplicate Key Errors**
   - The script uses `ON CONFLICT DO NOTHING` to handle duplicates
   - If you want to start fresh, uncomment the DELETE statements in the SQL file

4. **Foreign Key Constraint Errors**
   - Make sure the database schema is properly set up first
   - Run the schema creation script before seeding

### Resetting the Database

To start with a clean database:

1. Drop all tables (if needed):
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```

2. Re-run the schema creation script
3. Run the seed script

## Customization

You can modify the seed data by editing the SQL files:

- `seed-database-simple.sql` - Edit the INSERT statements to add/remove/modify data
- `seed.js` - Modify the JavaScript arrays to change the data structure

## Notes

- The script is idempotent - you can run it multiple times safely
- Product images use placeholder URLs that should be replaced with real images
- Prices are in cents (e.g., 45000 = $450.00)
- The script doesn't create users - those are created through the authentication system

# Database Scripts

This directory contains SQL scripts for database setup and updates.

## Stands Table Update

### `update-stands-table.sql`

This script updates the `stands` table to include additional fields required by the UI:

#### New Fields Added:
- `operating_hours` - Operating hours of the stand (e.g., "9:00 AM - 8:00 PM")
- `image_url` - URL to the stand image
- `contact_person` - Name of the contact person at the stand
- `contact_phone` - Phone number of the contact person
- `qr_code_value` - Unique QR code value for the stand

#### Features:
- Automatically generates QR code values for new stands
- Updates existing stands with default values
- Creates a view for stands with stock information
- Includes proper indexing and permissions

### How to Run:

1. **Via Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `update-stands-table.sql`
   - Click "Run" to execute the script

2. **Via Supabase CLI:**
   ```bash
   supabase db reset --linked
   # or
   supabase db push --linked
   ```

3. **Via psql:**
   ```bash
   psql -h your-db-host -U your-username -d your-database -f update-stands-table.sql
   ```

### Integration with Frontend

After running the SQL script, the stands page (`app/dashboard/stands/page.tsx`) will be fully integrated with Supabase and support:

- ✅ Create new stands
- ✅ Edit existing stands
- ✅ Delete stands (soft delete)
- ✅ Assign product stock to stands
- ✅ Generate and download QR codes
- ✅ Search and filter stands
- ✅ Expandable stand details

### Type Definitions

The following types have been added to `lib/types.ts`:
- `Stand` - Complete stand interface with all fields
- `StandStock` - Stock assignment interface

### Services

A new service file `lib/services/stands.ts` provides:
- `getStands()` - Fetch all stands with stock information
- `getStandById()` - Fetch a single stand
- `createStand()` - Create a new stand
- `updateStand()` - Update an existing stand
- `deleteStand()` - Soft delete a stand
- `assignStockToStand()` - Assign product stock to a stand
- `getProductVariantsForAssignment()` - Get products for stock assignment

### Database Schema Changes

The stands table now includes:
```sql
CREATE TABLE public.stands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    description TEXT,
    operating_hours TEXT,
    image_url TEXT,
    contact_person TEXT,
    contact_phone TEXT,
    qr_code_value TEXT UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Notes

- QR codes are automatically generated using the pattern: `EVENT_XYZ_STAND_{STAND_NAME}_{TIMESTAMP}`
- Stands are soft-deleted (is_active = false) rather than hard-deleted
- Stock assignments are managed through the `stand_stock` junction table
- The view `stands_with_stock` provides a convenient way to get stands with their stock information 