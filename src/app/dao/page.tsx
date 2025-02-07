import GovernorCard from '@/components/cards/governor';
import MembersCard from '@/components/cards/members';
import { Container, Heading, VStack, Tabs } from '@chakra-ui/react';
export const revalidate = 0;

function DaoPage() {
  return (
    <Container maxW="container.lg" px={{ base: '0', md: '20%' }} py={{ base: 4, md: 8 }}>
      <VStack gap={4} align="center" w="full">
        <Heading size="4xl" as="h1">
          DAO
        </Heading>
        <Tabs.Root defaultValue="proposals" w="full">
          <Tabs.List w="full" justifyContent="center">
            <Tabs.Trigger value="proposals">Proposals</Tabs.Trigger>
            <Tabs.Trigger value="placeholder">Members</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="proposals" w="full">
            <GovernorCard />
          </Tabs.Content>
          <Tabs.Content value="placeholder" w="full">
            <MembersCard />
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Container>
  );
}

export default DaoPage;
