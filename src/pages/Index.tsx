import { Link } from 'react-router-dom';
import { Zap, TrendingUp, BarChart3, ArrowRight } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { UpstoxBanner } from '@/components/UpstoxBanner';
import { cn } from '@/lib/utils';

const Index = () => {

  const menuItems = [
    {
      href: '/intraday',
      icon: Zap,
      title: 'Intraday',
      subtitle: 'Same-day trading recommendations',
      gradient: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-500',
    },
    {
      href: '/swing',
      icon: TrendingUp,
      title: 'Swing',
      subtitle: 'Multi-day position trades',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-500',
    },
    {
      href: '/breakout',
      icon: BarChart3,
      title: 'Breakout',
      subtitle: 'Breakout trading opportunities',
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

        {/* Upstox Banner */}
        <UpstoxBanner />

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
              to="/swing"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              + Add Swing
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
