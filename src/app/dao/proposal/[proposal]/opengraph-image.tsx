import { ImageResponse } from 'next/og';
import { fetchProposals } from '@/app/services/proposal';
import { DAO_ADDRESSES } from '@/utils/constants';

export const alt = 'Gnars DAO Proposal';

// Aspect ratio 3:2
export const size = {
  width: 973,
  height: 649,
};

export const contentType = 'image/png';
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Image({
  params,
}: {
  params: { proposal: string };
}) {
  const proposalNumber = parseInt(params.proposal, 10);

  if (isNaN(proposalNumber)) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
          }}
        >
          <h1 style={{ fontSize: '48px', color: '#f59e0b' }}>
            Invalid Proposal ID
          </h1>
        </div>
      ),
      { ...size }
    );
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
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
          }}
        >
          <h1 style={{ fontSize: '48px', color: '#f59e0b' }}>
            Proposal Not Found
          </h1>
        </div>
      ),
      { ...size }
    );
  }

  // Format vote end date
  const voteEndDate = new Date(
    parseInt(proposal.voteEnd) * 1000
  ).toLocaleString();

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '32px',
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{ fontSize: '24px', margin: 0 }}>
              Proposal {proposalNumber}
            </h2>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: getStatusColor(proposal.status).bgColor,
              color: getStatusColor(proposal.status).textColor,
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {proposal.status}
          </div>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '48px',
            marginTop: '8px',
            marginBottom: '24px',
            color: '#000000',
          }}
        >
          {proposal.title || 'No Title Available'}
        </h1>

        {/* Vote Counters */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              flex: 1,
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3 style={{ fontSize: '20px', margin: 0 }}>For</h3>
            <p
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#22c55e',
                margin: 0,
              }}
            >
              {proposal.forVotes}
            </p>
          </div>

          <div
            style={{
              flex: 1,
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3 style={{ fontSize: '20px', margin: 0 }}>Against</h3>
            <p
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#ef4444',
                margin: 0,
              }}
            >
              {proposal.againstVotes}
            </p>
          </div>

          <div
            style={{
              flex: 1,
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3 style={{ fontSize: '20px', margin: 0 }}>Abstain</h3>
            <p
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#6b7280',
                margin: 0,
              }}
            >
              {proposal.abstainVotes}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              flex: 1,
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3 style={{ fontSize: '20px', margin: 0 }}>Threshold</h3>
            <p
              style={{
                fontSize: '18px',
                color: '#6b7280',
                fontWeight: 500,
                margin: 0,
              }}
            >
              {proposal.quorumVotes} votes
            </p>
          </div>

          <div
            style={{
              flex: 1,
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3 style={{ fontSize: '20px', margin: 0 }}>Ending</h3>
            <p
              style={{
                fontSize: '18px',
                color: '#6b7280',
                fontWeight: 500,
                margin: 0,
              }}
            >
              {voteEndDate}
            </p>
          </div>

          <div
            style={{
              flex: 1,
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3 style={{ fontSize: '20px', margin: 0 }}>Snapshot</h3>
            <p
              style={{
                fontSize: '18px',
                color: '#6b7280',
                fontWeight: 500,
                margin: 0,
              }}
            >
              #{proposal.snapshotBlockNumber}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '16px',
          }}
        >
          <div style={{ fontSize: '16px', display: 'flex' }}>
            Proposer: {shortenAddress(proposal.proposer)}
          </div>
          <div
            style={{ fontSize: '16px', fontWeight: 'bold', color: '#f59e0b', display: 'flex' }}
          >
            Gnars DAO
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

// Helper function to get status color
function getStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE':
      return { bgColor: '#dbeafe', textColor: '#1d4ed8' };
    case 'SUCCEEDED':
      return { bgColor: '#dcfce7', textColor: '#16a34a' };
    case 'EXECUTED':
      return { bgColor: '#f0fdf4', textColor: '#15803d' };
    case 'DEFEATED':
      return { bgColor: '#fee2e2', textColor: '#b91c1c' };
    case 'QUEUED':
      return { bgColor: '#fef3c7', textColor: '#b45309' };
    case 'PENDING':
      return { bgColor: '#f3f4f6', textColor: '#4b5563' };
    case 'CANCELED':
      return { bgColor: '#f3f4f6', textColor: '#4b5563' };
    default:
      return { bgColor: '#f3f4f6', textColor: '#4b5563' };
  }
}

// Helper function to shorten address
function shortenAddress(address: string) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
