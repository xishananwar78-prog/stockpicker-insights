import { Link } from 'react-router-dom';
import { Zap, TrendingUp, BarChart3, ArrowRight } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { useRecommendationStore } from '@/store/recommendationStore';
import { calculateRecommendationStatus, isWithin48Hours, formatCurrency } from '@/lib/recommendationUtils';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const Index = () => {
  const { intradayRecommendations } = useRecommendationStore();

  const stats = useMemo(() => {
    const active = intradayRecommendations
      .filter((rec) => isWithin48Hours(rec.createdAt))
      .map((rec) => calculateRecommendationStatus(rec));

    const openCount = active.filter((r) => r.status === 'OPEN').length;
    const executedCount = active.filter((r) => r.status === 'EXECUTED').length;
    
    const allCalculated = intradayRecommendations.map((rec) => 
      calculateRecommendationStatus(rec)
    );
    
    const totalProfit = allCalculated
      .filter((r) => r.status === 'EXIT' && r.profitLoss > 0)
      .reduce((sum, r) => sum + r.profitLoss, 0);
    
    const totalLoss = allCalculated
      .filter((r) => r.status === 'EXIT' && r.profitLoss < 0)
      .reduce((sum, r) => sum + Math.abs(r.profitLoss), 0);

    return {
      openCount,
      executedCount,
      totalCount: intradayRecommendations.length,
      totalProfit,
      totalLoss,
      netPL: totalProfit - totalLoss,
    };
  }, [intradayRecommendations]);

  const menuItems = [
    {
      href: '/intraday',
      icon: Zap,
      title: 'Intraday',
      subtitle: 'Same-day trading recommendations',
      stats: `${stats.openCount} open, ${stats.executedCount} executed`,
      gradient: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-500',
    },
    {
      href: '/swing',
      icon: TrendingUp,
      title: 'Swing',
      subtitle: 'Multi-day position trades',
      stats: 'Coming soon',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-500',
      disabled: true,
    },
    {
      href: '/breakout',
      icon: BarChart3,
      title: 'Breakout',
      subtitle: 'Breakout trading opportunities',
      stats: 'Coming soon',
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-500',
      disabled: true,
    },
  ];

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-hero rounded-2xl p-6 border border-border">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome to <span className="text-gradient-brand">stockPICKER</span>
          </h1>
          <p className="text-muted-foreground">
            Professional stock recommendations for smart trading
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className={cn(
            "p-4 border-border",
            stats.netPL >= 0 ? "bg-profit-muted" : "bg-loss-muted"
          )}>
            <p className="text-xs text-muted-foreground mb-1">Net P&L (All Time)</p>
            <p className={cn(
              "text-xl font-bold font-mono",
              stats.netPL >= 0 ? "text-profit" : "text-loss"
            )}>
              {stats.netPL >= 0 ? '+' : ''}{formatCurrency(stats.netPL)}
            </p>
          </Card>
          
          <Card className="bg-gradient-card p-4 border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Recommendations</p>
            <p className="text-xl font-bold font-mono text-primary">
              {stats.totalCount}
            </p>
          </Card>
        </div>

        {/* Menu Cards */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Recommendations</h2>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            if (item.disabled) {
              return (
                <Card
                  key={item.href}
                  className="bg-gradient-card border-border p-4 opacity-60 cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                      item.gradient
                    )}>
                      <Icon className={cn("h-6 w-6", item.iconColor)} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.stats}</p>
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded">Soon</span>
                  </div>
                </Card>
              );
            }

            return (
              <Link key={item.href} to={item.href}>
                <Card className="bg-gradient-card border-border p-4 hover:border-primary/50 transition-all duration-200 group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                      item.gradient
                    )}>
                      <Icon className={cn("h-6 w-6", item.iconColor)} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      <p className="text-xs text-primary mt-1 font-medium">{item.stats}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-card border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
          <div className="flex gap-2 flex-wrap">
            <Link
              to="/intraday"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              + Add Intraday
            </Link>
            <Link
              to="/intraday-report"
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              📊 View Reports
            </Link>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Index;
