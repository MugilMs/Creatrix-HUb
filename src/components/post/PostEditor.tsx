import { useState } from 'react';
import { Image, Video, FileText, Globe, Lock } from 'lucide-react';
import { Button, Input, Card, CardContent } from '../ui';
import type { Post } from '../../types';

interface PostEditorProps {
  initialData?: Partial<Post>;
  onSubmit: (data: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel?: () => void;
  creatorId: string;
}

export const PostEditor = ({ initialData, onSubmit, onCancel, creatorId }: PostEditorProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || '');
  const [postType, setPostType] = useState<'text' | 'image' | 'video'>(initialData?.post_type || 'text');
  const [visibility, setVisibility] = useState<'public' | 'subscribers'>(initialData?.visibility || 'public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        creator_id: creatorId,
        title,
        content,
        excerpt: excerpt || content.slice(0, 200),
        cover_image: coverImage || undefined,
        post_type: postType,
        visibility,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const postTypes = [
    { value: 'text', label: 'Text', icon: FileText },
    { value: 'image', label: 'Image', icon: Image },
    { value: 'video', label: 'Video', icon: Video },
  ] as const;

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Type
            </label>
            <div className="flex space-x-2">
              {postTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPostType(value)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    postType === value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            required
          />

          {/* Cover Image URL */}
          <Input
            label="Cover Image URL (optional)"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here... (Markdown supported)"
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt (optional)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description shown in previews"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={() => setVisibility('public')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <Globe className="w-4 h-4 text-gray-500" />
                <span>Public</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="subscribers"
                  checked={visibility === 'subscribers'}
                  onChange={() => setVisibility('subscribers')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Subscribers Only</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" isLoading={isSubmitting}>
              {initialData?.id ? 'Update Post' : 'Publish Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
