import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { IntradayRecommendation, ExitReason, TradeSide } from '@/types/recommendation';
import { toast } from 'sonner';

// Database row type (snake_case)
interface IntradayRecommendationRow {
  id: string;
  stock_name: string;
  current_price: number;
  trade_side: 'BUY' | 'SELL';
  recommended_price: number;
  target1: number;
  target2: number;
  target3: number;
  stoploss: number;
  exit_reason: string | null;
  exit_price: number | null;
  exited_at: string | null;
  created_at: string;
  updated_at: string;
}

// Convert database row to frontend type
function rowToRecommendation(row: IntradayRecommendationRow): IntradayRecommendation {
  return {
    id: row.id,
    stockName: row.stock_name,
    currentPrice: Number(row.current_price),
    tradeSide: row.trade_side as TradeSide,
    recommendedPrice: Number(row.recommended_price),
    target1: Number(row.target1),
    target2: Number(row.target2),
    target3: Number(row.target3),
    stoploss: Number(row.stoploss),
    exitReason: row.exit_reason as ExitReason,
    exitPrice: row.exit_price ? Number(row.exit_price) : undefined,
    exitedAt: row.exited_at ? new Date(row.exited_at) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// Fetch all intraday recommendations
export function useIntradayRecommendations() {
  return useQuery({
    queryKey: ['intraday-recommendations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('intraday_recommendations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching intraday recommendations:', error);
        throw error;
      }

      return (data as IntradayRecommendationRow[]).map(rowToRecommendation);
    },
  });
}

// Add intraday recommendation
export function useAddIntradayRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rec: Omit<IntradayRecommendation, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('intraday_recommendations')
        .insert({
          stock_name: rec.stockName,
          current_price: rec.currentPrice,
          trade_side: rec.tradeSide,
          recommended_price: rec.recommendedPrice,
          target1: rec.target1,
          target2: rec.target2,
          target3: rec.target3,
          stoploss: rec.stoploss,
        })
        .select()
        .single();

      if (error) throw error;
      return rowToRecommendation(data as IntradayRecommendationRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intraday-recommendations'] });
      toast.success('Intraday recommendation added successfully');
    },
    onError: (error) => {
      console.error('Error adding recommendation:', error);
      toast.error('Failed to add recommendation');
    },
  });
}

// Update intraday recommendation
export function useUpdateIntradayRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...rec }: Partial<IntradayRecommendation> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      
      if (rec.stockName !== undefined) updateData.stock_name = rec.stockName;
      if (rec.currentPrice !== undefined) updateData.current_price = rec.currentPrice;
      if (rec.tradeSide !== undefined) updateData.trade_side = rec.tradeSide;
      if (rec.recommendedPrice !== undefined) updateData.recommended_price = rec.recommendedPrice;
      if (rec.target1 !== undefined) updateData.target1 = rec.target1;
      if (rec.target2 !== undefined) updateData.target2 = rec.target2;
      if (rec.target3 !== undefined) updateData.target3 = rec.target3;
      if (rec.stoploss !== undefined) updateData.stoploss = rec.stoploss;
      if (rec.exitReason !== undefined) updateData.exit_reason = rec.exitReason;
      if (rec.exitPrice !== undefined) updateData.exit_price = rec.exitPrice;
      if (rec.exitedAt !== undefined) updateData.exited_at = rec.exitedAt.toISOString();

      const { data, error } = await supabase
        .from('intraday_recommendations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return rowToRecommendation(data as IntradayRecommendationRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intraday-recommendations'] });
    },
    onError: (error) => {
      console.error('Error updating recommendation:', error);
      toast.error('Failed to update recommendation');
    },
  });
}

// Delete intraday recommendation
export function useDeleteIntradayRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('intraday_recommendations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intraday-recommendations'] });
      toast.success('Recommendation deleted');
    },
    onError: (error) => {
      console.error('Error deleting recommendation:', error);
      toast.error('Failed to delete recommendation');
    },
  });
}

// Update current price
export function useUpdateIntradayCurrentPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, price }: { id: string; price: number }) => {
      const { error } = await supabase
        .from('intraday_recommendations')
        .update({ current_price: price })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intraday-recommendations'] });
      toast.success('Price updated');
    },
    onError: (error) => {
      console.error('Error updating price:', error);
      toast.error('Failed to update price');
    },
  });
}

// Exit recommendation
export function useExitIntradayRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, exitReason, exitPrice }: { id: string; exitReason: ExitReason; exitPrice?: number }) => {
      const { error } = await supabase
        .from('intraday_recommendations')
        .update({
          exit_reason: exitReason,
          exit_price: exitPrice,
          exited_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intraday-recommendations'] });
      toast.success('Trade exited successfully');
    },
    onError: (error) => {
      console.error('Error exiting recommendation:', error);
      toast.error('Failed to exit trade');
    },
  });
}
