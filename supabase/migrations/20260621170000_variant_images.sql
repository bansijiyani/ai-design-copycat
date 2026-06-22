ALTER TABLE public.product_variants ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
