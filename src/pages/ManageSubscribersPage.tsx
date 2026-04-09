import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAuthContext } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Trash2, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ManageSubscribersPage() {
  const { isAdmin } = useAuthContext();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['subscribers'],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .eq('role', 'user');
      if (error) throw error;

      // Get profile info for each user
      const userIds = roles.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      return roles.map(r => ({
        ...r,
        email: profiles?.find(p => p.user_id === r.user_id)?.email || 'Unknown',
      }));
    },
    enabled: isAdmin,
  });

  const addMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.functions.invoke('create-subscriber', {
        body: { email: email.trim(), password },
      });

      if (error) {
        const details = error instanceof Error ? error.message : 'Failed to add subscriber';
        throw new Error(details);
      }

      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success('Subscriber added successfully');
      setEmail('');
      setPassword('');
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add subscriber');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('delete-subscriber', {
        body: { userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success('Subscriber removed');
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove subscriber');
    },
  });

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-muted-foreground">Access denied</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Manage Subscribers</h1>
        </div>

        {/* Add Subscriber Form */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Add New Subscriber</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input border-border flex-1"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input border-border flex-1"
            />
            <Button
              onClick={() => addMutation.mutate({ email, password })}
              disabled={!email || !password || addMutation.isPending}
              className="bg-gradient-brand text-primary-foreground hover:opacity-90 shrink-0"
            >
              {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Add
            </Button>
          </div>
        </div>

        {/* Subscribers List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Subscribers ({subscribers.length})
            </h2>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">No subscribers yet</div>
          ) : (
            <div className="divide-y divide-border">
              {subscribers.map((sub) => (
                <div key={sub.user_id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{sub.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(sub.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(sub.user_id)}
                    className="text-loss hover:text-loss hover:bg-loss/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Subscriber</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove their access. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null); } }}
              className="bg-loss hover:bg-loss/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
