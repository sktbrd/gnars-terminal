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
            url: string;
            originalUri?: string;
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
                
                // The new API structure has apps array and tokens nested under treasury address
                let tokensArray: Token[] = [];
                if (data.tokens && data.tokens[treasuryAddress] && Array.isArray(data.tokens[treasuryAddress])) {
                    tokensArray = data.tokens[treasuryAddress];
                }
                
                // Extract apps data which contains additional DeFi positions
                let appsArray = [];
                if (data.apps && Array.isArray(data.apps)) {
                    appsArray = data.apps;
                }
                
                // There's no separate NFTs in this response structure, they seem to be included in apps
                let nftsArray: NFT[] = [];
                
                // Calculate total balance from tokens
                const tokensBalance = tokensArray.reduce((sum, token) => {
                    return sum + (token?.token?.balanceUSD || 0);
                }, 0);
                
                // Calculate total balance from apps (DeFi positions)
                const appsBalance = appsArray.reduce((sum: number, app: any) => {
                    return sum + (app?.balanceUSD || 0);
                }, 0);
                
                const calculatedTotalBalance = tokensBalance + appsBalance;
                
                // Get net worth from the new API structure (includes NFTs)
                const nftNetWorth = data.nftNetWorth?.[treasuryAddress] || 0;
                const totalNetWorth = calculatedTotalBalance + nftNetWorth;
                
                setTokens(tokensArray);
                setTotalBalance(calculatedTotalBalance);
                setTotalNetWorth(totalNetWorth);
                setNfts(nftsArray);

                // Calculate specific balances with safety checks
                const usdc = tokensArray.find((token: Token) => 
                    token && token.token && token.token.name === 'USD Coin'
                );
                const eth = tokensArray.find((token: Token) => 
                    token && token.token && token.token.name === 'Ethereum'
                );
                const sendit = tokensArray.find((token: Token) => 
                    token && token.token && token.token.name === 'Sendit'
                );
                const gnars = nftsArray.filter((nft: NFT) => 
                    nft && nft.token && nft.token.collection && nft.token.collection.name === 'Gnars'
                );

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
