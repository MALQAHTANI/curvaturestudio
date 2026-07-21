-- Roles system
CREATE TYPE public.app_role AS ENUM ('employee');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Auto-grant employee to the very first signup
CREATE OR REPLACE FUNCTION public.tg_bootstrap_first_employee()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'employee') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'employee');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created_bootstrap
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.tg_bootstrap_first_employee();

-- Replace permissive policies with role-based ones
DROP POLICY "authenticated insert projects" ON public.projects;
DROP POLICY "authenticated update projects" ON public.projects;
DROP POLICY "authenticated delete projects" ON public.projects;
CREATE POLICY "employees insert projects" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'employee'));
CREATE POLICY "employees update projects" ON public.projects FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'employee')) WITH CHECK (public.has_role(auth.uid(), 'employee'));
CREATE POLICY "employees delete projects" ON public.projects FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'employee'));

DROP POLICY "authenticated insert studio" ON public.studio_items;
DROP POLICY "authenticated update studio" ON public.studio_items;
DROP POLICY "authenticated delete studio" ON public.studio_items;
CREATE POLICY "employees insert studio" ON public.studio_items FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'employee'));
CREATE POLICY "employees update studio" ON public.studio_items FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'employee')) WITH CHECK (public.has_role(auth.uid(), 'employee'));
CREATE POLICY "employees delete studio" ON public.studio_items FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'employee'));

-- Same for storage media bucket
DROP POLICY "authenticated upload media" ON storage.objects;
DROP POLICY "authenticated update media" ON storage.objects;
DROP POLICY "authenticated delete media" ON storage.objects;
CREATE POLICY "employees upload media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'employee'));
CREATE POLICY "employees update media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'employee'));
CREATE POLICY "employees delete media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'employee'));