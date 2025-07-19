import { zeroAddress } from 'viem';
import { formatAddress as formatAddressUtil } from './address';

export function toObject(json?: object, space?: number) {
  if (!json) return json;
  return JSON.parse(
    JSON.stringify(json, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}
11
export function formatEthAddress(address?: string, size: number = 4): string {
  if (!address) address = zeroAddress;
  return formatAddressUtil(address, 2 + size, size);
}

export const formatBalance = (balance: number): string => {
  if (balance >= 1_000_000) {
    return (balance / 1_000_000).toFixed(2) + 'M';
  } else if (balance >= 1_000) {
    return (balance / 1_000).toFixed(2) + 'K';
  } else {
    return balance.toFixed(2);
  }
};