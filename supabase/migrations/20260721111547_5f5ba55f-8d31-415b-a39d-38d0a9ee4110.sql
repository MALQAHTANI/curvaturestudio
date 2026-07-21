-- Employees table for admin dashboard
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published projects" ON public.projects FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);
CREATE POLICY "authenticated insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated update projects" ON public.projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated delete projects" ON public.projects FOR DELETE TO authenticated USING (true);

CREATE TABLE public.studio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.studio_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_items TO authenticated;
GRANT ALL ON public.studio_items TO service_role;
ALTER TABLE public.studio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published studio" ON public.studio_items FOR SELECT USING (published = true OR auth.uid() IS NOT NULL);
CREATE POLICY "authenticated insert studio" ON public.studio_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated update studio" ON public.studio_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated delete studio" ON public.studio_items FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.tg_set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER studio_updated_at BEFORE UPDATE ON public.studio_items FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();