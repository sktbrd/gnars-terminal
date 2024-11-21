// app/api/graphql/route.ts
import { NextResponse } from 'next/server';
import { gql } from '@apollo/client';
import apolloClient from '@/utils/apollo';

// Query GraphQL com variáveis
const GET_DATA = gql`
  query Proposals(
    $where: Proposal_filter
    $orderBy: Proposal_orderBy
    $orderDirection: OrderDirection
    $first: Int
  ) {
    proposals(
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
      first: $first
    ) {
      proposalId
      proposalNumber
      title
      proposer
      timeCreated
      againstVotes
      forVotes
      abstainVotes
      voteStart
      voteEnd
      queued
      executed
      canceled
      vetoed
      voteCount
      description
    }
  }
`;

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

  const where = { dao: address.toLocaleLowerCase() };

  try {
    const { data } = await apolloClient.query({
      query: GET_DATA,
      variables: {
        where,
        orderBy,
        orderDirection,
        first,
      },
    });

    console.log(data);

    return NextResponse.json(data.proposals);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao consultar propostas' },
      { status: 500 }
    );
  }
}
