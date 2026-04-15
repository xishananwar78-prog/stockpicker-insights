import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { UpstoxBanner } from '@/components/UpstoxBanner';
import { Button } from '@/components/ui/button';
import { useLearningArticle, useDeleteLearningArticle, useLearningCategories } from '@/hooks/useLearning';
import { useAuthContext } from '@/components/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AdSenseAd } from '@/components/AdSenseAd';
import { Helmet } from 'react-helmet-async';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState, useMemo } from 'react';

function splitContentWithAds(html: string) {
  // Insert ads ONLY above headings (h2-h6) that appear after enough paragraphs.
  // This keeps ads separate from content like lists, quotes, etc.
  const parts: { html: string; insertAd: boolean }[] = [];
  
  // Split by heading tags to find natural break points
  const headingRegex = /(<h[2-6][^>]*>)/gi;
  let lastIndex = 0;
  let pCount = 0;
  let match;
  
  while ((match = headingRegex.exec(html)) !== null) {
    const chunk = html.substring(lastIndex, match.index);
    // Count paragraphs in this chunk
    const pMatches = chunk.match(/<\/p>/gi);
    pCount += pMatches ? pMatches.length : 0;
    
    // Insert ad above this heading if we've passed 3+ paragraphs since last ad
    const shouldInsertAd = pCount >= 3;
    parts.push({ html: chunk, insertAd: shouldInsertAd });
    if (shouldInsertAd) pCount = 0;
    
    lastIndex = match.index;
  }
  
  // Remaining content after last heading
  if (lastIndex < html.length) {
    parts.push({ html: html.substring(lastIndex), insertAd: false });
  }
  
  return parts;
}

export default function LearningArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuthContext();
  const { data: article, isLoading } = useLearningArticle(slug || '');
  const { data: categories = [] } = useLearningCategories();
  const deleteMutation = useDeleteLearningArticle();
  const [showDelete, setShowDelete] = useState(false);

  const category = useMemo(() => {
    if (!article?.category_id) return null;
    return categories.find(c => c.id === article.category_id);
  }, [article, categories]);

  const contentParts = useMemo(() => {
    if (!article?.content) return null;
    return splitContentWithAds(article.content);
  }, [article?.content]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!article) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Article not found</p>
          <Button variant="outline" onClick={() => navigate('/learning')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Learning
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(article.id, {
      onSuccess: () => {
        toast.success('Article deleted');
        navigate('/learning');
      },
      onError: () => toast.error('Failed to delete article'),
    });
  };

  const metaTitle = article.meta_title || article.title;
  const metaDesc = article.meta_description || article.subtitle || `Learn about ${article.title} - stockPICKER Learning Center`;

  return (
    <AdminLayout>
      <Helmet>
        <title>{metaTitle} | stockPICKER Learning</title>
        <meta name="description" content={metaDesc} />
        {article.meta_keywords && <meta name="keywords" content={article.meta_keywords} />}
        <link rel="canonical" href={`/learning/${article.slug}`} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:type" content="article" />
        {article.thumbnail_url && <meta property="og:image" content={article.thumbnail_url} />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": metaDesc,
            "datePublished": article.published_at || article.created_at,
            "dateModified": article.updated_at,
            ...(article.thumbnail_url && { "image": article.thumbnail_url }),
            "publisher": {
              "@type": "Organization",
              "name": "stockPICKER"
            }
          })}
        </script>
      </Helmet>

      <article className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/learning')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/learning/${slug}/edit`}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDelete(true)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {article.thumbnail_url && (
          <div className="rounded-xl overflow-hidden">
            <img src={article.thumbnail_url} alt={article.title} className="w-full object-cover max-h-[400px]" loading="lazy" />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {category && (
              <span className="text-[11px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">{category.name}</span>
            )}
            {!article.is_published && (
              <span className="text-[10px] bg-warning-muted text-warning px-2 py-0.5 rounded font-medium uppercase">Draft</span>
            )}
            <span className="text-sm text-muted-foreground">
              {format(new Date(article.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{article.title}</h1>
          {article.subtitle && (
            <p className="text-lg text-muted-foreground">{article.subtitle}</p>
          )}
        </div>

        {/* Content with ads after every 3 paragraphs */}
        {contentParts && contentParts.map((part, i) => (
          <div key={i}>
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: part.html }} />
            {part.insertAd && <AdSenseAd />}
          </div>
        ))}

        {/* Upstox banner at end */}
        <UpstoxBanner />
      </article>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-loss hover:bg-loss/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
