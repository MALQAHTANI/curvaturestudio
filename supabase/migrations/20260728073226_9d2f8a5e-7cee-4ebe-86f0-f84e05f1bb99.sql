DROP POLICY IF EXISTS "public read published projects" ON public.projects;
CREATE POLICY "public read published projects" ON public.projects FOR SELECT TO anon, authenticated USING (published = true OR (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'employee'::app_role)));
DROP POLICY IF EXISTS "public read published studio" ON public.studio_items;
CREATE POLICY "public read published studio" ON public.studio_items FOR SELECT TO anon, authenticated USING (published = true OR (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'employee'::app_role)));