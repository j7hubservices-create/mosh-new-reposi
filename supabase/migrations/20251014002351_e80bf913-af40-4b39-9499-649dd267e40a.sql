-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Create storage policies for product images
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND is_admin(auth.uid())
);

-- Add delivery_method to orders table, no default
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_method text NOT NULL;

-- Drop existing invalid constraint if it exists
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS valid_delivery_method;

-- Add correct constraint with allowed delivery methods
ALTER TABLE orders 
ADD CONSTRAINT valid_delivery_method 
CHECK (delivery_method IN ('pickup', 'doorstep', 'park'));
