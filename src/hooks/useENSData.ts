import { Address } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import { useEnsName, useEnsAvatar } from 'wagmi';
import { useMemo } from 'react';

export interface ENSData {
  name: string | null;
  avatar: string | null;
  displayName: string;
  isLoading: boolean;
}

/**
 * Optimized hook for ENS resolution with performance optimizations
 * @param address - The address to resolve
 * @param options - Configuration options
 */
export function useENSData(
  address?: Address | string,
  options: {
    enabled?: boolean;
    fallbackGenerator?: (address: string) => string;
  } = {}
): ENSData {
  const {
    enabled = true,
    fallbackGenerator = (addr) => `https://api.dicebear.com/5.x/identicon/svg?seed=${addr}`,
  } = options;


  const normalizedAddress = useMemo(() => {
    if (!address || !enabled) {
      return undefined;
    }
    return address as Address;
  }, [address, enabled]);

  const { data: ensName, isLoading: nameLoading } = useEnsName({
    address: normalizedAddress,
    chainId: mainnet.id,
  });

  const normalizedName = useMemo(() => {
    return ensName ? normalize(ensName) : undefined;
  }, [ensName]);

  const { data: ensAvatar, isLoading: avatarLoading } = useEnsAvatar({
    name: normalizedName,
    chainId: mainnet.id,
  });

  const displayName = useMemo(() => {
    if (ensName) {
      return ensName;
    } else if (!address) {
      return '';
    } else {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
  }, [ensName, address]);

  const avatarSrc = useMemo(() => {
    if (ensAvatar) {
      return ensAvatar;
    } else if (!address) {
      return null;
    } else {
      return fallbackGenerator(address as string);
    }
  }, [ensAvatar, address, fallbackGenerator]);

  // ...existing code...

  return {
    name: ensName || null,
    avatar: avatarSrc,
    displayName,
    isLoading: nameLoading || avatarLoading,
  };
}
