import GovernorCard from '@/components/cards/governor';
import { ColorModeButton } from '@/components/ui/color-mode';
import { Heading, HStack, IconButton, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { BsGithub } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';

function DaoPage() {
  return (
    <VStack gap={4} align={'start'}>
      <HStack w={'full'} justify={'space-between'}>
        <HStack>
          <Link href='/'>
            <IconButton variant={'ghost'} colorPalette={'black'} size={'sm'}>
              <FaArrowLeft style={{ background: 'none' }} />
            </IconButton>
          </Link>
          <Heading size={'4xl'} as='h1'>
            DAO
          </Heading>
        </HStack>
        <HStack>
          <Link href='https://github.com/r4topunk/gnars-terminal'>
            <IconButton variant={'outline'} colorPalette={'black'} size={'sm'}>
              <BsGithub style={{ background: 'none' }} />
            </IconButton>
          </Link>
          <ColorModeButton variant={'outline'} />
        </HStack>
      </HStack>
      <GovernorCard isDaoPage={true} />
    </VStack>
  );
}

export default DaoPage;
