export function toObject(json?: object, space?: number) {
  if (!json) return json;
  return JSON.parse(
    JSON.stringify(json, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

export function formatEthAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
