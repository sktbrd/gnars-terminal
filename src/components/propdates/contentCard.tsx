import { Avatar } from '@/components/ui/avatar';
import { CompletePropDate } from '@/utils/database/types';
import { Box, Card, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import Markdown from '../proposal/markdown';
import { FormattedAddress } from '../utils/ethereum';

interface PropdatesContentCardProps {
  propdates: CompletePropDate[];
}

export default function PropdatesContentCard({
  propdates,
}: PropdatesContentCardProps) {
  return (
    <Stack gap={2} px={2} w='full'>
      {propdates.map((propdate) => (
        <Card.Root key={propdate.id} size='md' borderRadius='lg' variant='outline'>
          <Card.Body>
            <VStack gap={3} align='stretch'>
              <HStack gap={4}>
                <Avatar
                  size='md'
                  name={propdate.author || ''}
                  src={`https://api.dicebear.com/5.x/identicon/svg?seed=${propdate.author}`}
                />
                <HStack wrap={{ base: 'wrap', md: 'nowrap' }} gap={1}>
                  <FormattedAddress address={propdate.author} />
                    <Text color='gray.500'>
                      (@{propdate.author.f_username})
                    </Text>
                  <Text color='gray.500'>
                    {new Date(propdate.created_at).toLocaleDateString()}
                  </Text>
                </HStack>
              </HStack>
              <Box
                bg='gray.100'
                _dark={{ bg: 'bg.emphasized' }}
                p={3}
                borderRadius='md'
              >
                {/* <Text>{propdate.text}</Text> */}
                <Markdown text={propdate.text} />
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>
      ))}
    </Stack>
  );
}