import { useEffect, useRef, useState, FormEvent } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  nickname: string;
  client_id: string;
  message: string;
  created_at: string;
}

const NICK_KEY = 'sp_chat_nickname';
const CID_KEY = 'sp_chat_client_id';
const NICK_EXP_KEY = 'sp_chat_nickname_exp';

function getStoredNickname(): string | null {
  try {
    const exp = Number(localStorage.getItem(NICK_EXP_KEY) || '0');
    if (exp && Date.now() > exp) {
      localStorage.removeItem(NICK_KEY);
      localStorage.removeItem(NICK_EXP_KEY);
      return null;
    }
    return localStorage.getItem(NICK_KEY);
  } catch {
    return null;
  }
}

function getClientId(): string {
  let id = localStorage.getItem(CID_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)) + Date.now().toString(36);
    localStorage.setItem(CID_KEY, id);
  }
  return id;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function nickColor(nickname: string) {
  let h = 0;
  for (let i = 0; i < nickname.length; i++) h = (h * 31 + nickname.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 70% 65%)`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nickname, setNickname] = useState<string | null>(() => getStoredNickname());
  const [askNick, setAskNick] = useState(false);
  const [draftNick, setDraftNick] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const clientId = useRef<string>(getClientId());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!nickname) setAskNick(true);
  }, [nickname]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(500);
      if (!cancelled && !error && data) setMessages(data as ChatMessage[]);
    })();

    const channel = supabase
      .channel('chat_messages_rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages((prev) => {
          const next = payload.new as ChatMessage;
          if (prev.some((m) => m.id === next.id)) return prev;
          return [...prev, next];
        });
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const saveNickname = (e: FormEvent) => {
    e.preventDefault();
    const v = draftNick.trim();
    if (v.length < 2 || v.length > 30) {
      toast.error('Nickname must be 2-30 characters');
      return;
    }
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    localStorage.setItem(NICK_KEY, v);
    localStorage.setItem(NICK_EXP_KEY, String(Date.now() + oneYear));
    setNickname(v);
    setAskNick(false);
    toast.success(`Welcome, ${v}!`);
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!nickname) { setAskNick(true); return; }
    const msg = text.trim();
    if (!msg) return;
    if (msg.length > 1000) { toast.error('Message too long'); return; }
    setSending(true);
    const { error } = await supabase.from('chat_messages').insert({
      nickname,
      client_id: clientId.current,
      message: msg,
    });
    setSending(false);
    if (error) {
      toast.error('Failed to send');
      return;
    }
    setText('');
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-9rem)] md:h-screen max-w-3xl mx-auto">
        <div className="px-4 py-3 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-foreground">Community Chat</h1>
            <p className="text-[11px] text-muted-foreground">
              {nickname ? <>You're chatting as <span className="text-primary font-medium">{nickname}</span> · Messages auto-delete after 2 days</> : 'Set a nickname to join · Messages auto-delete after 2 days'}
            </p>
          </div>
          {nickname && (
            <Button variant="ghost" size="sm" onClick={() => { setDraftNick(nickname); setAskNick(true); }}>
              Change
            </Button>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-2 bg-background">
          {messages.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-12">
              No messages yet. Be the first to say hi 👋
            </div>
          )}
          {messages.map((m, i) => {
            const isMine = m.client_id === clientId.current;
            const prev = messages[i - 1];
            const showName = !isMine && (!prev || prev.client_id !== m.client_id);
            return (
              <div key={m.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[78%] rounded-2xl px-3.5 py-2 shadow-sm',
                    isMine
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-card border border-border text-foreground rounded-bl-sm'
                  )}
                >
                  {showName && (
                    <div className="text-[11px] font-semibold mb-0.5" style={{ color: nickColor(m.nickname) }}>
                      {m.nickname}
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap break-words leading-snug">{m.message}</div>
                  <div className={cn('text-[10px] mt-1 text-right', isMine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {formatTime(m.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={sendMessage} className="border-t border-border bg-card p-2.5 flex items-center gap-2 sticky bottom-0">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={nickname ? 'Type a message...' : 'Set a nickname to chat'}
            maxLength={1000}
            className="flex-1 rounded-full bg-background"
            onFocus={() => { if (!nickname) setAskNick(true); }}
          />
          <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0" disabled={sending || !text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <Dialog open={askNick} onOpenChange={(o) => { if (!o && !nickname) return; setAskNick(o); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Pick a nickname</DialogTitle>
            <DialogDescription>
              Choose a temporary nickname to chat. We'll remember it on this device for 1 year.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveNickname} className="space-y-3">
            <Input
              autoFocus
              value={draftNick}
              onChange={(e) => setDraftNick(e.target.value)}
              placeholder="e.g. TraderRaj"
              maxLength={30}
            />
            <DialogFooter>
              <Button type="submit" className="w-full">Continue</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}