import type { Metadata } from 'next';
import { postService } from '@/lib/services/postService';
import PostPageClient from './PostPageClient';

type Props = { params: Promise<{ id: string }> };

const plainText = (value?: string | null) => (value || '').replace(/\s+/g, ' ').trim();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const post = await postService.getPostById(id);
    if (!post) {
      return {
        title: 'Zyng Post Not Found',
        description: 'This Zyng post may have expired or been removed.',
      };
    }

    const author = post.persona?.name || 'Anonymous Zynger';
    const description = plainText(post.content).slice(0, 160) || 'View this Zyng post and join the campus conversation.';
    const image = Array.isArray(post.media_urls) && post.media_urls.length ? post.media_urls[0] : post.media_url || '/logo.png';

    return {
      title: `${author} on Zyng`,
      description,
      openGraph: {
        title: `${author} on Zyng`,
        description,
        images: [{ url: image }],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${author} on Zyng`,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: 'Zyng Post',
      description: 'View this Zyng post and join the campus conversation.',
    };
  }
}

export default function PostPage() {
  return <PostPageClient />;
}
