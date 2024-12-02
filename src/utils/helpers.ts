import { zeroAddress } from 'viem';

export function toObject(json?: object, space?: number) {
  if (!json) return json;
  return JSON.parse(
    JSON.stringify(json, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

export function formatEthAddress(address?: string, size: number = 4): string {
  if (!address) address = zeroAddress;
  return `${address.slice(0, 2 + size)}...${address.slice(-size)}`;
}
