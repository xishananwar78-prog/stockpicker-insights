import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LearningCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  sort_order: number;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningArticle {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  thumbnail_url: string | null;
  content: string;
  category_id: string | null;
  is_published: boolean;
  published_at: string | null;
  author_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  created_at: string;
  updated_at: string;
}

export function useLearningCategories() {
  return useQuery({
    queryKey: ['learning-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_categories' as any)
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as LearningCategory[];
    },
  });
}

export function useLearningArticles(categorySlug?: string) {
  return useQuery({
    queryKey: ['learning-articles', categorySlug],
    queryFn: async () => {
      let query = supabase
        .from('learning_articles' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (categorySlug) {
        // First get category id from slug
        const { data: cat } = await supabase
          .from('learning_categories' as any)
          .select('id')
          .eq('slug', categorySlug)
          .single();
        if (cat) {
          query = query.eq('category_id', (cat as any).id);
        }
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as LearningArticle[];
    },
  });
}

export function useLearningArticle(slug: string) {
  return useQuery({
    queryKey: ['learning-article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_articles' as any)
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data as unknown as LearningArticle;
    },
    enabled: !!slug,
  });
}

export function useLearningArticlesByCategory() {
  return useQuery({
    queryKey: ['learning-articles-by-category'],
    queryFn: async () => {
      const [{ data: categories, error: catErr }, { data: articles, error: artErr }] = await Promise.all([
        supabase.from('learning_categories' as any).select('*').order('sort_order', { ascending: true }),
        supabase.from('learning_articles' as any).select('*').order('created_at', { ascending: false }),
      ]);
      if (catErr) throw catErr;
      if (artErr) throw artErr;

      const cats = (categories || []) as unknown as LearningCategory[];
      const arts = (articles || []) as unknown as LearningArticle[];

      return cats.map(cat => ({
        ...cat,
        articles: arts.filter(a => a.category_id === cat.id),
      }));
    },
  });
}

export function useAddLearningCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cat: { name: string; slug: string; description?: string; icon?: string; sort_order?: number; parent_id?: string }) => {
      const { data, error } = await supabase.from('learning_categories' as any).insert(cat as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['learning-categories'] });
      qc.invalidateQueries({ queryKey: ['learning-articles-by-category'] });
    },
  });
}

export function useUpdateLearningCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...cat }: { id: string } & Partial<{ name: string; slug: string; description: string; icon: string; sort_order: number; parent_id: string }>) => {
      const { data, error } = await supabase.from('learning_categories' as any).update(cat as any).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['learning-categories'] });
      qc.invalidateQueries({ queryKey: ['learning-articles-by-category'] });
    },
  });
}

export function useDeleteLearningCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('learning_categories' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['learning-categories'] });
      qc.invalidateQueries({ queryKey: ['learning-articles-by-category'] });
    },
  });
}

export function useAddLearningArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (article: {
      title: string;
      subtitle?: string;
      thumbnail_url?: string;
      content: string;
      slug: string;
      category_id?: string;
      is_published: boolean;
      published_at?: string;
      meta_title?: string;
      meta_description?: string;
      meta_keywords?: string;
    }) => {
      const { data, error } = await supabase.from('learning_articles' as any).insert(article as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['learning-articles'] });
      qc.invalidateQueries({ queryKey: ['learning-articles-by-category'] });
    },
  });
}

export function useUpdateLearningArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...article }: { id: string } & Partial<{
      title: string;
      subtitle: string;
      thumbnail_url: string;
      content: string;
      slug: string;
      category_id: string;
      is_published: boolean;
      published_at: string;
      meta_title: string;
      meta_description: string;
      meta_keywords: string;
    }>) => {
      const { data, error } = await supabase.from('learning_articles' as any).update(article as any).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['learning-articles'] });
      qc.invalidateQueries({ queryKey: ['learning-articles-by-category'] });
      qc.invalidateQueries({ queryKey: ['learning-article'] });
    },
  });
}

export function useDeleteLearningArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('learning_articles' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['learning-articles'] });
      qc.invalidateQueries({ queryKey: ['learning-articles-by-category'] });
    },
  });
}
