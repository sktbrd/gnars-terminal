import { Address } from "viem";

export const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID as string;

export const DAO_ADDRESSES = {
  nft: process.env.NEXT_PUBLIC_NFT as Address,
  metadata: process.env.NEXT_PUBLIC_METADATA as Address,
  auction: process.env.NEXT_PUBLIC_AUCTION as Address,
  treasury: process.env.NEXT_PUBLIC_TREASURY as Address,
  governor: process.env.NEXT_PUBLIC_GOVERNOR as Address,
};
