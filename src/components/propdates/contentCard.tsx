import { PropDateInterface } from '@/utils/database/interfaces';
import { Box, Card, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import { Address } from 'viem';
import EnsAvatar from '../ethereum/ens';
import Markdown from '../proposal/markdown';
import { FormattedAddress } from '../utils/ethereum';
import PropdatesLike from './like';

interface PropdatesContentCardProps {
  propdates: PropDateInterface[];
}

export default function PropdatesContentCardList({
  propdates,
}: PropdatesContentCardProps) {
  return (
    <Stack gap={2} w='full'>
      {propdates.map((propdate) => (
        <PropdatesContentCardContent key={propdate.id} propdate={propdate} />
      ))}
    </Stack>
  );
}

export function PropdatesContentCardContent({
  propdate,
}: {
  propdate: PropDateInterface;
}) {
  return (
    <Card.Root size='md' borderRadius='lg' variant='outline' w={'full'}>
      <Card.Body p={4}>
        <VStack gap={3} align='stretch'>
          <HStack gap={4}>
            <EnsAvatar address={propdate.author.e_address as Address} />
            <HStack justify={'space-between'} w='full'>
              <HStack>
                <FormattedAddress address={propdate.author.e_address} />
                <Text color='gray.500' fontSize={'sm'}>
                  {new Date(propdate.created_at).toLocaleDateString()}
                </Text>
              </HStack>
              <PropdatesLike propdate={propdate} />
            </HStack>
          </HStack>
          <Box
            bg='gray.100'
            _dark={{ bg: 'bg.emphasized' }}
            p={3}
            borderRadius='md'
            overflow='hidden'
          >
            <Markdown text={propdate.text} />
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
