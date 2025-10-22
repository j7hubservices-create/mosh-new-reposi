-- Add new categories without deleting existing ones
-- This preserves the foreign key relationships

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
('Kids - Girl', 'Fashion for girls')
ON CONFLICT DO NOTHING;