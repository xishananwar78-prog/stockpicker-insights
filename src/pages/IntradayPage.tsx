import { useState, useMemo } from 'react';
import { Plus, Calendar, X } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { RecommendationCard } from '@/components/RecommendationCard';
import { RecommendationForm } from '@/components/RecommendationForm';
import { UpdatePriceDialog } from '@/components/UpdatePriceDialog';
import { ExitRuleDialog } from '@/components/ExitRuleDialog';
import { UpstoxBanner } from '@/components/UpstoxBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRecommendationStore } from '@/store/recommendationStore';
import { useAuthContext } from '@/components/AuthContext';
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
import { toast } from 'sonner';

export default function IntradayPage() {
  const { isAdmin } = useAuthContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<IntradayRecommendation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatePriceRec, setUpdatePriceRec] = useState<IntradayRecommendation | null>(null);
  const [exitRec, setExitRec] = useState<IntradayRecommendation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [dateFilter, setDateFilter] = useState<string>('');

  const {
    intradayRecommendations,
    addIntradayRecommendation,
    updateIntradayRecommendation,
    deleteIntradayRecommendation,
    updateCurrentPrice,
    exitRecommendation,
  } = useRecommendationStore();

  // Calculate status for all recommendations and apply filters
  const calculatedRecommendations = useMemo(() => {
    return intradayRecommendations
      .map((rec) => calculateRecommendationStatus(rec))
      .filter((rec) => {
        // Status filter
        if (statusFilter === 'open' && rec.status !== 'OPEN') return false;
        if (statusFilter === 'exit' && rec.status !== 'EXIT') return false;
        
        // Date filter
        if (dateFilter) {
          const recDate = new Date(rec.createdAt).toISOString().split('T')[0];
          if (recDate !== dateFilter) return false;
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [intradayRecommendations, statusFilter, dateFilter]);

  const openCount = intradayRecommendations
    .map((rec) => calculateRecommendationStatus(rec))
    .filter((rec) => rec.status === 'OPEN').length;
  
  const clearFilters = () => {
    setStatusFilter('open');
    setDateFilter('');
  };

  const hasActiveFilters = statusFilter !== 'open' || dateFilter;

  const handleAdd = (data: Omit<IntradayRecommendation, 'id' | 'createdAt' | 'updatedAt'>) => {
    addIntradayRecommendation(data);
    toast.success('Recommendation added successfully');
  };

  const handleEdit = (id: string) => {
    const rec = intradayRecommendations.find((r) => r.id === id);
    if (rec) {
      setEditingRec(rec);
      setIsFormOpen(true);
    }
  };

  const handleUpdate = (data: Omit<IntradayRecommendation, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingRec) {
      updateIntradayRecommendation(editingRec.id, data);
      setEditingRec(null);
      toast.success('Recommendation updated successfully');
    }
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteIntradayRecommendation(deletingId);
      setDeletingId(null);
      toast.success('Recommendation deleted');
    }
  };

  const handleUpdatePrice = (id: string) => {
    const rec = intradayRecommendations.find((r) => r.id === id);
    if (rec) {
      setUpdatePriceRec(rec);
    }
  };

  const handlePriceUpdate = (price: number) => {
    if (updatePriceRec) {
      updateCurrentPrice(updatePriceRec.id, price);
      setUpdatePriceRec(null);
      toast.success('Price updated');
    }
  };

  const handleExit = (id: string) => {
    const rec = intradayRecommendations.find((r) => r.id === id);
    if (rec) {
      setExitRec(rec);
    }
  };

  const handleExitSubmit = (exitReason: ExitReason, exitPrice?: number) => {
    if (exitRec) {
      exitRecommendation(exitRec.id, exitReason, exitPrice);
      setExitRec(null);
      toast.success('Trade exited successfully');
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Intraday Recommendations</h1>
          </div>
          {isAdmin && (
            <Button
              onClick={() => {
                setEditingRec(null);
                setIsFormOpen(true);
              }}
              className="bg-gradient-brand text-primary-foreground hover:opacity-90 shadow-glow-brand"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Recommendation
            </Button>
          )}
        </div>

        {/* Upstox Banner */}
        <UpstoxBanner />

        {/* Stats */}
        <div className="bg-open-muted rounded-xl p-4 border border-open/20 max-w-xs">
          <p className="text-2xl font-bold text-open font-mono">{openCount}</p>
          <p className="text-xs text-open/80 uppercase tracking-wider">Open Recommendations</p>
        </div>

        {/* Filters */}
        <div className="flex flex-row items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-input border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="exit">Exited</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 bg-input border-border w-44"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={clearFilters}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {calculatedRecommendations.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground">No recommendations found</p>
              {isAdmin && (
                <Button
                  onClick={() => setIsFormOpen(true)}
                  variant="link"
                  className="text-primary mt-2"
                >
                  Add your first recommendation
                </Button>
              )}
            </div>
          ) : (
            calculatedRecommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onEdit={handleEdit}
                onDelete={(id) => setDeletingId(id)}
                onExit={handleExit}
                onUpdatePrice={handleUpdatePrice}
              />
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      <RecommendationForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingRec(null);
        }}
        onSubmit={editingRec ? handleUpdate : handleAdd}
        initialData={editingRec || undefined}
        mode={editingRec ? 'edit' : 'add'}
      />

      {/* Update Price Dialog */}
      {updatePriceRec && (
        <UpdatePriceDialog
          open={!!updatePriceRec}
          onOpenChange={(open) => !open && setUpdatePriceRec(null)}
          onSubmit={handlePriceUpdate}
          stockName={updatePriceRec.stockName}
          currentPrice={updatePriceRec.currentPrice}
        />
      )}

      {/* Exit Rule Dialog */}
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recommendation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recommendation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-loss hover:bg-loss/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
