import { Address, isAddress, isAddressEqual as isAddressEqualViem } from 'viem';

export function isAddressEqualTo(a?: string | null, b?: string | null) {
  if (!a || !b || !isAddress(a) || !isAddress(b)) return false;
  return isAddressEqualViem(a as Address, b as Address);
}
