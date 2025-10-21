-- Generate unique slugs for all existing products
DO $$
DECLARE
  product_record RECORD;
  new_slug text;
  slug_exists boolean;
  counter integer;
BEGIN
  FOR product_record IN SELECT id, name FROM products WHERE slug IS NULL LOOP
    new_slug := generate_slug(product_record.name);
    counter := 1;
    
    -- Check if slug exists
    SELECT EXISTS(SELECT 1 FROM products WHERE slug = new_slug AND id != product_record.id) INTO slug_exists;
    
    -- If exists, append counter until unique
    WHILE slug_exists LOOP
      new_slug := generate_slug(product_record.name) || '-' || counter;
      SELECT EXISTS(SELECT 1 FROM products WHERE slug = new_slug AND id != product_record.id) INTO slug_exists;
      counter := counter + 1;
    END LOOP;
    
    -- Update the product with unique slug
    UPDATE products SET slug = new_slug WHERE id = product_record.id;
  END LOOP;
END $$;