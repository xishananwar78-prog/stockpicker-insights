import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Gift, Crown, CheckCircle2, ArrowRight, Mail, Clock, Shield, Star, Zap, TrendingUp, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';

const UPSTOX_LINK = 'https://upstox.com/open-demat-account?f=0VQ4';
const UPI_ID = 'time2trade@axl';
const EMAIL = 'time2trade.pro@gmail.com';

export default function SubscribePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium">
            <Zap className="h-3.5 w-3.5" />
            Limited Time Offer
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
            Unlock Expert <span className="text-primary">Swing Trade</span> Picks
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Get real-time recommendations from our analysts. Join 100+ traders already profiting from our curated picks.
          </p>
        </div>

        {/* What You Get */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, title: 'Live Picks', desc: 'Real-time swing trade recommendations with entry, targets & stoploss' },
            { icon: Shield, title: 'Risk Managed', desc: 'Every trade comes with clear stoploss levels to protect your capital' },
            { icon: Star, title: 'Proven Track Record', desc: 'Transparent P&L history — check our past performance anytime' },
          ].map((item) => (
            <div key={item.title} className="bg-card border border-border rounded-xl p-4 text-center space-y-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Option 1: Free via Upstox */}
          <Card className="relative overflow-hidden border-primary/40 bg-gradient-to-br from-primary/5 via-card to-card">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
              FREE
            </div>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Gift className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Open Upstox Account</h2>
                </div>
                <p className="text-muted-foreground text-sm">
                  Open a <strong className="text-foreground">free Demat account</strong> with Upstox through our link and get:
                </p>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                <p className="text-3xl font-extrabold text-primary">3 Months</p>
                <p className="text-sm text-muted-foreground mt-1">Free subscription — ₹0 cost</p>
              </div>

              <ul className="space-y-2.5">
                {[
                  'Zero account opening charges',
                  '3 months full access to all swing picks',
                  'Start trading immediately',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-profit mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button asChild className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90 shadow-glow-brand h-12 text-base font-semibold">
                <a href={UPSTOX_LINK} target="_blank" rel="noopener noreferrer">
                  Open Free Account
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Option 2: Paid */}
          <Card className="relative overflow-hidden border-border bg-card">
            <div className="absolute top-0 right-0 bg-accent text-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
              BEST VALUE
            </div>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-warning" />
                  <h2 className="text-xl font-bold text-foreground">Premium Subscription</h2>
                </div>
                <p className="text-muted-foreground text-sm">
                  Try us out at a special introductory price, then upgrade to lifetime:
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-secondary/60 border border-border rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground line-through">₹999</p>
                  <p className="text-3xl font-extrabold text-foreground">₹349</p>
                  <p className="text-sm text-muted-foreground mt-1">for first 3 months</p>
                </div>
                <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                  <ArrowRight className="h-3 w-3" />
                  <span>Happy with our picks? Go lifetime:</span>
                </div>
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-center">
                  <p className="text-2xl font-extrabold text-warning">₹721</p>
                  <p className="text-xs text-muted-foreground mt-0.5">One-time payment · Lifetime access</p>
                </div>
              </div>

              <ul className="space-y-2.5">
                {[
                  'Full access to all swing trade picks',
                  'Entry price, targets & stoploss alerts',
                  'Lifetime option after trial — never pay again',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-profit mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="bg-muted rounded-lg p-3 flex items-center justify-center gap-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Pay via UPI</p>
                  <p className="text-base font-bold text-foreground font-mono tracking-wide select-all">{UPI_ID}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0 text-muted-foreground hover:text-primary"
                >
                  {copied ? <Check className="h-4 w-4 text-profit" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How to Activate */}
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-5">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              How to Get Started
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  step: '1',
                  title: 'Choose Your Plan',
                  desc: 'Open an Upstox account (free) or pay via UPI',
                },
                {
                  step: '2',
                  title: 'Send Proof',
                  desc: 'Email your payment screenshot or Upstox confirmation',
                },
                {
                  step: '3',
                  title: 'Get Access',
                  desc: 'Receive your login credentials within 24 hours',
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center space-y-2">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            <Separator className="bg-border" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/50 rounded-lg p-4">
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-foreground flex items-center gap-2 justify-center sm:justify-start">
                  <Mail className="h-4 w-4 text-primary" />
                  Send proof to
                </p>
                <a href={`mailto:${EMAIL}`} className="text-primary font-semibold text-sm hover:underline select-all">
                  {EMAIL}
                </a>
              </div>
              <Button asChild variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
                <a href={`mailto:${EMAIL}?subject=Subscription%20Proof%20-%20stockPICKER&body=Hi%2C%0A%0AI%20have%20completed%20the%20payment%2Faccount%20opening.%20Please%20find%20the%20proof%20attached.%0A%0ARegards`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email Now
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trust Footer */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          🔒 Your credentials will be sent within 24 hours of verification. Already a subscriber? Use the Login button in the menu.
        </p>
      </div>
    </AdminLayout>
  );
}
