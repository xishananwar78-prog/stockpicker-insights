import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SwingRecommendation, SwingExitReason } from '@/types/recommendation';
import { toast } from 'sonner';

// Database row type (snake_case)
interface SwingRecommendationRow {
  id: string;
  stock_name: string;
  current_price: number;
  image_url: string | null;
  target1: number;
  target2: number;
  stoploss: number;
  allocation: string;
  notes: string | null;
  exit_reason: string | null;
  exit_price: number | null;
  exited_at: string | null;
  created_at: string;
  updated_at: string;
}

// Convert database row to frontend type
function rowToRecommendation(row: SwingRecommendationRow): SwingRecommendation {
  return {
    id: row.id,
    stockName: row.stock_name,
    currentPrice: Number(row.current_price),
    imageUrl: row.image_url || undefined,
    target1: Number(row.target1),
    target2: Number(row.target2),
    stoploss: Number(row.stoploss),
    allocation: row.allocation,
    notes: row.notes || undefined,
    exitReason: row.exit_reason as SwingExitReason,
    exitPrice: row.exit_price ? Number(row.exit_price) : undefined,
    exitedAt: row.exited_at ? new Date(row.exited_at) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// Fetch all swing recommendations
export function useSwingRecommendations() {
  return useQuery({
    queryKey: ['swing-recommendations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('swing_recommendations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching swing recommendations:', error);
        throw error;
      }

      return (data as SwingRecommendationRow[]).map(rowToRecommendation);
    },
  });
}

// Add swing recommendation
export function useAddSwingRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rec: Omit<SwingRecommendation, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('swing_recommendations')
        .insert({
          stock_name: rec.stockName,
          current_price: rec.currentPrice,
          image_url: rec.imageUrl,
          target1: rec.target1,
          target2: rec.target2,
          stoploss: rec.stoploss,
          allocation: rec.allocation,
          notes: rec.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return rowToRecommendation(data as SwingRecommendationRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swing-recommendations'] });
      toast.success('Swing recommendation added successfully');
    },
    onError: (error) => {
      console.error('Error adding recommendation:', error);
      toast.error('Failed to add recommendation');
    },
  });
}

// Update swing recommendation
export function useUpdateSwingRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...rec }: Partial<SwingRecommendation> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      
      if (rec.stockName !== undefined) updateData.stock_name = rec.stockName;
      if (rec.currentPrice !== undefined) updateData.current_price = rec.currentPrice;
      if (rec.imageUrl !== undefined) updateData.image_url = rec.imageUrl;
      if (rec.target1 !== undefined) updateData.target1 = rec.target1;
      if (rec.target2 !== undefined) updateData.target2 = rec.target2;
      if (rec.stoploss !== undefined) updateData.stoploss = rec.stoploss;
      if (rec.allocation !== undefined) updateData.allocation = rec.allocation;
      if (rec.notes !== undefined) updateData.notes = rec.notes;
      if (rec.exitReason !== undefined) updateData.exit_reason = rec.exitReason;
      if (rec.exitPrice !== undefined) updateData.exit_price = rec.exitPrice;
      if (rec.exitedAt !== undefined) updateData.exited_at = rec.exitedAt.toISOString();

      const { data, error } = await supabase
        .from('swing_recommendations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return rowToRecommendation(data as SwingRecommendationRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swing-recommendations'] });
    },
    onError: (error) => {
      console.error('Error updating recommendation:', error);
      toast.error('Failed to update recommendation');
    },
  });
}

// Delete swing recommendation
export function useDeleteSwingRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('swing_recommendations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swing-recommendations'] });
      toast.success('Recommendation deleted');
    },
    onError: (error) => {
      console.error('Error deleting recommendation:', error);
      toast.error('Failed to delete recommendation');
    },
  });
}

// Update current price
export function useUpdateSwingCurrentPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, price }: { id: string; price: number }) => {
      const { error } = await supabase
        .from('swing_recommendations')
        .update({ current_price: price })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swing-recommendations'] });
      toast.success('Price updated');
    },
    onError: (error) => {
      console.error('Error updating price:', error);
      toast.error('Failed to update price');
    },
  });
}

// Exit recommendation
export function useExitSwingRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, exitReason, exitPrice }: { id: string; exitReason: SwingExitReason; exitPrice?: number }) => {
      const { error } = await supabase
        .from('swing_recommendations')
        .update({
          exit_reason: exitReason,
          exit_price: exitPrice,
          exited_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swing-recommendations'] });
      toast.success('Trade exited successfully');
    },
    onError: (error) => {
      console.error('Error exiting recommendation:', error);
      toast.error('Failed to exit trade');
    },
  });
}
