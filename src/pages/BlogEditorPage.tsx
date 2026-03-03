import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useBlogPost, useAddBlogPost, useUpdateBlogPost } from '@/hooks/useBlogPosts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 80);
}

export default function BlogEditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEdit = slug && slug !== 'new';
  const { data: existingPost, isLoading } = useBlogPost(isEdit ? slug : '');

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [postSlug, setPostSlug] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [uploading, setUploading] = useState(false);

  const addMutation = useAddBlogPost();
  const updateMutation = useUpdateBlogPost();

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setSubtitle(existingPost.subtitle || '');
      setPostSlug(existingPost.slug);
      setThumbnailUrl(existingPost.thumbnail_url || '');
      setContent(existingPost.content);
      setIsPublished(existingPost.is_published);
    }
  }, [existingPost]);

  useEffect(() => {
    if (!isEdit && title && !postSlug) {
      setPostSlug(generateSlug(title));
    }
  }, [title, isEdit]);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `thumbnails/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('blog-images').upload(path, file);
    if (error) {
      toast.error('Failed to upload thumbnail');
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(path);
    setThumbnailUrl(urlData.publicUrl);
    setUploading(false);
  };

  const handleSave = () => {
    if (!title.trim() || !postSlug.trim()) {
      toast.error('Title and slug are required');
      return;
    }

    const postData = {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      thumbnail_url: thumbnailUrl || undefined,
      content,
      slug: postSlug.trim(),
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : undefined,
    };

    if (isEdit && existingPost) {
      updateMutation.mutate(
        { id: existingPost.id, ...postData },
        {
          onSuccess: () => {
            toast.success('Post updated');
            navigate(`/blog/${postData.slug}`);
          },
          onError: () => toast.error('Failed to update'),
        }
      );
    } else {
      addMutation.mutate(postData, {
        onSuccess: () => {
          toast.success('Post created');
          navigate('/blog');
        },
        onError: () => toast.error('Failed to create post'),
      });
    }
  };

  if (isEdit && isLoading) {
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
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="flex gap-2">
            {isEdit && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/blog/${slug}`)}>
                <Eye className="h-4 w-4 mr-1" /> Preview
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={addMutation.isPending || updateMutation.isPending}
              className="bg-gradient-brand text-primary-foreground"
            >
              <Save className="h-4 w-4 mr-1" />
              {isEdit ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-xs">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="bg-input text-lg font-semibold"
            />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Subtitle</Label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Short description"
              className="bg-input"
            />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Slug</Label>
            <Input
              value={postSlug}
              onChange={(e) => setPostSlug(e.target.value)}
              placeholder="url-friendly-slug"
              className="bg-input font-mono text-sm"
            />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Thumbnail</Label>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                disabled={uploading}
                className="bg-input"
              />
              {thumbnailUrl && (
                <img src={thumbnailUrl} alt="Thumbnail" className="h-16 w-24 object-cover rounded-lg border border-border" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <Label className="text-sm">{isPublished ? 'Published' : 'Draft'}</Label>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs mb-2 block">Content</Label>
            <RichTextEditor content={content} onChange={setContent} placeholder="Write your blog post..." />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
