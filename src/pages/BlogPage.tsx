import { Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { UpstoxBanner } from '@/components/UpstoxBanner';
import { Button } from '@/components/ui/button';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useAuthContext } from '@/components/AuthContext';
import { format } from 'date-fns';

export default function BlogPage() {
  const { isAdmin } = useAuthContext();
  const { data: posts = [], isLoading } = useBlogPosts(isAdmin);

  // Show only recent 10 posts
  const recentPosts = posts.slice(0, 10);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Blog</h1>
          {isAdmin && (
            <Button asChild className="bg-gradient-brand text-primary-foreground hover:opacity-90 shadow-glow-brand">
              <Link to="/blog/new">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Link>
            </Button>
          )}
        </div>

        <UpstoxBanner />

        {recentPosts.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">No blog posts yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group flex gap-4 bg-card rounded-xl border border-border overflow-hidden hover:border-primary/40 transition-all duration-200 p-3"
              >
                {post.thumbnail_url ? (
                  <div className="shrink-0 w-28 h-20 sm:w-36 sm:h-24 rounded-lg overflow-hidden">
                    <img
                      src={post.thumbnail_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 w-28 h-20 sm:w-36 sm:h-24 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-2xl text-muted-foreground">📝</span>
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                  <div className="flex items-center gap-2">
                    {!post.is_published && (
                      <span className="text-[10px] bg-warning-muted text-warning px-2 py-0.5 rounded font-medium uppercase">Draft</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">{post.title}</h2>
                  {post.subtitle && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{post.subtitle}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
