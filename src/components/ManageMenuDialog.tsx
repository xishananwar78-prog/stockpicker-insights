import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCustomMenuItems, useAddCustomMenuItem, useDeleteCustomMenuItem } from '@/hooks/useCustomMenuItems';
import { IconPicker, getIconComponent } from '@/components/IconPicker';
import { toast } from 'sonner';

export function ManageMenuDialog() {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('link');

  const { data: items = [] } = useCustomMenuItems();
  const addMutation = useAddCustomMenuItem();
  const deleteMutation = useDeleteCustomMenuItem();

  const handleAdd = () => {
    if (!label.trim() || !url.trim()) {
      toast.error('Label and URL are required');
      return;
    }
    addMutation.mutate(
      { label: label.trim(), url: url.trim(), icon, sort_order: items.length },
      {
        onSuccess: () => {
          setLabel('');
          setUrl('');
          setIcon('link');
          toast.success('Menu item added');
        },
        onError: () => toast.error('Failed to add menu item'),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Menu item removed'),
      onError: () => toast.error('Failed to remove'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Manage Menu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Menu Items</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing items */}
          {items.length > 0 && (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    {(() => { const Ic = getIconComponent(item.icon); return <Ic className="h-4 w-4 text-muted-foreground shrink-0" />; })()}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{item.url}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="shrink-0 h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add new */}
          <div className="space-y-3 pt-2 border-t border-border">
            <p className="text-sm font-medium">Add New Item</p>
            <Input
              placeholder="Label (e.g. Telegram)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="bg-input"
            />
            <Input
              placeholder="URL (e.g. https://t.me/channel)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-input"
            />
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Icon</Label>
              <IconPicker value={icon} onChange={setIcon} />
            </div>
            <Button onClick={handleAdd} disabled={addMutation.isPending} className="w-full bg-gradient-brand text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
