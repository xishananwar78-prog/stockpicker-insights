import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomMenuItem {
  id: string;
  label: string;
  url: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useCustomMenuItems() {
  return useQuery({
    queryKey: ['custom-menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_menu_items' as any)
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as CustomMenuItem[];
    },
  });
}

export function useAddCustomMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: { label: string; url: string; icon: string; sort_order?: number }) => {
      const { data, error } = await supabase
        .from('custom_menu_items' as any)
        .insert(item as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-menu-items'] }),
  });
}

export function useDeleteCustomMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_menu_items' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-menu-items'] }),
  });
}
