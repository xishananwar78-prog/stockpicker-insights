
-- Table for admin popups
CREATE TABLE public.admin_popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  content text NOT NULL DEFAULT '',
  image_url text,
  cta_text text,
  cta_url text,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_popups ENABLE ROW LEVEL SECURITY;

-- Anyone can view active popups
CREATE POLICY "Anyone can view active popups" ON public.admin_popups
  FOR SELECT USING (is_active = true);

-- Admin CRUD
CREATE POLICY "Admins can insert popups" ON public.admin_popups
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update popups" ON public.admin_popups
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete popups" ON public.admin_popups
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all popups" ON public.admin_popups
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-delete blog posts older than 30 days
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

SELECT cron.schedule(
  'delete-old-blog-posts',
  '0 3 * * *',
  $$DELETE FROM public.blog_posts WHERE created_at < now() - interval '30 days'$$
);
