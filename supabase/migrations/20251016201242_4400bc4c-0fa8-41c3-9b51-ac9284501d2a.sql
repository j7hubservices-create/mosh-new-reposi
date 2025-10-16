-- Insert new products with uploaded images
INSERT INTO products (name, description, price, size, stock, image_url, category_id)
VALUES 
  ('Leopard Print Sweater', 'Stylish blue and gray leopard print sweater', 4500, '12', 5, '/src/assets/product-leopard-sweater.jpg', (SELECT id FROM categories WHERE name = 'Women' LIMIT 1)),
  ('White Fuzzy Sweater', 'Soft and cozy white fuzzy sweater', 5000, '12', 3, '/src/assets/product-white-fuzzy-sweater.jpg', (SELECT id FROM categories WHERE name = 'Women' LIMIT 1)),
  ('Rust Colored Top', 'Comfortable rust colored casual top', 3500, '10/12', 4, '/src/assets/product-rust-top.jpg', (SELECT id FROM categories WHERE name = 'Women' LIMIT 1)),
  ('Orange Sleeveless Top', 'Orange sleeveless top with decorative bottom', 3000, '8', 6, '/src/assets/product-orange-top.jpg', (SELECT id FROM categories WHERE name = 'Women' LIMIT 1)),
  ('White Dotted Shirt', 'Classic white shirt with polka dot pattern', 4000, '18', 4, '/src/assets/product-white-dotted-shirt.jpg', (SELECT id FROM categories WHERE name = 'Kids' LIMIT 1)),
  ('Blue Floral Top', 'Beautiful blue floral patterned top', 3500, '12', 5, '/src/assets/product-blue-floral-top.jpg', (SELECT id FROM categories WHERE name = 'Women' LIMIT 1)),
  ('Gray Shorts', 'Comfortable gray shorts for everyday wear', 3000, '8', 7, '/src/assets/product-gray-shorts.jpg', (SELECT id FROM categories WHERE name = 'Women' LIMIT 1)),
  ('Light Blue Hoodie', 'Classic light blue hoodie', 5500, '14', 3, '/src/assets/product-light-blue-hoodie.jpg', (SELECT id FROM categories WHERE name = 'Kids' LIMIT 1)),
  ('The Town Graphic Hoodie', 'Gray hoodie with The Town graphic print', 6000, '14', 2, '/src/assets/product-gray-town-hoodie.jpg', (SELECT id FROM categories WHERE name = 'Kids' LIMIT 1));