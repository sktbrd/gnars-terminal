'use client';

import { ColorModeButton } from '@/components/ui/color-mode';
import { Heading, HStack, IconButton, useMediaQuery } from '@chakra-ui/react';
import Link from 'next/link';
import { BsGithub } from 'react-icons/bs';
import ConnectButton from './connect-button';
import Sparks from './sparks';
import AccountMenu from './account-menu';

export default function Navbar() {
  const [isLargerThanMd] = useMediaQuery(['(min-width: 768px)'], {
    fallback: [true],
  });

  return (
    <HStack
      w={'full'}
      justify={'space-between'}
      px={{ base: 4, md: 2 }}
      py={2}
      colorPalette={'yellow'}
    >
      <Link href={'/'}>
        <Heading size={{ base: '2xl', md: '4xl' }} as='h1'>
          Gnars Terminal
        </Heading>
      </Link>
      {isLargerThanMd ? (
        <HStack>
          <Link href='https://github.com/r4topunk/gnars-terminal'>
            <IconButton variant={'ghost'} colorPalette={'black'} size={'sm'}>
              <BsGithub style={{ background: 'none' }} />
            </IconButton>
          </Link>
          <ColorModeButton variant={'ghost'} />
          <ConnectButton />
          <Sparks />
        </HStack>
      ) : (
        <AccountMenu />
      )}
    </HStack>
  );
}
