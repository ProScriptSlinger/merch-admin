-- Update the product table to support multiple images
-- Change image_url column to image_urls and make it TEXT to store JSON array

ALTER TABLE product 
RENAME COLUMN image_url TO image_urls;

ALTER TABLE product 
ALTER COLUMN image_urls TYPE TEXT;

-- Update existing products to convert single image_url to JSON array format
UPDATE product 
SET image_urls = CASE 
  WHEN image_urls IS NOT NULL AND image_urls != '' 
  THEN '["' || image_urls || '"]'
  ELSE NULL 
END
WHERE image_urls IS NOT NULL;
