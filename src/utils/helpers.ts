import { zeroAddress } from 'viem';

export function toObject(json?: object, space?: number) {
  if (!json) return json;
  return JSON.parse(
    JSON.stringify(json, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

export function formatEthAddress(address?: string): string {
  if (!address) address = zeroAddress;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
