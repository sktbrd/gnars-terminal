'use client';

import { memo } from 'react';
import { Address } from 'viem';
import { Avatar as ChakraAvatar, Spinner } from '@chakra-ui/react';
import { useENSData } from '@/hooks/useENSData';

interface OptimizedAvatarProps {
  address: Address | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallbackSrc?: string;
  showSpinner?: boolean;
}

/**
 * Optimized Avatar component that uses cached ENS data
 */
export const OptimizedAvatar = memo<OptimizedAvatarProps>(
  function OptimizedAvatar({
    address,
    size = 'md',
    fallbackSrc = '/images/frames/icon.png',
    showSpinner = true,
  }) {
    const { avatar, displayName, isLoading } = useENSData(address, {
      fallbackGenerator: (addr) =>
        `https://api.dicebear.com/5.x/identicon/svg?seed=${addr}`,
    });

    if (isLoading && showSpinner) {
      return <Spinner size={size === 'xs' ? 'sm' : 'md'} />;
    }

    return (
      <ChakraAvatar.Root size={size}>
        <ChakraAvatar.Image src={avatar || fallbackSrc} alt={displayName} />
        <ChakraAvatar.Fallback>
          {displayName.slice(0, 2).toUpperCase()}
        </ChakraAvatar.Fallback>
      </ChakraAvatar.Root>
    );
  }
);

interface OptimizedNameProps {
  address: Address | string;
  showFull?: boolean;
  maxLength?: number;
}

/**
 * Optimized Name component that uses cached ENS data
 */
export const OptimizedName = memo<OptimizedNameProps>(function OptimizedName({
  address,
  showFull = false,
  maxLength = 20,
}) {
  const { displayName } = useENSData(address);

  if (showFull && displayName.length > maxLength) {
    return (
      <span title={displayName}>{displayName.slice(0, maxLength)}...</span>
    );
  }

  return <span>{displayName}</span>;
});
