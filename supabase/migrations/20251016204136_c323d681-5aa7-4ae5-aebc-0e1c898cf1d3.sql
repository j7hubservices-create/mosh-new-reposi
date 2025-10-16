-- Fix image paths for newly added products
UPDATE products 
SET image_url = REPLACE(image_url, '/src/assets/', '/assets/')
WHERE image_url LIKE '/src/assets/%';

-- Create homepage_sections table for admin-configurable sections
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL DEFAULT 'latest', -- 'latest', 'best_sellers', 'random'
  title text NOT NULL DEFAULT 'Featured Collection',
  description text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active homepage sections"
ON public.homepage_sections FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage homepage sections"
ON public.homepage_sections FOR ALL
USING (is_admin(auth.uid()));

-- Create customer_reviews table
CREATE TABLE IF NOT EXISTS public.customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view reviews"
ON public.customer_reviews FOR SELECT
USING (true);

CREATE POLICY "Admins can manage reviews"
ON public.customer_reviews FOR ALL
USING (is_admin(auth.uid()));

-- Insert default homepage section
INSERT INTO public.homepage_sections (section_type, title, description, display_order)
VALUES ('latest', 'Latest Arrivals', 'Discover our newest collection', 1);

-- Insert sample customer reviews
INSERT INTO public.customer_reviews (customer_name, rating, review_text, is_featured)
VALUES 
  ('Chioma A.', 5, 'Amazing quality! The fabric is so comfortable and the fit is perfect. Will definitely order again.', true),
  ('Tunde O.', 5, 'Fast delivery and beautiful products. My daughter loves her new outfit!', true),
  ('Ada M.', 4, 'Great collection and good prices. Customer service was very helpful too.', true),
  ('James K.', 5, 'Best online shopping experience I''ve had. The clothes are exactly as shown in the pictures.', true);

-- Create trigger for homepage_sections updated_at
CREATE TRIGGER update_homepage_sections_updated_at
BEFORE UPDATE ON public.homepage_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();