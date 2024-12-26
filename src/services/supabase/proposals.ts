import { DAO_ADDRESSES } from '@/utils/constants';
import { supabase } from '@/utils/database/supabase_server';
import { Proposal, ProposalInsert } from '@/utils/database/types';

export const fetchAllProposals = async (): Promise<Proposal[]> => {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('proposal.dao', DAO_ADDRESSES.token)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching proposals: ${error.message}`);
  }

  return data;
};

export const fetchProposalById = async (id: string): Promise<Proposal> => {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching proposal: ${error.message}`);
  }

  return data;
};

export const createProposal = async (
  proposal: ProposalInsert
): Promise<true> => {
  const { error } = await supabase.from('proposals').insert([proposal]);

  if (error) {
    throw new Error(`Error creating proposal: ${error.message}`);
  }

  return true;
};

export const validateProposalExists = async (id: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('proposals')
    .select('id')
    .eq('id', id)
    .single();

  return !!data;
};

export const updateProposal = async (proposal: Proposal): Promise<true> => {
  const { error } = await supabase
    .from('proposals')
    .update(proposal)
    .eq('id', proposal.id);

  if (error) {
    throw new Error(`Error updating proposal: ${error.message}`);
  }

  return true;
};

export const deleteProposal = async (id: string): Promise<true> => {
  const { error } = await supabase.from('proposals').delete().eq('id', id);

  if (error) {
    throw new Error(`Error deleting proposal: ${error.message}`);
  }

  return true;
};
