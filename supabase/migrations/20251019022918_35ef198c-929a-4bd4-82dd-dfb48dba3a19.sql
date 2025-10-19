-- Remove Accessories and Sales categories
DELETE FROM categories WHERE name IN ('Accessories', 'Sales');

-- Add Bales category
INSERT INTO categories (name, description) 
VALUES ('Bales', 'Wholesale bales and bundles')
ON CONFLICT DO NOTHING;