import { supabase } from '@/utils/database/supabase_server';
import { PropDate } from '@/utils/database/types';
import { Address } from 'viem';

export const fetchAllPropDates = async (): Promise<PropDate[]> => {
  const { data, error } = await supabase
    .from('propdates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching propdates: ${error.message}`);
  }

  return data;
};

export const fetchPropDateById = async (id: Address): Promise<PropDate> => {
  const { data, error } = await supabase
    .from('propdates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching propdate: ${error.message}`);
  }

  return data;
};

export const createPropDate = async (propDate: PropDate): Promise<true> => {
  const { error } = await supabase.from('propdates').insert([propDate]);

  if (error) {
    throw new Error(`Error creating propdate: ${error.message}`);
  }

  return true;
};

export const updatePropDate = async (propDate: PropDate): Promise<true> => {
  const { error } = await supabase
    .from('propdates')
    .update(propDate)
    .eq('id', propDate.id);

  if (error) {
    throw new Error(`Error updating propdate: ${error.message}`);
  }

  return true;
};

export const deletePropDate = async (id: Address): Promise<true> => {
  const { error } = await supabase.from('propdates').delete().eq('id', id);

  if (error) {
    throw new Error(`Error deleting propdate: ${error.message}`);
  }

  return true;
};
