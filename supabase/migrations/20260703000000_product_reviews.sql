CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.product_reviews TO authenticated, anon;
GRANT ALL ON public.product_reviews TO service_role;

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews 
  FOR SELECT USING (is_approved = true);

-- Users can view their own pending reviews
CREATE POLICY "Users can view own pending reviews" ON public.product_reviews 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins can view all reviews (we assume admins have service role or bypass RLS, but if they access via web, we might need a policy, but admin APIs use service role key). Let's use service_role for admin actions.

-- Users can insert reviews
CREATE POLICY "Users can insert own reviews" ON public.product_reviews 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
