
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname text NOT NULL,
  client_id text NOT NULL,
  message text NOT NULL CHECK (char_length(message) > 0 AND char_length(message) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

GRANT SELECT, INSERT ON public.chat_messages TO anon, authenticated;
GRANT ALL ON public.chat_messages TO service_role;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read recent chat messages"
  ON public.chat_messages FOR SELECT
  USING (created_at > now() - interval '2 days');

CREATE POLICY "Anyone can post chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    char_length(nickname) BETWEEN 2 AND 30
    AND char_length(client_id) BETWEEN 4 AND 80
    AND char_length(message) BETWEEN 1 AND 1000
  );

CREATE POLICY "Admins can delete chat messages"
  ON public.chat_messages FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Auto-cleanup function for messages older than 2 days
CREATE OR REPLACE FUNCTION public.cleanup_old_chat_messages()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.chat_messages WHERE created_at < now() - interval '2 days';
$$;

-- Schedule cleanup via pg_cron (hourly)
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
  'cleanup-old-chat-messages',
  '0 * * * *',
  $$ SELECT public.cleanup_old_chat_messages(); $$
);
