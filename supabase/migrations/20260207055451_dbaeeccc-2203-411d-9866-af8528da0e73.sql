-- Add recommended_price column to swing_recommendations
ALTER TABLE public.swing_recommendations
ADD COLUMN recommended_price numeric NOT NULL DEFAULT 0;

-- Update existing rows to use current_price as recommended_price
UPDATE public.swing_recommendations
SET recommended_price = current_price
WHERE recommended_price = 0;