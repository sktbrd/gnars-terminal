import { Button } from '@/components/ui/button';
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger
} from '@/components/ui/menu';
import { Name } from "@paperclip-labs/whisk-sdk/identity";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LuHand, LuLogOut, LuSparkle } from 'react-icons/lu';
import { Address } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import {
  useAccount,
  useDisconnect,
  useEnsAvatar,
  useEnsName
} from 'wagmi';
import CastDelegation from '../proposal/castDelegation';
import { Avatar } from '../ui/avatar';
import { useColorMode } from '../ui/color-mode';
import ConnectButton from './connect-button';

export default function AccountMenu() {
  const { isConnected, address, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [isDelegationOpen, setIsDelegationOpen] = useState(false);


  const { data: ensName } = useEnsName({
    address: address,
    chainId: mainnet.id,
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: mainnet.id,
  });

  if (!isConnected) {
    return <ConnectButton />;
  }

  return (
    <>
      <MenuRoot positioning={{ placement: 'bottom-end' }}>
        <MenuTrigger asChild>
          <Button size={'xs'} variant={'subtle'}>
            {ensAvatar ? (
              <Avatar variant={'subtle'} size='xs' w={5} h={5} src={ensAvatar} />
            ) : null}
            <Name address={address as Address} />
          </Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem
            value='wallet'
            gap={1}
            onClick={() => router.push(`/${address}`)}
          >
            <LuSparkle width={2} height={2} style={{ marginRight: '4px' }} />{' '}
            My Wallet
          </MenuItem>
          <MenuItem
            value='delegate'
            gap={1}
            onClick={() => setIsDelegationOpen(true)}
          >
            <LuHand width={2} height={2} style={{ marginRight: '4px' }} />{' '}
            Delegate
          </MenuItem>
          <MenuItem
            value='disconnect'
            color='fg.error'
            _hover={{ bg: 'bg.error', color: 'fg.error' }}
            onClick={() => disconnect()}
          >
            <LuLogOut width={2} height={2} />
            Disconnect
          </MenuItem>
        </MenuContent>
      </MenuRoot>
      {isDelegationOpen && (
        <CastDelegation onOpen={isDelegationOpen} setOpen={setIsDelegationOpen} />
      )}
    </>
  );
}
