import { useState } from 'react';
import { Plus, Trash2, Edit2, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLearningCategories, useAddLearningCategory, useUpdateLearningCategory, useDeleteLearningCategory } from '@/hooks/useLearning';
import { toast } from 'sonner';

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').substring(0, 60);
}

export function ManageLearningCategoryDialog() {
  const { data: categories = [] } = useLearningCategories();
  const addMutation = useAddLearningCategory();
  const updateMutation = useUpdateLearningCategory();
  const deleteMutation = useDeleteLearningCategory();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!name.trim()) return;
    const slug = generateSlug(name);
    
    if (editId) {
      updateMutation.mutate({ id: editId, name: name.trim(), slug, description: description.trim() || undefined }, {
        onSuccess: () => { toast.success('Category updated'); setName(''); setDescription(''); setEditId(null); },
        onError: () => toast.error('Failed to update'),
      });
    } else {
      addMutation.mutate({ name: name.trim(), slug, description: description.trim() || undefined, sort_order: categories.length }, {
        onSuccess: () => { toast.success('Category added'); setName(''); setDescription(''); },
        onError: () => toast.error('Failed to add category'),
      });
    }
  };

  const handleEdit = (cat: typeof categories[0]) => {
    setEditId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Category deleted'),
      onError: () => toast.error('Failed to delete'),
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderPlus className="h-4 w-4 mr-2" />
          Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Category Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Technical Analysis" className="bg-input" />
            <Label className="text-xs text-muted-foreground">Description (optional)</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" className="bg-input" />
            <Button onClick={handleAdd} size="sm" className="w-full bg-gradient-brand text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" />
              {editId ? 'Update' : 'Add'} Category
            </Button>
            {editId && (
              <Button variant="ghost" size="sm" className="w-full" onClick={() => { setEditId(null); setName(''); setDescription(''); }}>
                Cancel Edit
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{cat.name}</p>
                  {cat.description && <p className="text-xs text-muted-foreground truncate">{cat.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(cat)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No categories yet</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
