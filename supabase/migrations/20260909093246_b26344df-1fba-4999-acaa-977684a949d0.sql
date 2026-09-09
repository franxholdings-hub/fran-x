CREATE TABLE IF NOT EXISTS public.digital_product_content (
  product_slug text PRIMARY KEY,
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.digital_product_content TO authenticated;
GRANT ALL ON public.digital_product_content TO service_role;

ALTER TABLE public.digital_product_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product content admin all" ON public.digital_product_content
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER digital_product_content_updated_at
  BEFORE UPDATE ON public.digital_product_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_col();