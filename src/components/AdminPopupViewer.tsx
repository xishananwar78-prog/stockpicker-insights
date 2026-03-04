import { useEffect, useState } from 'react';
import { useActivePopup } from '@/hooks/useAdminPopup';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

function getPopupSessionKey(popupId: string) {
  const today = new Date().toISOString().slice(0, 10);
  return `popup-seen-${popupId}-${today}`;
}

export function AdminPopupViewer() {
  const { data: popup } = useActivePopup();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!popup) return;
    const key = getPopupSessionKey(popup.id);
    if (sessionStorage.getItem(key)) return;
    setOpen(true);
    sessionStorage.setItem(key, '1');
  }, [popup]);

  if (!popup) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-card border-border max-w-md max-h-[85vh] overflow-y-auto">
        {popup.title && (
          <DialogHeader>
            <DialogTitle className="text-foreground">{popup.title}</DialogTitle>
          </DialogHeader>
        )}
        {popup.image_url && (
          <img src={popup.image_url} alt="" className="w-full rounded-lg object-cover max-h-48" />
        )}
        <div
          className="prose prose-invert prose-sm max-w-none [&_a]:text-primary [&_a]:underline [&_img]:rounded-lg"
          dangerouslySetInnerHTML={{ __html: popup.content }}
        />
        {popup.cta_text && popup.cta_url && (
          <Button asChild className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
            <a href={popup.cta_url} target="_blank" rel="noopener noreferrer">
              {popup.cta_text}
              <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
            </a>
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
