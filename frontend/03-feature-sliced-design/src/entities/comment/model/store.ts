import { create } from 'zustand';
import { Comment } from '../../../shared/types';

interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  setComments: (comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  removeComment: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  isLoading: false,
  error: null,
  setComments: (comments) => set({ comments }),
  addComment: (comment) => set((state) => ({ comments: [...state.comments, comment] })),
  removeComment: (id) =>
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
