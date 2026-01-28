import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Filter, Calendar, Search, X, TrendingUp, TrendingDown } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRecommendationStore } from '@/store/recommendationStore';
import {
  calculateRecommendationStatus,
  formatCurrency,
  formatPercent,
  formatExitReason,
} from '@/lib/recommendationUtils';
import { RecommendationStatus, ExitReason } from '@/types/recommendation';
import { cn } from '@/lib/utils';

export default function IntradayReportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const { intradayRecommendations } = useRecommendationStore();

  // Calculate all recommendations with status
  const calculatedRecommendations = useMemo(() => {
    return intradayRecommendations
      .map((rec) => calculateRecommendationStatus(rec))
      .filter((rec) => rec.status === 'EXIT' || rec.status === 'NOT_EXECUTED');
  }, [intradayRecommendations]);

  // Apply filters
  const filteredRecommendations = useMemo(() => {
    return calculatedRecommendations
      .filter((rec) => {
        // Search filter
        if (searchQuery && !rec.stockName.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'profit' && rec.profitLoss <= 0) return false;
          if (statusFilter === 'loss' && rec.profitLoss >= 0) return false;
          if (statusFilter === 'not_executed' && rec.status !== 'NOT_EXECUTED') return false;
        }

        // Date filter
        if (dateFilter) {
          const recDate = new Date(rec.createdAt).toISOString().split('T')[0];
          if (recDate !== dateFilter) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [calculatedRecommendations, searchQuery, statusFilter, dateFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    const profits = filteredRecommendations
      .filter((r) => r.profitLoss > 0)
      .reduce((sum, r) => sum + r.profitLoss, 0);
    
    const losses = filteredRecommendations
      .filter((r) => r.profitLoss < 0)
      .reduce((sum, r) => sum + Math.abs(r.profitLoss), 0);

    const successfulTrades = filteredRecommendations.filter((r) => r.profitLoss > 0).length;
    const totalTrades = filteredRecommendations.filter((r) => r.status !== 'NOT_EXECUTED').length;
    const winRate = totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;

    return {
      totalProfit: profits,
      totalLoss: losses,
      netProfitLoss: profits - losses,
      winRate,
      totalTrades,
      successfulTrades,
    };
  }, [filteredRecommendations]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateFilter;

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/intraday">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Daily Intraday Report</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View all exited intraday recommendations
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gradient-card p-4 border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-profit" />
              <span className="text-xs text-muted-foreground">Total Profit</span>
            </div>
            <p className="text-xl font-bold font-mono text-profit">
              {formatCurrency(totals.totalProfit)}
            </p>
          </Card>

          <Card className="bg-gradient-card p-4 border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-loss" />
              <span className="text-xs text-muted-foreground">Total Loss</span>
            </div>
            <p className="text-xl font-bold font-mono text-loss">
              {formatCurrency(totals.totalLoss)}
            </p>
          </Card>

          <Card className={cn(
            "p-4 border-border",
            totals.netProfitLoss >= 0 ? "bg-profit-muted" : "bg-loss-muted"
          )}>
            <p className="text-xs text-muted-foreground mb-2">Net P&L</p>
            <p className={cn(
              "text-xl font-bold font-mono",
              totals.netProfitLoss >= 0 ? "text-profit" : "text-loss"
            )}>
              {totals.netProfitLoss >= 0 ? '+' : ''}{formatCurrency(totals.netProfitLoss)}
            </p>
          </Card>

          <Card className="bg-gradient-card p-4 border-border">
            <p className="text-xs text-muted-foreground mb-2">Win Rate</p>
            <p className="text-xl font-bold font-mono text-primary">
              {totals.winRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {totals.successfulTrades}/{totals.totalTrades} trades
            </p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stock..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-input border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="profit">Profit</SelectItem>
              <SelectItem value="loss">Loss</SelectItem>
              <SelectItem value="not_executed">Not Executed</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 bg-input border-border w-full sm:w-44"
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

        {/* Table - Mobile optimized */}
        <Card className="bg-card border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Stock</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecommendations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredRecommendations.map((rec) => (
                    <TableRow key={rec.id} className="border-border">
                      <TableCell>
                        <div className="font-medium text-foreground">{rec.stockName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {new Date(rec.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={rec.status} exitReason={rec.exitReason} />
                      </TableCell>
                      <TableCell className="text-right">
                        {rec.status === 'NOT_EXECUTED' ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className={cn(
                            'font-mono font-semibold text-sm',
                            rec.profitLoss > 0 ? 'text-profit' : 'text-loss'
                          )}>
                            {rec.profitLoss > 0 ? '+' : ''}{formatCurrency(rec.profitLoss)}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Summary Row */}
                  <TableRow className="bg-secondary/30 border-border font-semibold">
                    <TableCell colSpan={2} className="text-foreground">
                      Total ({filteredRecommendations.length} records)
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(
                        'font-mono text-sm',
                        totals.netProfitLoss >= 0 ? 'text-profit' : 'text-loss'
                      )}>
                        {totals.netProfitLoss >= 0 ? '+' : ''}{formatCurrency(totals.netProfitLoss)}
                      </span>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
}
