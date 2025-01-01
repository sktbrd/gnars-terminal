import { supabase } from '@/utils/database/supabase_server';
import { Like, LikeInsert } from '@/utils/database/types';
import { PostgrestError } from '@supabase/supabase-js';

export const fetchAllLikes = async (): Promise<Like[]> => {
  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching likes: ${error.message}`);
  }

  return data;
};

// Since 'likes' might have a composite key, adjust the fetch by ID accordingly
export const fetchLikeById = async (propdate: number, user: string) => {
  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .eq('propdate', propdate)
    .eq('user', user)
    .single();

  return { data, error };
};

export const createLike = async (like: LikeInsert): Promise<true> => {
  const { error } = await supabase.from('likes').insert([like]);

  if (error) {
    throw new Error(`Error creating like: ${error.message}`);
  }

  return true;
};

export const deleteLike = async (
  propdate: number,
  user: string
): Promise<true> => {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('propdate', propdate)
    .eq('user', user);

  if (error) {
    throw new Error(`Error deleting like: ${error.message}`);
  }

  return true;
};
