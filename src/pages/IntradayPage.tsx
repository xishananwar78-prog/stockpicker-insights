import { useState, useMemo } from 'react';
import { Plus, Calendar, X, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { IntradayCompactCard } from '@/components/IntradayCompactCard';
import { RecommendationForm } from '@/components/RecommendationForm';
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
import {
  useIntradayRecommendations,
  useAddIntradayRecommendation,
} from '@/hooks/useIntradayRecommendations';
import { useAuthContext } from '@/components/AuthContext';
import { calculateRecommendationStatus } from '@/lib/recommendationUtils';
import { IntradayRecommendation } from '@/types/recommendation';

export default function IntradayPage() {
  const { isAdmin } = useAuthContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [dateFilter, setDateFilter] = useState<string>('');

  const { data: intradayRecommendations = [], isLoading } = useIntradayRecommendations();
  const addMutation = useAddIntradayRecommendation();

  const calculatedRecommendations = useMemo(() => {
    return intradayRecommendations
      .map((rec) => calculateRecommendationStatus(rec))
      .filter((rec) => {
        if (statusFilter === 'open' && rec.status !== 'OPEN') return false;
        if (statusFilter === 'exit' && rec.status !== 'EXIT') return false;
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
    addMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

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
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-brand text-primary-foreground hover:opacity-90 shadow-glow-brand"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Recommendation
            </Button>
          )}
        </div>

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
            <Button variant="outline" size="icon" onClick={clearFilters} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Compact Recommendations List */}
        <div className="space-y-3">
          {calculatedRecommendations.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground">No recommendations found</p>
              {isAdmin && (
                <Button onClick={() => setIsFormOpen(true)} variant="link" className="text-primary mt-2">
                  Add your first recommendation
                </Button>
              )}
            </div>
          ) : (
            calculatedRecommendations.map((rec) => (
              <IntradayCompactCard key={rec.id} recommendation={rec} />
            ))
          )}
        </div>
      </div>

      <RecommendationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAdd}
        mode="add"
      />
    </AdminLayout>
  );
}
