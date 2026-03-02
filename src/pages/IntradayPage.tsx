import { useState, useMemo } from 'react';
import { Plus, Calendar, X, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { IntradayCompactCard } from '@/components/IntradayCompactCard';
import { RecommendationForm } from '@/components/RecommendationForm';
import { UpstoxBanner } from '@/components/UpstoxBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useIntradayRecommendations,
  useAddIntradayRecommendation,
} from '@/hooks/useIntradayRecommendations';
import { useAuthContext } from '@/components/AuthContext';
import { calculateRecommendationStatus } from '@/lib/recommendationUtils';
import { IntradayRecommendation } from '@/types/recommendation';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'open' | 'exit';

export default function IntradayPage() {
  const { isAdmin } = useAuthContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('open');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const { data: intradayRecommendations = [], isLoading } = useIntradayRecommendations();
  const addMutation = useAddIntradayRecommendation();

  const allCalculated = useMemo(() => {
    return intradayRecommendations.map((rec) => calculateRecommendationStatus(rec));
  }, [intradayRecommendations]);

  const openCount = allCalculated.filter((r) => r.status === 'OPEN').length;
  const exitCount = allCalculated.filter((r) => r.status === 'EXIT').length;

  const calculatedRecommendations = useMemo(() => {
    return allCalculated
      .filter((rec) => {
        if (activeTab === 'open' && rec.status !== 'OPEN') return false;
        if (activeTab === 'exit' && rec.status !== 'EXIT') return false;
        if (dateFrom || dateTo) {
          const recDate = new Date(rec.createdAt).toISOString().split('T')[0];
          if (dateFrom && recDate < dateFrom) return false;
          if (dateTo && recDate > dateTo) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allCalculated, activeTab, dateFrom, dateTo]);

  const clearDates = () => {
    setDateFrom('');
    setDateTo('');
  };

  const hasDates = dateFrom || dateTo;

  const handleAdd = (data: Omit<IntradayRecommendation, 'id' | 'createdAt' | 'updatedAt'>) => {
    addMutation.mutate(data);
  };

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'open', label: 'Open', count: openCount },
    { key: 'exit', label: 'Exited', count: exitCount },
    { key: 'all', label: 'All', count: allCalculated.length },
  ];

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
      <div className="p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Intraday Recommendations</h1>
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

        {/* Toggle Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn(
                  'ml-1.5 text-xs font-mono',
                  activeTab === tab.key ? 'text-primary-foreground/80' : 'text-muted-foreground'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Date Range */}
        <div className="flex flex-row items-center gap-2 flex-wrap">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From"
              className="pl-10 bg-input border-border w-40 text-sm"
            />
          </div>
          <span className="text-muted-foreground text-sm">to</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To"
              className="pl-10 bg-input border-border w-40 text-sm"
            />
          </div>
          {hasDates && (
            <Button variant="outline" size="icon" onClick={clearDates} className="shrink-0 h-9 w-9">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Recommendations List */}
        <div className="flex flex-col gap-3">
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
