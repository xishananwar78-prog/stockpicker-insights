
-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  thumbnail_url text,
  content text NOT NULL DEFAULT '',
  slug text NOT NULL UNIQUE,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts FOR SELECT
USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can insert blog posts"
ON public.blog_posts FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update blog posts"
ON public.blog_posts FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can also read drafts
CREATE POLICY "Admins can view all blog posts"
ON public.blog_posts FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'::app_role));
