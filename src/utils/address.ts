import { Address } from 'viem';

/**
 * Formats an Ethereum address to a shortened version
 * @param address - The address to format
 * @param prefixLength - Number of characters to show at the start (default: 6)
 * @param suffixLength - Number of characters to show at the end (default: 4)
 * @returns Formatted address string
 */
export function formatAddress(
  address: string,
  prefixLength: number = 6,
  suffixLength: number = 4
): string {
  if (!address || !isValidAddress(address)) return '';

  // Handle case where address is shorter than requested lengths
  const totalLength = prefixLength + suffixLength;
  if (address.length <= totalLength) return address;

  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Checks if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Normalizes an address to lowercase with 0x prefix
 */
export function normalizeAddress(address: string): Address {
  return address.toLowerCase() as Address;
}
