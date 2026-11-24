ALTER TYPE public.intraday_exit_reason ADD VALUE IF NOT EXISTS 'TIME_EXIT';

ALTER TABLE public.intraday_recommendations
ADD COLUMN IF NOT EXISTS entry_triggered boolean NOT NULL DEFAULT false;

UPDATE public.intraday_recommendations
SET entry_triggered = true
WHERE exit_reason IS NULL
  AND ((trade_side = 'BUY' AND current_price >= recommended_price)
    OR (trade_side = 'SELL' AND current_price <= recommended_price));

CREATE OR REPLACE FUNCTION public.intraday_mark_entry_triggered()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.entry_triggered THEN
    RETURN NEW;
  END IF;

  IF (NEW.trade_side = 'BUY' AND NEW.current_price >= NEW.recommended_price)
     OR (NEW.trade_side = 'SELL' AND NEW.current_price <= NEW.recommended_price) THEN
    NEW.entry_triggered := true;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER intraday_entry_triggered
BEFORE INSERT OR UPDATE ON public.intraday_recommendations
FOR EACH ROW
EXECUTE FUNCTION public.intraday_mark_entry_triggered();