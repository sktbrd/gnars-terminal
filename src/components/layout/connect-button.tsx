'use client';

import { Button } from '@/components/ui/button';
import { formatEthAddress } from '@/utils/helpers';
import { Text } from '@chakra-ui/react';
import { base, mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from 'wagmi';
import { Avatar } from '../ui/avatar';
import { FormattedAddress, useNNSName } from '../utils/ethereum';

function ConnectButton() {
  const { isConnected, address, isConnecting } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  const { data: nnsName } = useNNSName(address);
  const { data: ensName } = useEnsName({
    address: address,
    chainId: mainnet.id,
  });

  const { data: ensAvatar, isLoading: isLoadingAvatar } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: mainnet.id,
  });

  if (isConnecting) {
    return (
      <Button size={'xs'} variant={'surface'} disabled>
        Connecting...
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button
        size={'xs'}
        variant={'surface'}
        onClick={() =>
          connect({
            connector: connectors[0],
            chainId: base.id,
          })
        }
      >
        Connect
      </Button>
    );
  }

  if (isLoadingAvatar || !ensAvatar) {
    return (
      <Button size={'xs'} variant={'ghost'}>
        <Text>{nnsName || ensName || formatEthAddress(address)}</Text>
      </Button>
    );
  }

  return (
    <Button gap={2} size={'xs'} variant={'ghost'} onClick={() => disconnect()}>
      <Avatar variant={'subtle'} size='xs' w={5} h={5} src={ensAvatar} />
      <Text>{nnsName || ensName || formatEthAddress(address)}</Text>
    </Button>
  );
}

export default ConnectButton;
