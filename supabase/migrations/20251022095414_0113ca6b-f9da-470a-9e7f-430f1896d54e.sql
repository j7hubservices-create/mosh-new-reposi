-- Update categories to match the new structure
-- First, update all products to have NULL category_id to avoid foreign key constraint
UPDATE products SET category_id = NULL;

-- Delete existing categories
DELETE FROM categories;

-- Add new categories with proper structure
INSERT INTO categories (name, description) VALUES
-- Ladies subcategories
('Ladies - Tops', 'Tops for women'),
('Ladies - Skirts', 'Skirts for women'),
('Ladies - Pants', 'Pants for women'),
('Ladies - Gowns', 'Gowns and dresses for women'),
-- Men subcategories
('Men - Tops', 'Tops for men'),
('Men - Pants', 'Pants for men'),
('Men - Shorts', 'Shorts for men'),
-- Kids subcategories
('Kids - Boy', 'Fashion for boys'),
('Kids - Girl', 'Fashion for girls');