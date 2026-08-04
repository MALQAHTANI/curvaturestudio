CREATE TABLE public.site_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot text NOT NULL UNIQUE,
  label text NOT NULL,
  media_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_media TO authenticated;
GRANT ALL ON public.site_media TO service_role;

ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can view site media" ON public.site_media
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "employees manage site media" ON public.site_media
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'employee'::app_role))
  WITH CHECK (has_role(auth.uid(), 'employee'::app_role));

CREATE TRIGGER site_media_updated_at BEFORE UPDATE ON public.site_media
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.site_media (slot, label, media_url) VALUES
  ('contact_hero', 'Contact page background', NULL),
  ('home_cta', 'Home CTA background', NULL);