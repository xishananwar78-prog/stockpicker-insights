import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string | null;
  thumbnail_url: string | null;
  content: string;
  slug: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string | null;
}

export function useBlogPosts(includeUnpublished = false) {
  return useQuery({
    queryKey: ['blog-posts', includeUnpublished],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as BlogPost[];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data as unknown as BlogPost;
    },
    enabled: !!slug,
  });
}

export function useAddBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: {
      title: string;
      subtitle?: string;
      thumbnail_url?: string;
      content: string;
      slug: string;
      is_published: boolean;
      published_at?: string;
    }) => {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .insert(post as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blog-posts'] }),
  });
}

export function useUpdateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...post }: { id: string } & Partial<{
      title: string;
      subtitle: string;
      thumbnail_url: string;
      content: string;
      slug: string;
      is_published: boolean;
      published_at: string;
    }>) => {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .update(post as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-posts'] });
      qc.invalidateQueries({ queryKey: ['blog-post'] });
    },
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blog-posts'] }),
  });
}
