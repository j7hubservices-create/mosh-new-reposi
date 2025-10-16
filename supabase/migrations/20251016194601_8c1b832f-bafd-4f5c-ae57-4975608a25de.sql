-- Insert three new categories
INSERT INTO public.categories (name, description) VALUES
  ('Accessories', 'Complete your look with stylish accessories'),
  ('Footwear', 'Step out in style with our premium footwear collection'),
  ('Sale', 'Exclusive deals and discounts on selected items')
ON CONFLICT DO NOTHING;