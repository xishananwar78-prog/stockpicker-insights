import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { SwingRecommendationCard } from '@/components/SwingRecommendationCard';
import { SwingRecommendationForm } from '@/components/SwingRecommendationForm';
import { UpdatePriceDialog } from '@/components/UpdatePriceDialog';
import { SwingExitDialog } from '@/components/SwingExitDialog';
import { Button } from '@/components/ui/button';
import { UpstoxBanner } from '@/components/UpstoxBanner';
import { LockedOverlay } from '@/components/LockedOverlay';
import { useAuthContext } from '@/components/AuthContext';
import {
  useSwingRecommendations,
  useUpdateSwingRecommendation,
  useDeleteSwingRecommendation,
  useUpdateSwingCurrentPrice,
  useExitSwingRecommendation,
} from '@/hooks/useSwingRecommendations';
import { calculateSwingStatus } from '@/lib/swingUtils';
import { SwingRecommendation, SwingExitReason } from '@/types/recommendation';
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

export default function SwingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { data: recommendations = [], isLoading } = useSwingRecommendations();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [updatePriceRec, setUpdatePriceRec] = useState<SwingRecommendation | null>(null);
  const [exitRec, setExitRec] = useState<SwingRecommendation | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const updateMutation = useUpdateSwingRecommendation();
  const deleteMutation = useDeleteSwingRecommendation();
  const updatePriceMutation = useUpdateSwingCurrentPrice();
  const exitMutation = useExitSwingRecommendation();

  const rawRec = recommendations.find((r) => r.id === id);
  const recommendation = rawRec ? calculateSwingStatus(rawRec) : null;
  const isLockedForGuest = !user && recommendation?.status === 'OPEN';

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
          <Button variant="outline" onClick={() => navigate('/swing')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Swing
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const handleUpdate = (data: Omit<SwingRecommendation, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateMutation.mutate({ id: recommendation.id, ...data });
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    deleteMutation.mutate(recommendation.id, {
      onSuccess: () => navigate('/swing'),
    });
  };

  const handleExitSubmit = (exitReason: SwingExitReason, exitPrice?: number) => {
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
        <Button variant="ghost" onClick={() => navigate('/swing')} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Swing
        </Button>

        <UpstoxBanner />

        <SwingRecommendationCard
          recommendation={recommendation}
          onEdit={() => setIsFormOpen(true)}
          onDelete={() => setShowDelete(true)}
          onExit={() => setExitRec(rawRec!)}
          onUpdatePrice={() => setUpdatePriceRec(rawRec!)}
        />
      </div>

      <SwingRecommendationForm
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
        <SwingExitDialog
          open={!!exitRec}
          onOpenChange={(open) => !open && setExitRec(null)}
          onSubmit={handleExitSubmit}
          stockName={exitRec.stockName}
          target1={exitRec.target1}
          target2={exitRec.target2}
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
