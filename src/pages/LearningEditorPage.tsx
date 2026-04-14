import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLearningArticle, useAddLearningArticle, useUpdateLearningArticle, useLearningCategories } from '@/hooks/useLearning';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 80);
}

export default function LearningEditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEdit = slug && slug !== 'new';
  const { data: existingArticle, isLoading } = useLearningArticle(isEdit ? slug : '');
  const { data: categories = [] } = useLearningCategories();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [postSlug, setPostSlug] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [uploading, setUploading] = useState(false);

  const addMutation = useAddLearningArticle();
  const updateMutation = useUpdateLearningArticle();

  useEffect(() => {
    if (existingArticle) {
      setTitle(existingArticle.title);
      setSubtitle(existingArticle.subtitle || '');
      setPostSlug(existingArticle.slug);
      setThumbnailUrl(existingArticle.thumbnail_url || '');
      setContent(existingArticle.content);
      setCategoryId(existingArticle.category_id || '');
      setIsPublished(existingArticle.is_published);
      setMetaTitle(existingArticle.meta_title || '');
      setMetaDescription(existingArticle.meta_description || '');
      setMetaKeywords(existingArticle.meta_keywords || '');
    }
  }, [existingArticle]);

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
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }

    const articleData = {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      thumbnail_url: thumbnailUrl || undefined,
      content,
      slug: postSlug.trim(),
      category_id: categoryId,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : undefined,
      meta_title: metaTitle.trim() || undefined,
      meta_description: metaDescription.trim() || undefined,
      meta_keywords: metaKeywords.trim() || undefined,
    };

    if (isEdit && existingArticle) {
      updateMutation.mutate(
        { id: existingArticle.id, ...articleData },
        {
          onSuccess: () => {
            toast.success('Article updated');
            navigate(`/learning/${articleData.slug}`);
          },
          onError: () => toast.error('Failed to update'),
        }
      );
    } else {
      addMutation.mutate(articleData, {
        onSuccess: () => {
          toast.success('Article created');
          navigate('/learning');
        },
        onError: () => toast.error('Failed to create article'),
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
          <Button variant="ghost" onClick={() => navigate('/learning')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="flex gap-2">
            {isEdit && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/learning/${slug}`)}>
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
              placeholder="Article title"
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
            <Label className="text-muted-foreground text-xs">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="bg-input">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* SEO Fields */}
          <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">SEO Settings</p>
            <div>
              <Label className="text-muted-foreground text-xs">Meta Title (max 60 chars)</Label>
              <Input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="SEO title (defaults to article title)"
                className="bg-input"
                maxLength={60}
              />
              <span className="text-[10px] text-muted-foreground">{metaTitle.length}/60</span>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Meta Description (max 160 chars)</Label>
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO description"
                className="bg-input resize-none"
                maxLength={160}
                rows={2}
              />
              <span className="text-[10px] text-muted-foreground">{metaDescription.length}/160</span>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Keywords (comma separated)</Label>
              <Input
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="trading, stocks, intraday"
                className="bg-input"
              />
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs mb-2 block">Content</Label>
            <RichTextEditor content={content} onChange={setContent} placeholder="Write your article..." />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
