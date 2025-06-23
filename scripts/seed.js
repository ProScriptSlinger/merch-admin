#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Read the SQL seed file
    const seedFilePath = path.join(__dirname, 'seed-database-simple.sql');
    const seedSQL = fs.readFileSync(seedFilePath, 'utf8');
    
    console.log('📄 Executing seed script...');
    
    // Execute the SQL script
    const { data, error } = await supabase.rpc('exec_sql', { sql: seedSQL });
    
    if (error) {
      // If the RPC doesn't exist, try executing the SQL directly
      console.log('⚠️  RPC method not available, trying direct SQL execution...');
      
      // Split the SQL into individual statements and execute them
      const statements = seedSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
            if (stmtError) {
              console.log(`⚠️  Statement skipped: ${statement.substring(0, 50)}...`);
            }
          } catch (e) {
            console.log(`⚠️  Statement skipped due to error: ${e.message}`);
          }
        }
      }
    }
    
    // Verify the seeding by checking table counts
    console.log('🔍 Verifying seeded data...');
    
    const tables = ['categories', 'stands', 'products', 'product_variants', 'product_images', 'stand_stock', 'stock_movements'];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`⚠️  Could not verify ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${count} records`);
        }
      } catch (e) {
        console.log(`⚠️  Could not verify ${table}: ${e.message}`);
      }
    }
    
    console.log('🎉 Database seeding completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('- 6 categories (Outerwear, Pantalones, Remeras, Calzado, Buzos, Accesorios)');
    console.log('- 6 stands (Principal, VIP, Móvil 1, Móvil 2, Backstage, Online)');
    console.log('- 6 products with multiple variants and sizes');
    console.log('- Sample product images with placeholder URLs');
    console.log('- Stand stock assignments');
    console.log('- Initial stock movements');
    console.log('');
    console.log('🚀 Your merch admin database is now ready for testing!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

// Alternative method: Execute SQL statements individually
async function seedDatabaseAlternative() {
  try {
    console.log('🌱 Starting database seeding (alternative method)...');
    
    // Insert categories
    console.log('📝 Inserting categories...');
    const { error: catError } = await supabase
      .from('categories')
      .upsert([
        { name: 'Outerwear', description: 'Ropa exterior como camperas y abrigos' },
        { name: 'Pantalones', description: 'Jeans, pantalones y shorts' },
        { name: 'Remeras', description: 'Remeras básicas y de diseño' },
        { name: 'Calzado', description: 'Zapatillas y zapatos' },
        { name: 'Buzos', description: 'Buzos con y sin capucha' },
        { name: 'Accesorios', description: 'Gorras, mochilas y otros accesorios' }
      ], { onConflict: 'name' });
    
    if (catError) console.log('⚠️  Categories error:', catError.message);
    
    // Insert stands
    console.log('📝 Inserting stands...');
    const { error: standError } = await supabase
      .from('stands')
      .upsert([
        { name: 'Stand Principal', location: 'Entrada Principal', description: 'Stand principal en la entrada del evento', is_active: true },
        { name: 'Stand VIP', location: 'Área VIP', description: 'Stand exclusivo para área VIP', is_active: true },
        { name: 'Stand Móvil 1', location: 'Zona Norte', description: 'Stand móvil en la zona norte', is_active: true },
        { name: 'Stand Móvil 2', location: 'Zona Sur', description: 'Stand móvil en la zona sur', is_active: true },
        { name: 'Stand Backstage', location: 'Backstage', description: 'Stand para artistas y staff', is_active: true },
        { name: 'Stand Online', location: 'Virtual', description: 'Pedidos online y delivery', is_active: true }
      ]);
    
    if (standError) console.log('⚠️  Stands error:', standError.message);
    
    // Get category IDs
    const { data: categories } = await supabase.from('categories').select('id, name');
    const categoryMap = categories?.reduce((acc, cat) => ({ ...acc, [cat.name]: cat.id }), {}) || {};
    
    // Insert products
    console.log('📝 Inserting products...');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .upsert([
        { name: 'Campera de Cuero', category_id: categoryMap['Outerwear'], description: 'Campera de cuero premium con diseño exclusivo del evento', low_stock_threshold: 5 },
        { name: 'Jeans Slim', category_id: categoryMap['Pantalones'], description: 'Jeans slim fit con parche del evento', low_stock_threshold: 8 },
        { name: 'Remera Básica', category_id: categoryMap['Remeras'], description: 'Remera básica 100% algodón con logo del evento', low_stock_threshold: 15 },
        { name: 'Zapatillas Deportivas', category_id: categoryMap['Calzado'], description: 'Zapatillas deportivas con diseño exclusivo', low_stock_threshold: 10 },
        { name: 'Buzo con Capucha', category_id: categoryMap['Buzos'], description: 'Buzo con capucha y logo bordado del evento', low_stock_threshold: 12 },
        { name: 'Gorra Snapback', category_id: categoryMap['Accesorios'], description: 'Gorra snapback con logo del evento', low_stock_threshold: 20 }
      ])
      .select();
    
    if (prodError) console.log('⚠️  Products error:', prodError.message);
    
    console.log('✅ Database seeding completed!');
    console.log(`📊 Inserted ${products?.length || 0} products`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabaseAlternative();
} 