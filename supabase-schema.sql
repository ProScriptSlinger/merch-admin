-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE order_status AS ENUM ('pending', 'delivered', 'cancelled', 'returned');
CREATE TYPE payment_method AS ENUM ('POS', 'Efectivo', 'QR_MercadoPago', 'Transferencia');
CREATE TYPE sale_type AS ENUM ('POS', 'Online');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'staff',
    qr_code TEXT UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0.00,
    total_purchases INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT,
    low_stock_threshold INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product images table (for multiple images per product)
CREATE TABLE public.product_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants table
CREATE TABLE public.product_variants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, size)
);

-- Stands table
CREATE TABLE public.stands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stand stock assignments
CREATE TABLE public.stand_stock (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    stand_id UUID REFERENCES public.stands(id) ON DELETE CASCADE,
    product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(stand_id, product_variant_id)
);

-- Orders table
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    qr_code TEXT UNIQUE,
    status order_status DEFAULT 'pending',
    payment_method payment_method,
    payment_validated BOOLEAN DEFAULT FALSE,
    total_amount DECIMAL(10,2) NOT NULL,
    sale_type sale_type DEFAULT 'POS',
    stand_id UUID REFERENCES public.stands(id) ON DELETE SET NULL,
    delivery_qr_value TEXT,
    delivered_by_stand_id UUID REFERENCES public.stands(id) ON DELETE SET NULL,
    delivery_timestamp TIMESTAMP WITH TIME ZONE,
    return_requested BOOLEAN DEFAULT FALSE,
    return_reason TEXT,
    return_timestamp TIMESTAMP WITH TIME ZONE,
    refund_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock movements log
CREATE TABLE public.stock_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    stand_id UUID REFERENCES public.stands(id) ON DELETE SET NULL,
    movement_type TEXT NOT NULL, -- 'in', 'out', 'transfer', 'adjustment'
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER,
    new_quantity INTEGER,
    reason TEXT,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX idx_product_images_product ON public.product_images(product_id);
CREATE INDEX idx_stand_stock_stand ON public.stand_stock(stand_id);
CREATE INDEX idx_stand_stock_variant ON public.stand_stock(product_variant_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_stock_movements_variant ON public.stock_movements(product_variant_id);
CREATE INDEX idx_stock_movements_stand ON public.stock_movements(stand_id);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stands_updated_at BEFORE UPDATE ON public.stands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stand_stock_updated_at BEFORE UPDATE ON public.stand_stock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stand_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for products (read access for all authenticated users)
CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins and managers can manage products" ON public.products FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- RLS Policies for other tables
CREATE POLICY "Authenticated users can view categories" ON public.categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins and managers can manage categories" ON public.categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "Authenticated users can view product images" ON public.product_images FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins and managers can manage product images" ON public.product_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "Authenticated users can view product variants" ON public.product_variants FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins and managers can manage product variants" ON public.product_variants FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "Authenticated users can view stands" ON public.stands FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins and managers can manage stands" ON public.stands FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "Authenticated users can view stand stock" ON public.stand_stock FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins and managers can manage stand stock" ON public.stand_stock FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "Authenticated users can view orders" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins and managers can manage orders" ON public.orders FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "Authenticated users can view order items" ON public.order_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins and managers can manage order items" ON public.order_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "Authenticated users can view stock movements" ON public.stock_movements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins and managers can manage stock movements" ON public.stock_movements FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Insert sample data
INSERT INTO public.categories (name, description) VALUES
('Outerwear', 'Ropa exterior como camperas y abrigos'),
('Pantalones', 'Jeans, pantalones y shorts'),
('Remeras', 'Remeras básicas y de diseño'),
('Calzado', 'Zapatillas y zapatos'),
('Buzos', 'Buzos con y sin capucha');

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_product_total_quantity(product_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE((
        SELECT SUM(quantity) 
        FROM public.product_variants 
        WHERE product_id = product_uuid
    ), 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update product total quantity
CREATE OR REPLACE FUNCTION update_product_total_quantity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products 
    SET updated_at = NOW()
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product when variants change
CREATE TRIGGER update_product_on_variant_change
    AFTER INSERT OR UPDATE OR DELETE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION update_product_total_quantity(); 