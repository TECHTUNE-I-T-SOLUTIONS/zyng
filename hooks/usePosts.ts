import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/lib/services/postService';
import { Post } from '@/types';

export function usePosts(campus?: string) {
  return useQuery<Post[]>({
    queryKey: ['posts', campus],
    queryFn: () => postService.getPosts(campus),
  });
}

export function usePost(id: string) {
  return useQuery<Post>({
    queryKey: ['post', id],
    queryFn: () => postService.getPostById(id),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postService.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
