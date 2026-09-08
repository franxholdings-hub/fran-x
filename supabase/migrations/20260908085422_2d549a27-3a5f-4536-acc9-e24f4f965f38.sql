ALTER TABLE public.digital_products ADD COLUMN IF NOT EXISTS file_name text;

CREATE POLICY "Admins can read product files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload product files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'));