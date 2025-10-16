-- Insert main categories for Mosh Apparels
INSERT INTO public.categories (name, description) VALUES
  ('Men', 'Fashion and apparel for men'),
  ('Women', 'Fashion and apparel for women'),
  ('Kids', 'Fashion and apparel for kids')
ON CONFLICT DO NOTHING;