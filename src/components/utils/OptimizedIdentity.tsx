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
      const spinnerSize = size === 'xs' || size === 'sm' ? 'sm' : 'md';
      return <Spinner size={spinnerSize} />;
    }
    const safeDisplay =
      typeof displayName === 'string' && displayName.length > 0
        ? displayName
        : '';
    return (
      <ChakraAvatar.Root size={size}>
        <ChakraAvatar.Image src={avatar || fallbackSrc} alt={safeDisplay} />
        <ChakraAvatar.Fallback>
          {safeDisplay.slice(0, 2).toUpperCase() || '--'}
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

  const safeDisplay =
    typeof displayName === 'string' && displayName.length > 0
      ? displayName
      : '';
  if (!showFull && safeDisplay.length > maxLength) {
    return (
      <span title={safeDisplay}>{safeDisplay.slice(0, maxLength)}...</span>
    );
  }

  return <span>{safeDisplay || '--'}</span>;
});
