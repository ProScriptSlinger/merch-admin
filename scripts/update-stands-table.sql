-- Update stands table to add missing fields for UI compatibility
-- Add new columns to the stands table

ALTER TABLE public.stands 
ADD COLUMN IF NOT EXISTS operating_hours TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS qr_code_value TEXT UNIQUE;

-- Update the stands table type definitions in the database
-- This will be reflected in the generated types

-- Add comments for documentation
COMMENT ON COLUMN public.stands.operating_hours IS 'Operating hours of the stand (e.g., "9:00 AM - 8:00 PM")';
COMMENT ON COLUMN public.stands.image_url IS 'URL to the stand image';
COMMENT ON COLUMN public.stands.contact_person IS 'Name of the contact person at the stand';
COMMENT ON COLUMN public.stands.contact_phone IS 'Phone number of the contact person';
COMMENT ON COLUMN public.stands.qr_code_value IS 'Unique QR code value for the stand';

-- Create a function to generate QR code values for stands
CREATE OR REPLACE FUNCTION generate_stand_qr_code(stand_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'EVENT_XYZ_STAND_' || UPPER(REPLACE(stand_name, ' ', '_')) || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- Update existing stands with default values if they don't have them
UPDATE public.stands 
SET 
    operating_hours = COALESCE(operating_hours, '9:00 AM - 8:00 PM'),
    image_url = COALESCE(image_url, '/placeholder.svg?width=400&height=200&query=stand'),
    contact_person = COALESCE(contact_person, 'Stand Manager'),
    contact_phone = COALESCE(contact_phone, 'Not specified'),
    qr_code_value = COALESCE(qr_code_value, generate_stand_qr_code(name))
WHERE 
    operating_hours IS NULL 
    OR image_url IS NULL 
    OR contact_person IS NULL 
    OR contact_phone IS NULL 
    OR qr_code_value IS NULL;

-- Create a trigger to automatically generate QR code values for new stands
CREATE OR REPLACE FUNCTION set_stand_qr_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.qr_code_value IS NULL THEN
        NEW.qr_code_value := generate_stand_qr_code(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_set_stand_qr_code ON public.stands;
CREATE TRIGGER trigger_set_stand_qr_code
    BEFORE INSERT ON public.stands
    FOR EACH ROW
    EXECUTE FUNCTION set_stand_qr_code();

-- Create a view for stands with stock information (for UI compatibility)
CREATE OR REPLACE VIEW stands_with_stock AS
SELECT 
    s.id,
    s.name,
    s.location,
    s.description,
    s.operating_hours,
    s.image_url,
    s.contact_person,
    s.contact_phone,
    s.qr_code_value,
    s.is_active,
    s.created_at,
    s.updated_at,
    COALESCE(
        json_agg(
            json_build_object(
                'productId', p.id,
                'productName', p.name,
                'assignedQuantity', ss.quantity,
                'deliveredQuantity', 0 -- This would need to be calculated from orders
            )
        ) FILTER (WHERE ss.id IS NOT NULL),
        '[]'::json
    ) as stock
FROM public.stands s
LEFT JOIN public.stand_stock ss ON s.id = ss.stand_id
LEFT JOIN public.product_variants pv ON ss.product_variant_id = pv.id
LEFT JOIN public.products p ON pv.product_id = p.id
GROUP BY s.id, s.name, s.location, s.description, s.operating_hours, s.image_url, s.contact_person, s.contact_phone, s.qr_code_value, s.is_active, s.created_at, s.updated_at;

-- Grant permissions on the view
GRANT SELECT ON stands_with_stock TO authenticated;
GRANT SELECT ON stands_with_stock TO service_role; 