-- Create enum types for trade side and exit reasons
CREATE TYPE public.trade_side AS ENUM ('BUY', 'SELL');

CREATE TYPE public.intraday_exit_reason AS ENUM (
  'TARGET_1_HIT',
  'TARGET_2_HIT',
  'TARGET_3_HIT',
  'PARTIAL_PROFIT',
  'PARTIAL_LOSS',
  'STOPLOSS_HIT',
  'NOT_EXECUTED'
);

CREATE TYPE public.swing_exit_reason AS ENUM (
  'TARGET_1_HIT',
  'TARGET_2_HIT',
  'PARTIAL_PROFIT',
  'PARTIAL_LOSS',
  'STOPLOSS_HIT',
  'NOT_EXECUTED'
);

-- Create intraday_recommendations table
CREATE TABLE public.intraday_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_name TEXT NOT NULL,
  current_price NUMERIC NOT NULL,
  trade_side trade_side NOT NULL,
  recommended_price NUMERIC NOT NULL,
  target1 NUMERIC NOT NULL,
  target2 NUMERIC NOT NULL,
  target3 NUMERIC NOT NULL,
  stoploss NUMERIC NOT NULL,
  exit_reason intraday_exit_reason,
  exit_price NUMERIC,
  exited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create swing_recommendations table
CREATE TABLE public.swing_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_name TEXT NOT NULL,
  current_price NUMERIC NOT NULL,
  image_url TEXT,
  target1 NUMERIC NOT NULL,
  target2 NUMERIC NOT NULL,
  stoploss NUMERIC NOT NULL,
  allocation TEXT NOT NULL,
  notes TEXT,
  exit_reason swing_exit_reason,
  exit_price NUMERIC,
  exited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.intraday_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swing_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for intraday_recommendations
-- Anyone (logged-in or anonymous) can view all recommendations
CREATE POLICY "Anyone can view intraday recommendations"
ON public.intraday_recommendations FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can insert recommendations
CREATE POLICY "Admins can insert intraday recommendations"
ON public.intraday_recommendations FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update recommendations
CREATE POLICY "Admins can update intraday recommendations"
ON public.intraday_recommendations FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete recommendations
CREATE POLICY "Admins can delete intraday recommendations"
ON public.intraday_recommendations FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for swing_recommendations
-- Anyone (logged-in or anonymous) can view all recommendations
CREATE POLICY "Anyone can view swing recommendations"
ON public.swing_recommendations FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can insert recommendations
CREATE POLICY "Admins can insert swing recommendations"
ON public.swing_recommendations FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update recommendations
CREATE POLICY "Admins can update swing recommendations"
ON public.swing_recommendations FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete recommendations
CREATE POLICY "Admins can delete swing recommendations"
ON public.swing_recommendations FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_intraday_recommendations_updated_at
BEFORE UPDATE ON public.intraday_recommendations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_swing_recommendations_updated_at
BEFORE UPDATE ON public.swing_recommendations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();