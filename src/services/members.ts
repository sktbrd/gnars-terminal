import { gql } from '@apollo/client';
import { noCacheApolloClient } from '@/utils/apollo';

export async function fetchMembers(page: number, pageSize: number) {
  const { data } = await noCacheApolloClient.query({
    query: GET_MEMBERS,
    variables: {
      where: {
        dao_: {
          id: "0x880fb3cf5c6cc2d7dfc13a993e839a9411200c17",
        },
      },
      orderBy: "daoTokenCount",
      orderDirection: "desc",
      first: pageSize,
      skip: page * pageSize,
    },
  });
  console.log('fetchMembers data:', data);
  return data.daotokenOwners;
}

export interface MemberToken {
  id: string;
}

export interface Member {
  owner: string;
  daoTokenCount: number;
  daoTokens: MemberToken[];
}

export interface GetMembersData {
  daotokenOwners: Member[];
}

export const GET_MEMBERS = gql`
  query GetMembers($first: Int, $skip: Int) {
    daotokenOwners(
      where: { dao_: { id: "0x880fb3cf5c6cc2d7dfc13a993e839a9411200c17" } }
      orderBy: daoTokenCount
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      owner
      daoTokenCount
      daoTokens {
        id
      }
    }
  }
`;
