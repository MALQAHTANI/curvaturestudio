CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.clients TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published clients" ON public.clients FOR SELECT TO anon, authenticated USING (published = true OR public.has_role(auth.uid(), 'employee'));
CREATE POLICY "Employees manage clients" ON public.clients FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'employee')) WITH CHECK (public.has_role(auth.uid(), 'employee'));

CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  note TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.event_registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_registrations TO authenticated;
GRANT ALL ON public.event_registrations TO service_role;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can register" ON public.event_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Employees view registrations" ON public.event_registrations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'employee'));
CREATE POLICY "Employees update registrations" ON public.event_registrations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'employee'));
CREATE POLICY "Employees delete registrations" ON public.event_registrations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'employee'));

INSERT INTO public.clients (name, sort_order) VALUES
  ('Mercedes-Benz', 10),
  ('Al-Juffali Automotive', 20),
  ('Rolls Royce', 30),
  ('BMW', 40),
  ('Alnaghi', 50),
  ('Saudia', 60),
  ('Red Sea Global', 70),
  ('Aramco', 80);