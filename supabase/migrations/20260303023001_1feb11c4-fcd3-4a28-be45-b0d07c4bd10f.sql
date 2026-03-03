
CREATE TABLE public.custom_menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'link',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active menu items"
  ON public.custom_menu_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert menu items"
  ON public.custom_menu_items FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update menu items"
  ON public.custom_menu_items FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete menu items"
  ON public.custom_menu_items FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));
