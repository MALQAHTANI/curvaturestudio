CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  event_date date,
  cover_image text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published events" ON public.events
  FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'employee'::app_role));

CREATE POLICY "Employees manage events" ON public.events
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'employee'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'employee'::app_role));

CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.event_registrations ADD COLUMN event_id uuid REFERENCES public.events(id) ON DELETE SET NULL;