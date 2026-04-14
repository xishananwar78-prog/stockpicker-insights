import { Loader2, Plus, BookOpen, ChevronRight, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { UpstoxBanner } from '@/components/UpstoxBanner';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/components/AuthContext';
import { useLearningArticlesByCategory } from '@/hooks/useLearning';
import { format } from 'date-fns';
import { ManageLearningCategoryDialog } from '@/components/ManageLearningCategoryDialog';
import { Helmet } from 'react-helmet-async';

export default function LearningPage() {
  const { isAdmin } = useAuthContext();
  const { data: categoriesWithArticles = [], isLoading } = useLearningArticlesByCategory();

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
      <Helmet>
        <title>Learn Stock Market Trading - Free Guides & Tutorials | stockPICKER</title>
        <meta name="description" content="Master stock market trading with our comprehensive learning resources. Free guides on intraday trading, swing trading, technical analysis, and more." />
        <meta name="keywords" content="stock market learning, trading tutorials, intraday trading guide, swing trading, technical analysis, stock market for beginners" />
        <link rel="canonical" href="/learning" />
        <meta property="og:title" content="Learn Stock Market Trading | stockPICKER" />
        <meta property="og:description" content="Master stock market trading with our comprehensive learning resources." />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Stock Market Learning Center",
            "description": "Comprehensive guides and tutorials on stock market trading",
            "publisher": {
              "@type": "Organization",
              "name": "stockPICKER"
            }
          })}
        </script>
      </Helmet>

      <div className="p-4 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Learning Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Master the markets with our comprehensive guides</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <ManageLearningCategoryDialog />
              <Button asChild className="bg-gradient-brand text-primary-foreground hover:opacity-90 shadow-glow-brand">
                <Link to="/learning/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Article
                </Link>
              </Button>
            </div>
          )}
        </div>

        <UpstoxBanner />

        {categoriesWithArticles.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">No learning content yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {categoriesWithArticles.map((cat) => (
              <section key={cat.id} className="group">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                    <FolderOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground">{cat.name}</h2>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
                    {cat.articles.length} {cat.articles.length === 1 ? 'article' : 'articles'}
                  </span>
                </div>

                {/* Articles under this category */}
                {cat.articles.length === 0 ? (
                  <div className="ml-13 text-sm text-muted-foreground/60 italic py-3 pl-4 border-l-2 border-border">
                    No articles in this category yet
                  </div>
                ) : (
                  <div className="space-y-2 ml-1">
                    {cat.articles.map((article) => (
                      <Link
                        key={article.id}
                        to={`/learning/${article.slug}`}
                        className="group/card flex gap-3 bg-card rounded-xl border border-border overflow-hidden hover:border-primary/40 transition-all duration-200 p-3"
                      >
                        {article.thumbnail_url ? (
                          <div className="shrink-0 w-20 h-14 sm:w-28 sm:h-20 rounded-lg overflow-hidden">
                            <img
                              src={article.thumbnail_url}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="shrink-0 w-20 h-14 sm:w-28 sm:h-20 rounded-lg bg-muted flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                          <div className="flex items-center gap-2">
                            {!article.is_published && (
                              <span className="text-[10px] bg-warning-muted text-warning px-2 py-0.5 rounded font-medium uppercase">Draft</span>
                            )}
                            <span className="text-[11px] text-muted-foreground">
                              {format(new Date(article.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-foreground group-hover/card:text-primary transition-colors line-clamp-1 leading-snug">
                            {article.title}
                          </h3>
                          {article.subtitle && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{article.subtitle}</p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 self-center shrink-0 group-hover/card:text-primary transition-colors" />
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
