import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminPopup {
  id: string;
  title: string | null;
  content: string;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useActivePopup() {
  return useQuery({
    queryKey: ['admin-popup-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_popups' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as AdminPopup | null;
    },
  });
}

export function useAdminPopups() {
  return useQuery({
    queryKey: ['admin-popups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_popups' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as AdminPopup[];
    },
  });
}

export function useUpsertPopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (popup: {
      id?: string;
      title?: string;
      content: string;
      image_url?: string;
      cta_text?: string;
      cta_url?: string;
      is_active: boolean;
    }) => {
      if (popup.id) {
        const { id, ...rest } = popup;
        const { error } = await supabase
          .from('admin_popups' as any)
          .update(rest as any)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_popups' as any)
          .insert(popup as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-popups'] });
      qc.invalidateQueries({ queryKey: ['admin-popup-active'] });
    },
  });
}

export function useDeletePopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_popups' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-popups'] });
      qc.invalidateQueries({ queryKey: ['admin-popup-active'] });
    },
  });
}
