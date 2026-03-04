import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useAdminPopups, useUpsertPopup, useDeletePopup, AdminPopup } from '@/hooks/useAdminPopup';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ManagePopupDialog() {
  const { data: popups = [], isLoading } = useAdminPopups();
  const upsertMutation = useUpsertPopup();
  const deleteMutation = useDeletePopup();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPopup | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || '');
      setContent(editing.content);
      setImageUrl(editing.image_url || '');
      setCtaText(editing.cta_text || '');
      setCtaUrl(editing.cta_url || '');
      setIsActive(editing.is_active);
    } else {
      resetForm();
    }
  }, [editing]);

  function resetForm() {
    setTitle('');
    setContent('');
    setImageUrl('');
    setCtaText('');
    setCtaUrl('');
    setIsActive(false);
    setEditing(null);
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `popups/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('blog-images').upload(path, file);
    if (error) {
      toast.error('Upload failed');
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
  };

  const handleSave = () => {
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }
    upsertMutation.mutate(
      {
        id: editing?.id,
        title: title || undefined,
        content,
        image_url: imageUrl || undefined,
        cta_text: ctaText || undefined,
        cta_url: ctaUrl || undefined,
        is_active: isActive,
      },
      {
        onSuccess: () => {
          toast.success(editing ? 'Popup updated' : 'Popup created');
          resetForm();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4 mr-2" /> Manage Popup
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{editing ? 'Edit Popup' : 'Manage Popup'}</DialogTitle>
        </DialogHeader>

        {/* Existing popups */}
        {!editing && (
          <div className="space-y-2 mb-4">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
            ) : popups.length > 0 ? (
              popups.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.title || 'Untitled'}</p>
                    <span className={`text-[10px] font-medium uppercase ${p.is_active ? 'text-profit' : 'text-muted-foreground'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(p)}>
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => deleteMutation.mutate(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">No popups yet</p>
            )}
          </div>
        )}

        {/* Form */}
        <div className="space-y-3">
          <div>
            <Label className="text-muted-foreground text-xs">Title (optional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Popup title" className="bg-input" />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Image (optional)</Label>
            <div className="flex items-center gap-3">
              <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="bg-input" />
              {imageUrl && <img src={imageUrl} alt="" className="h-12 w-16 object-cover rounded border border-border" />}
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">CTA Button Text (optional)</Label>
            <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="e.g. Open Account" className="bg-input" />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">CTA URL (optional)</Label>
            <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://..." className="bg-input" />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label className="text-sm">{isActive ? 'Active' : 'Inactive'}</Label>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs mb-2 block">Content *</Label>
            <RichTextEditor content={content} onChange={setContent} placeholder="Write popup content..." />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={upsertMutation.isPending} className="bg-gradient-brand text-primary-foreground flex-1">
              {editing ? 'Update' : 'Create'} Popup
            </Button>
            {editing && (
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
