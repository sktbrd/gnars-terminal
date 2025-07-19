'use client';
import React, { useState, useMemo } from 'react';
import { Spinner, Center, Table, Button, HStack } from '@chakra-ui/react';
import { useMembers } from '@/hooks/members';
import { Member } from '@/services/members';
import { FormattedAddress } from '../utils/names';
import { zeroAddress } from 'viem';

const MembersCard: React.FC = () => {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const { data, loading, error } = useMembers(page, pageSize);

  // Data is now filtered in useMembers hook for correct pagination
  const filteredMembers = data || [];

  if (loading)
    return (
      <Center>
        <Spinner />
      </Center>
    );
  if (error) return <Center>Error loading members</Center>;

  return (
    <>
      <Table.Root size='sm'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Owner</Table.ColumnHeader>
            <Table.ColumnHeader>Token Count</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {filteredMembers.map((member: Member, index: number) => (
            <Table.Row key={`${member.owner}-${index}`}>
              <Table.Cell>
                <FormattedAddress address={member.owner} />
              </Table.Cell>
              <Table.Cell>{member.daoTokenCount}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Center>
        <HStack gap={2} mt={4}>
          <Button onClick={() => setPage(page - 1)} disabled={page === 0}>
            Previous
          </Button>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={filteredMembers.length < pageSize}
          >
            Next
          </Button>
        </HStack>
      </Center>
    </>
  );
};

export default MembersCard;
