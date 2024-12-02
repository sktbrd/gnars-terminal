import { ColorModeButton } from '@/components/ui/color-mode';
import { Heading, HStack, IconButton, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { BsGithub } from 'react-icons/bs';
import React from 'react';
import { Avatar } from '../ui/avatar';
import ConnectButton from './connect-button';

export default function Navbar() {
  return (
    <HStack w={'full'} justify={'space-between'} p={2} colorPalette={'yellow'}>
      <Heading size={{ base: '2xl', md: '4xl' }} as='h1'>
        Gnars Terminal
      </Heading>
      <HStack>
        <Link href='https://github.com/r4topunk/gnars-terminal'>
          <IconButton variant={'ghost'} colorPalette={'black'} size={'sm'}>
            <BsGithub style={{ background: 'none' }} />
          </IconButton>
        </Link>
        <ColorModeButton variant={'ghost'} />
        <ConnectButton />
      </HStack>
    </HStack>
  );
}
