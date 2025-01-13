'use client';

import { ColorModeButton } from '@/components/ui/color-mode';
import {
  HStack,
  IconButton,
  Image,
  Link,
  Stack,
  useMediaQuery,
  useDisclosure,
} from '@chakra-ui/react';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { BsGithub } from 'react-icons/bs';
import { FaEthereum, FaNewspaper, FaVoteYea } from 'react-icons/fa';
import { IoDocumentText } from 'react-icons/io5';
import AccountMenu from './account-menu';
import Sparks from './sparks';
import {
  DrawerRoot,
  DrawerTrigger,
  DrawerContent,
  DrawerCloseTrigger,
  DrawerHeader,
  DrawerBody,
  DrawerBackdrop,
} from '@/components/ui/drawer';

export default function Navbar() {
  const [isLargerThanMd] = useMediaQuery(['(min-width: 768px)'], {
    fallback: [false],
    ssr: true,
  });
  const { open, onOpen, onClose } = useDisclosure();

  return (
    <HStack
      w={'full'}
      justify={'space-between'}
      px={4}
      py={2}
      colorPalette={'yellow'}
      position='relative'
    >
      <Stack
        direction='row'
        align='center'
        gap={3}
        fontSize={'md'}
        fontWeight={'medium'}
      >
        <Image asChild boxSize={6} mr={2} onClick={onOpen}>
          <NextImage
            src='https://gnars.com/images/logo.png'
            alt='gnars-terminal'
            width={80}
            height={80}
            objectFit='contain'
          />
        </Image>
        {!isLargerThanMd && (
          <p onClick={onOpen}>Menu</p>
        )}
        {isLargerThanMd && <NavbarLinks />}
      </Stack>
      {isLargerThanMd ? (
        <HStack>
          <NextLink href='https://github.com/r4topunk/gnars-terminal'>
            <IconButton variant={'ghost'} colorPalette={'black'} size={'sm'}>
              <BsGithub style={{ background: 'none' }} />
            </IconButton>
          </NextLink>
          <ColorModeButton variant={'ghost'} />
          <AccountMenu />
          <Sparks />
        </HStack>
      ) : (
        <AccountMenu />
      )}
      <DrawerRoot open={open} onOpenChange={onClose}>
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerCloseTrigger />
          <DrawerHeader>Navigation</DrawerHeader>
          <DrawerBody>
            <NavbarLinks />
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </HStack>
  );
}

function NavbarLinks() {
  return (
    <>
      <Link
        data-state='open'
        _open={{
          animation: 'fade-in 300ms ease-out',
        }}
        _hidden={{
          animation: 'fade-out 300ms ease-in',
        }}
        asChild
        gap={'0.5'}
      >
        <NextLink href='/' style={{ width: '100%' }}>
          HOME
        </NextLink>
      </Link>
      <Link
        data-state='open'
        _open={{
          animation: 'fade-in 600ms ease-out',
        }}
        _hidden={{
          animation: 'fade-out 600ms ease-in',
        }}
        asChild
        gap={'0.5'}
      >
        <NextLink href='/dao' style={{ width: '100%' }}>
          <FaVoteYea />
          DAO
        </NextLink>
      </Link>
      <Link
        data-state='open'
        _open={{
          animation: 'fade-in 900ms ease-out',
        }}
        _hidden={{
          animation: 'fade-out 900ms ease-in',
        }}
        asChild
        gap={'0.5'}
      >
        <NextLink href='/propdates' style={{ width: '100%' }}>
          <FaNewspaper />
          PROPDATES
        </NextLink>
      </Link>
      <Link
        data-state='open'
        _open={{
          animation: 'fade-in 1200ms ease-out',
        }}
        _hidden={{
          animation: 'fade-out 1200ms ease-in',
        }}
        asChild
        gap={'0.5'}
      >
        <NextLink href='/treasure' style={{ width: '100%' }}>
          <FaEthereum />
          TREASURE
        </NextLink>
      </Link>
      <Link
        data-state='open'
        _open={{
          animation: 'fade-in 1500ms ease-out',
        }}
        _hidden={{
          animation: 'fade-out 1500ms ease-in',
        }}
        gap={'0.5'}
        asChild
      >
        <NextLink
          target='_blank'
          href='https://gnars.center'
          style={{ width: '100%' }}
        >
          <IoDocumentText />
          ABOUT
        </NextLink>
      </Link>
    </>
  );
}
