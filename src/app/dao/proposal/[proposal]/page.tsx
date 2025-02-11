import ProposalPageClient from '../ProposalPageClient';
import { fetchProposals } from '@/app/services/proposal';
import { fetchAllEditorsByProposalId } from '@/services/supabase/editors';
import { fetchAllPropDatesByProposalId } from '@/services/supabase/propdates';
import { DAO_ADDRESSES } from '@/utils/constants';

export const revalidate = 0;

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
