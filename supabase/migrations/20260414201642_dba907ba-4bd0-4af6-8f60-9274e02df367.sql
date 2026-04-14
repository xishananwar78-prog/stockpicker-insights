
-- Learning categories table
CREATE TABLE public.learning_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'book',
  sort_order INTEGER NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES public.learning_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Learning articles table
CREATE TABLE public.learning_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT NOT NULL UNIQUE,
  thumbnail_url TEXT,
  content TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES public.learning_categories(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_articles ENABLE ROW LEVEL SECURITY;

-- RLS for learning_categories
CREATE POLICY "Anyone can view categories" ON public.learning_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.learning_categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update categories" ON public.learning_categories FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.learning_categories FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS for learning_articles
CREATE POLICY "Anyone can view published articles" ON public.learning_articles FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can view all articles" ON public.learning_articles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert articles" ON public.learning_articles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update articles" ON public.learning_articles FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete articles" ON public.learning_articles FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Updated_at triggers
CREATE TRIGGER update_learning_categories_updated_at BEFORE UPDATE ON public.learning_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_articles_updated_at BEFORE UPDATE ON public.learning_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
