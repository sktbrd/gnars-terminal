import { DAO_ADDRESSES } from '@/utils/constants';
import React from 'react';
import { fetchProposals } from '../services/proposal';

async function DaoPage() {
  const proposals = await fetchProposals(
    DAO_ADDRESSES.token,
    'proposalNumber',
    'asc',
    10
  );
  return <div>{JSON.stringify(proposals, null, 2)}</div>;
}

export default DaoPage;
