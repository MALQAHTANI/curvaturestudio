ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS client text,
  ADD COLUMN IF NOT EXISTS year text,
  ADD COLUMN IF NOT EXISTS services text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tools text[] NOT NULL DEFAULT '{}';