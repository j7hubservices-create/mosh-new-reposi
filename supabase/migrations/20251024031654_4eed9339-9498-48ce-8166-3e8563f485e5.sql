-- Allow guest checkout by permitting NULL user_id and guest inserts
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Policy: Guests can create guest orders
CREATE POLICY "Guests can create guest orders"
ON public.orders
FOR INSERT
WITH CHECK (user_id IS NULL);

-- Policy: Guests can create order items linked to guest orders
CREATE POLICY "Guests can create order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id IS NULL
  )
);
