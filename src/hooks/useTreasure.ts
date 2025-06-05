import { useState, useEffect } from "react";

export interface Token {
    token: {
        address: string;
        network: string;
        label: string;
        name: string;
        symbol: string;
        decimals: string;
        verified: boolean;
        price: string;
        balance: number;
        balanceUSD: number;
        balanceRaw: string;
    };
}

export interface NFT {
    balance: string;
    token: {
        collection: {
            address: string;
            floorPriceEth: string;
            logoImageUrl: string;
            name: string;
            network: string;
            nftStandard: string;
            openseaId: string;
            type: string;
        };
        estimatedValueEth: string;
        lastSaleEth: string | null;
        medias: {
            type: string;
            originalUrl: string;
            fileSize: string;
            mimeType: string;
            blurhash: string;
            height: number;
            width: number;
        }[];
        rarityRank: string | null;
        tokenId: string;
    };
}

const useTreasure = (treasuryAddress: string) => {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [totalNetWorth, setTotalNetWorth] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [usdcBalance, setUsdcBalance] = useState(0);
    const [ethBalance, setEthBalance] = useState(0);
    const [senditBalance, setSenditBalance] = useState(0);
    const [gnarsNftBalance, setGnarsNftBalance] = useState(0);

    useEffect(() => {
        const fetchTreasure = async () => {
            try {
                const apiUrl = `https://pioneers.dev/api/v1/portfolio/${treasuryAddress}`;

                const res = await fetch(apiUrl);
                if (!res.ok) {
                    throw new Error(`Error: ${res.status} ${res.statusText}`);
                }
                const data = await res.json();
                setTokens(data.tokens);
                setTotalBalance(data.totalBalanceUsdTokens);
                setTotalNetWorth(data.totalNetWorth);
                setNfts(data.nfts);

                // Calculate specific balances
                const usdc = data.tokens.find((token: Token) => token.token.name === 'USD Coin');
                const eth = data.tokens.find((token: Token) => token.token.name === 'Ethereum');
                const sendit = data.tokens.find((token: Token) => token.token.name === 'Sendit');
                const gnars = data.nfts.filter((nft: NFT) => nft.token.collection.name === 'Gnars');

                setUsdcBalance(usdc ? usdc.token.balance : 0);
                setEthBalance(eth ? eth.token.balance : 0);
                setSenditBalance(sendit ? sendit.token.balance : 0);
                setGnarsNftBalance(gnars.length);
            } catch (err) {
                console.error("Error fetching treasure data:", err);
                setError("Error loading treasure data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTreasure();
    }, [treasuryAddress]);

    return { tokens, totalBalance, totalNetWorth, isLoading, error, nfts, usdcBalance, ethBalance, senditBalance, gnarsNftBalance };
};

export default useTreasure;
