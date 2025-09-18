import ProposalPageClient from '../ProposalPageClient';
import { fetchProposals } from '@/app/services/proposal';
import { fetchAllEditorsByProposalId } from '@/services/supabase/editors';
import { fetchAllPropDatesByProposalId } from '@/services/supabase/propdates';
import { DAO_ADDRESSES } from '@/utils/constants';
import { Metadata } from 'next';

export const revalidate = 0;

const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

// Generate metadata for a specific proposal ID
export async function generateMetadata({
  params,
}: {
  params: { proposal: string };
}): Promise<Metadata> {
  const proposalId = params.proposal;

  const frame = {
    version: 'next',
    imageUrl: `${appUrl}/dao/proposal/${proposalId}/opengraph-image`,
    button: {
      title: 'Read Proposal',
      action: {
        type: 'launch_frame',
        name: 'Gnars DAO Proposal',
        url: `${appUrl}/dao/proposal/${proposalId}/`,
      },
    },
  };

  return {
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  };
}

export default async function ProposalPage({
  params,
}: {
  params: { proposal: string };
}) {
  const proposalNumber = parseInt(params.proposal, 10);

  if (isNaN(proposalNumber)) {
    return <div>Invalid proposal ID</div>;
  }

  // Fetch proposal data
  const proposals = await fetchProposals(
    DAO_ADDRESSES.token,
    'proposalNumber',
    'asc',
    1,
    { proposalNumber },
    true
  );
  const proposal = proposals[0];

  if (!proposal) {
    return <div>Proposal not found</div>;
  }

  // Fetch the latest proposal for navigation
  const latestProposals = await fetchProposals(
    DAO_ADDRESSES.token,
    'proposalNumber',
    'desc',
    1
  );
  const latestProposalNumber =
    latestProposals[0]?.proposalNumber || proposalNumber;
  const { data, error } = await fetchAllPropDatesByProposalId(
    proposal.proposalId
  );
  const editors = await fetchAllEditorsByProposalId(proposal.proposalId);
  return (
    <ProposalPageClient
      proposal={proposal}
      proposalNumber={proposalNumber}
      latestProposalNumber={latestProposalNumber}
      propdates={data}
      editors={editors}
    />
  );
}
