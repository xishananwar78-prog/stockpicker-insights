import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3, 
  Link as LinkIcon, ImageIcon, Undo, Redo, Code, Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({ 
  onClick, isActive, icon: Icon, title 
}: { 
  onClick: () => void; isActive?: boolean; icon: typeof Bold; title: string; 
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      title={title}
      className={cn('h-8 w-8', isActive && 'bg-accent text-accent-foreground')}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder || 'Start writing...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]);

  const addImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;
      
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('blog-images').upload(path, file);
      if (error) return;
      
      const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(path);
      editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
    };
    input.click();
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-input">
      <div className="flex flex-wrap gap-0.5 p-1.5 border-b border-border bg-muted/50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} title="Bold" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} title="Italic" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} title="Heading 2" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} icon={Heading3} title="Heading 3" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} title="Bullet List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} title="Ordered List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} title="Quote" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} icon={Code} title="Code Block" />
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={Minus} title="Divider" />
        <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} icon={LinkIcon} title="Link" />
        <ToolbarButton onClick={addImage} icon={ImageIcon} title="Image" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="Undo" />
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="Redo" />
      </div>
      <EditorContent editor={editor} className="prose prose-invert max-w-none p-4 min-h-[300px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-primary [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline" />
    </div>
  );
}
