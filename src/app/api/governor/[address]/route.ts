import { NextResponse } from 'next/server';
import { fetchProposals } from '@/app/services/proposal';

export async function GET(
  req: Request,
  { params }: { params: { address: string } }
) {
  const address = params.address;
  if (!address) {
    return NextResponse.json(
      { error: 'Address not provided' },
      { status: 400 }
    );
  }

  const url = new URL(req.url);
  const orderBy = url.searchParams.get('orderBy') || 'proposalNumber';
  const orderDirection = url.searchParams.get('orderDirection') || 'asc';
  const first = parseInt(url.searchParams.get('first') || '10', 1000);

  try {
    const proposals = await fetchProposals(
      address,
      orderBy,
      orderDirection,
      first
    );
    return NextResponse.json(proposals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
