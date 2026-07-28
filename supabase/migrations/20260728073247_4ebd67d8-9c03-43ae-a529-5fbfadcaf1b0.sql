DROP POLICY IF EXISTS "public read published projects" ON public.projects;
CREATE POLICY "anon read published projects" ON public.projects FOR SELECT TO anon USING (published = true);
CREATE POLICY "auth read projects" ON public.projects FOR SELECT TO authenticated USING (published = true OR public.has_role(auth.uid(), 'employee'::app_role));
DROP POLICY IF EXISTS "public read published studio" ON public.studio_items;
CREATE POLICY "anon read published studio" ON public.studio_items FOR SELECT TO anon USING (published = true);
CREATE POLICY "auth read studio" ON public.studio_items FOR SELECT TO authenticated USING (published = true OR public.has_role(auth.uid(), 'employee'::app_role));