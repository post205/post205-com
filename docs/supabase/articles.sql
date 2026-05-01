-- POST 205 Articles Table
-- Run this in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/dikuhcaaxxsadlwepblf/sql

CREATE TABLE IF NOT EXISTS public.articles (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug             text        UNIQUE NOT NULL,
  title            text        NOT NULL,
  subtitle         text,
  date             date,
  section          text        DEFAULT 'frameworks',
  author           text        DEFAULT 'Toffer Lorenzana',
  hero_image       text,
  content          text,
  content_format   text        DEFAULT 'markdown' CHECK (content_format IN ('html', 'markdown')),
  seo_title        text,
  seo_description  text,
  status           text        DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published"
  ON public.articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Auth users full access"
  ON public.articles FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
