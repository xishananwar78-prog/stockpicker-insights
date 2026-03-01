import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { RecommendationCard } from '@/components/RecommendationCard';
import { RecommendationForm } from '@/components/RecommendationForm';
import { UpdatePriceDialog } from '@/components/UpdatePriceDialog';
import { ExitRuleDialog } from '@/components/ExitRuleDialog';
import { Button } from '@/components/ui/button';
import {
  useIntradayRecommendations,
  useUpdateIntradayRecommendation,
  useDeleteIntradayRecommendation,
  useUpdateIntradayCurrentPrice,
  useExitIntradayRecommendation,
} from '@/hooks/useIntradayRecommendations';
import { calculateRecommendationStatus } from '@/lib/recommendationUtils';
import { IntradayRecommendation, ExitReason } from '@/types/recommendation';
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

export default function IntradayDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: recommendations = [], isLoading } = useIntradayRecommendations();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [updatePriceRec, setUpdatePriceRec] = useState<IntradayRecommendation | null>(null);
  const [exitRec, setExitRec] = useState<IntradayRecommendation | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const updateMutation = useUpdateIntradayRecommendation();
  const deleteMutation = useDeleteIntradayRecommendation();
  const updatePriceMutation = useUpdateIntradayCurrentPrice();
  const exitMutation = useExitIntradayRecommendation();

  const rawRec = recommendations.find((r) => r.id === id);
  const recommendation = rawRec ? calculateRecommendationStatus(rawRec) : null;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!recommendation) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Recommendation not found</p>
          <Button variant="outline" onClick={() => navigate('/intraday')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Intraday
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const handleUpdate = (data: Omit<IntradayRecommendation, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateMutation.mutate({ id: recommendation.id, ...data });
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    deleteMutation.mutate(recommendation.id, {
      onSuccess: () => navigate('/intraday'),
    });
  };

  const handleExitSubmit = (exitReason: ExitReason, exitPrice?: number) => {
    exitMutation.mutate({ id: recommendation.id, exitReason, exitPrice });
    setExitRec(null);
  };

  const handlePriceUpdate = (price: number) => {
    updatePriceMutation.mutate({ id: recommendation.id, price });
    setUpdatePriceRec(null);
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4">
        <Button variant="ghost" onClick={() => navigate('/intraday')} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Intraday
        </Button>

        <RecommendationCard
          recommendation={recommendation}
          onEdit={() => setIsFormOpen(true)}
          onDelete={() => setShowDelete(true)}
          onExit={() => setExitRec(rawRec!)}
          onUpdatePrice={() => setUpdatePriceRec(rawRec!)}
        />
      </div>

      <RecommendationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleUpdate}
        initialData={rawRec || undefined}
        mode="edit"
      />

      {updatePriceRec && (
        <UpdatePriceDialog
          open={!!updatePriceRec}
          onOpenChange={(open) => !open && setUpdatePriceRec(null)}
          onSubmit={handlePriceUpdate}
          stockName={updatePriceRec.stockName}
          currentPrice={updatePriceRec.currentPrice}
        />
      )}

      {exitRec && (
        <ExitRuleDialog
          open={!!exitRec}
          onOpenChange={(open) => !open && setExitRec(null)}
          onSubmit={handleExitSubmit}
          stockName={exitRec.stockName}
          target1={exitRec.target1}
          target2={exitRec.target2}
          target3={exitRec.target3}
          stoploss={exitRec.stoploss}
        />
      )}

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recommendation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-loss hover:bg-loss/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
