import { defineConfig, loadEnv } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { Address } from "viem";
import AUCTION_ABI from "@/utils/abis/auction";

export default defineConfig(() => {
  const env = loadEnv({
    mode: process.env.NODE_ENV,
    envDir: process.cwd(),
  });
  const DAO_ADDRESSES = {
    nft: env.NEXT_PUBLIC_NFT as Address,
    metadata: env.NEXT_PUBLIC_METADATA as Address,
    auction: env.NEXT_PUBLIC_AUCTION as Address,
    treasury: env.NEXT_PUBLIC_TREASURY as Address,
    governor: env.NEXT_PUBLIC_GOVERNOR as Address,
  };

  console.log(DAO_ADDRESSES.auction);

  return {
    out: "src/hooks/wagmiGenerated.ts",
    contracts: [
      {
        name: "Auction",
        abi: AUCTION_ABI,
        address: DAO_ADDRESSES.auction,
      },
    ],
    plugins: [react()],
  };
});
