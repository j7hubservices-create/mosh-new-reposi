-- Drop trigger first, then recreate functions
DROP TRIGGER IF EXISTS trigger_set_product_slug ON public.products;

DROP FUNCTION IF EXISTS public.set_product_slug();
CREATE OR REPLACE FUNCTION public.set_product_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
    IF EXISTS (SELECT 1 FROM products WHERE slug = NEW.slug AND id != NEW.id) THEN
      NEW.slug := NEW.slug || '-' || floor(extract(epoch from now()));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.generate_slug(text);
CREATE OR REPLACE FUNCTION public.generate_slug(text_input text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slug_output text;
BEGIN
  slug_output := lower(trim(text_input));
  slug_output := regexp_replace(slug_output, '[^a-z0-9\s-]', '', 'g');
  slug_output := regexp_replace(slug_output, '\s+', '-', 'g');
  slug_output := regexp_replace(slug_output, '-+', '-', 'g');
  RETURN slug_output;
END;
$$;

-- Recreate trigger
CREATE TRIGGER trigger_set_product_slug
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_product_slug();