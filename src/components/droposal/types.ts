export interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  properties?: {
    number: number;
    name: string;
  };
  attributes?: Array<{ trait_type: string; value: string }>;
}

export interface AggregatedHolder {
  address: string;
  tokenCount: number;
  tokenIds: bigint[];
}

export interface SalesConfig {
  publicSalePrice: number;
  maxSalePurchasePerAddress: number;
  publicSaleStart: number;
  publicSaleEnd: number;
  presaleStart: number;
  presaleEnd: number;
  presaleMerkleRoot: string;
}

export interface EthVolumeInfo {
  netVolume: string | null;
  totalSupply: bigint | null;
  pricePerMint: number | null;
}

export interface PriceInfo {
  pricePerTokenInWei: bigint;
  mintPrice: bigint;
  zoraProtocolFee: bigint;
  totalValue: bigint;
  totalInEth: number;
}
