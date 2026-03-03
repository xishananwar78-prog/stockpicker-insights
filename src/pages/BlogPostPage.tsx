import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { useBlogPost, useDeleteBlogPost } from '@/hooks/useBlogPosts';
import { useAuthContext } from '@/components/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuthContext();
  const { data: post, isLoading } = useBlogPost(slug || '');
  const deleteMutation = useDeleteBlogPost();
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!post) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Post not found</p>
          <Button variant="outline" onClick={() => navigate('/blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(post.id, {
      onSuccess: () => {
        toast.success('Post deleted');
        navigate('/blog');
      },
      onError: () => toast.error('Failed to delete post'),
    });
  };

  return (
    <AdminLayout>
      <article className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/blog/${slug}/edit`}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDelete(true)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {post.thumbnail_url && (
          <div className="rounded-xl overflow-hidden">
            <img src={post.thumbnail_url} alt={post.title} className="w-full object-cover max-h-[400px]" />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {!post.is_published && (
              <span className="text-[10px] bg-warning-muted text-warning px-2 py-0.5 rounded font-medium uppercase">Draft</span>
            )}
            <span className="text-sm text-muted-foreground">
              {format(new Date(post.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{post.title}</h1>
          {post.subtitle && (
            <p className="text-lg text-muted-foreground">{post.subtitle}</p>
          )}
        </div>

        <div
          className="prose prose-invert max-w-none [&_img]:rounded-lg [&_img]:max-w-full [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-primary [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
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
