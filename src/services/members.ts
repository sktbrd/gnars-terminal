import { gql } from '@apollo/client';
import { noCacheApolloClient } from '@/utils/apollo';
import { DAO_ADDRESSES } from '@/utils/constants';

export async function fetchMembers(page: number, pageSize: number) {
  const { data } = await noCacheApolloClient.query({
    query: GET_MEMBERS,
    variables: {
      daoId: DAO_ADDRESSES.token || "0x880fb3cf5c6cc2d7dfc13a993e839a9411200c17",
      first: pageSize,
      skip: page * pageSize,
    },
  });
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
  query GetMembers($daoId: String!, $first: Int, $skip: Int) {
    daotokenOwners(
      where: { dao_: { id: $daoId } }
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
