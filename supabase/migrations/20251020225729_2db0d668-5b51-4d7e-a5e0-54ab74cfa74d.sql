-- Add slug and original_price columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS original_price numeric;

-- Create index on slug for better performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- Function to generate slug from product name
CREATE OR REPLACE FUNCTION public.generate_slug(text_input text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  slug_output text;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special characters
  slug_output := lower(trim(text_input));
  slug_output := regexp_replace(slug_output, '[^a-z0-9\s-]', '', 'g');
  slug_output := regexp_replace(slug_output, '\s+', '-', 'g');
  slug_output := regexp_replace(slug_output, '-+', '-', 'g');
  RETURN slug_output;
END;
$$;

-- Trigger to auto-generate slug if not provided
CREATE OR REPLACE FUNCTION public.set_product_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
    -- Add timestamp suffix if slug exists
    IF EXISTS (SELECT 1 FROM products WHERE slug = NEW.slug AND id != NEW.id) THEN
      NEW.slug := NEW.slug || '-' || floor(extract(epoch from now()));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_product_slug
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_product_slug();