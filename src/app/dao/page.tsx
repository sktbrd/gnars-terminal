import GovernorCard from '@/components/cards/governor';
import { ColorModeButton } from '@/components/ui/color-mode';
import {
  Box,
  Container,
  Heading,
  HStack,
  IconButton,
  VStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { BsGithub } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';

function DaoPage() {
  return (
    <Box
      minH={'100vh'}
      bg={'bg.panel'}
      colorPalette={'yellow'}
      color={{ base: 'black', _dark: 'white' }}
      padding={4}
    >
      <Container maxW={'2xl'}>
        <VStack gap={4} align={'start'}>
          <HStack w={'full'} justify={'space-between'}>
            <HStack>
              <Link href='/'>
                <IconButton
                  variant={'ghost'}
                  colorPalette={'black'}
                  size={'sm'}
                >
                  <FaArrowLeft style={{ background: 'none' }} />
                </IconButton>
              </Link>
              <Heading size={'4xl'} as='h1'>
                DAO
              </Heading>
            </HStack>
            <HStack>
              <Link href='https://github.com/r4topunk/gnars-terminal'>
                <IconButton
                  variant={'outline'}
                  colorPalette={'black'}
                  size={'sm'}
                >
                  <BsGithub style={{ background: 'none' }} />
                </IconButton>
              </Link>
              <ColorModeButton variant={'outline'} />
            </HStack>
          </HStack>
          <GovernorCard isDaoPage={true} />
        </VStack>
      </Container>
    </Box>
  );
}

export default DaoPage;
