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
import NextLink from 'next/link';
import { BsGithub } from 'react-icons/bs';
import { FaEthereum, FaHome, FaNewspaper, FaVoteYea } from 'react-icons/fa';
import { IoDocumentText } from 'react-icons/io5';
import { AiFillSkin } from 'react-icons/ai';
import AccountMenu from './account-menu';
import Sparks from './sparks';
import NotificationButton from './NotificationButton';
import {
  DrawerRoot,
  DrawerContent,
  DrawerCloseTrigger,
  DrawerHeader,
  DrawerBody,
  DrawerBackdrop,
} from '@/components/ui/drawer';
import { NAVBAR_LOGO } from '@/utils/constants';

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
        <Image
          src={NAVBAR_LOGO}
          alt='gnars-terminal'
          boxSize={6}
          mr={2}
          onClick={onOpen}
          objectFit='contain'
          cursor='pointer'
        />
        {!isLargerThanMd && <p onClick={onOpen}>Menu</p>}
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
        <HStack gap={1}>
          <NotificationButton />
          <AccountMenu />
        </HStack>
      )}
      <DrawerRoot open={open} onOpenChange={onClose}>
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerCloseTrigger />
          <DrawerHeader></DrawerHeader>
          <DrawerBody>
            <Stack gap={4}>
              <NavbarLinks />
            </Stack>
            <Image
              src='/images/gnarspunk.png'
              alt='Gnarspunk'
              position='absolute'
              bottom={2}
              left='50%'
              transform='translateX(-50%)'
              width='40%'
              height='auto'
            />
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </HStack>
  );
}

function NavbarLinks() {
  const linkProps = {
    dataState: 'open',
    _open: { animation: 'fade-in 300ms ease-out' },
    _hidden: { animation: 'fade-out 300ms ease-in' },
    asChild: true,
    gap: '0.5',
  };

  return (
    <>
      <Link {...linkProps}>
        <NextLink href='/' style={{ width: '100%' }}>
          <FaHome />
          HOME
        </NextLink>
      </Link>
      <Link
        {...linkProps}
        _open={{ animation: 'fade-in 1200ms ease-out' }}
        _hidden={{ animation: 'fade-out 1200ms ease-in' }}
      >
        <NextLink href='/droposals' style={{ width: '100%' }}>
          <FaEthereum />
          DROPS
        </NextLink>
      </Link>
      <Link
        {...linkProps}
        _open={{ animation: 'fade-in 600ms ease-out' }}
        _hidden={{ animation: 'fade-out 600ms ease-in' }}
      >
        <NextLink href='/dao' style={{ width: '100%' }}>
          <FaVoteYea />
          DAO
        </NextLink>
      </Link>
      <Link
        {...linkProps}
        _open={{ animation: 'fade-in 900ms ease-out' }}
        _hidden={{ animation: 'fade-out 900ms ease-in' }}
      >
        <NextLink href='/propdates' style={{ width: '100%' }}>
          <FaNewspaper />
          REPORTS
        </NextLink>
      </Link>

      <Link
        {...linkProps}
        _open={{ animation: 'fade-in 1500ms ease-out' }}
        _hidden={{ animation: 'fade-out 1500ms ease-in' }}
      >
        <NextLink href='/treasure' style={{ width: '100%' }}>
          <FaEthereum />
          TREASURE
        </NextLink>
      </Link>
      <Link
        {...linkProps}
        _open={{ animation: 'fade-in 1800ms ease-out' }}
        _hidden={{ animation: 'fade-out 1800ms ease-in' }}
      >
        <NextLink
          target='_blank'
          href='https://flows.wtf/gnars'
          style={{ width: '100%' }}
        >
          <AiFillSkin />
          FLOWS
        </NextLink>
      </Link>
      <Link
        {...linkProps}
        _open={{ animation: 'fade-in 1800ms ease-out' }}
        _hidden={{ animation: 'fade-out 1800ms ease-in' }}
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
