/**
 * Zora NFT Contract ABI
 * Used for interacting with Zora NFT contracts for minting and other operations
 */

export const zoraNftAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_zoraERC721TransferHelper",
                "type": "address"
            },
            {
                "internalType": "contract IFactoryUpgradeGate",
                "name": "_factoryUpgradeGate",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_marketFilterDAOAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_mintFeeAmount",
                "type": "uint256"
            },
            {
                "internalType": "address payable",
                "name": "_mintFeeRecipient",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_protocolRewards",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            }
        ],
        "name": "purchase",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "comment",
                "type": "string"
            }
        ],
        "name": "purchaseWithComment",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "saleDetails",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "bool",
                        "name": "publicSaleActive",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "presaleActive",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "publicSalePrice",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint64",
                        "name": "publicSaleStart",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "publicSaleEnd",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "presaleStart",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "presaleEnd",
                        "type": "uint64"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "presaleMerkleRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxSalePurchasePerAddress",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalMinted",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxSupply",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct IERC721Drop.SaleDetails",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "salesConfig",
        "outputs": [
            {
                "internalType": "uint104",
                "name": "publicSalePrice",
                "type": "uint104"
            },
            {
                "internalType": "uint32",
                "name": "maxSalePurchasePerAddress",
                "type": "uint32"
            },
            {
                "internalType": "uint64",
                "name": "publicSaleStart",
                "type": "uint64"
            },
            {
                "internalType": "uint64",
                "name": "publicSaleEnd",
                "type": "uint64"
            },
            {
                "internalType": "uint64",
                "name": "presaleStart",
                "type": "uint64"
            },
            {
                "internalType": "uint64",
                "name": "presaleEnd",
                "type": "uint64"
            },
            {
                "internalType": "bytes32",
                "name": "presaleMerkleRoot",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "minter",
                "type": "address"
            }
        ],
        "name": "mintedPerAddress",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "totalMints",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "presaleMints",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "publicMints",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct IERC721Drop.AddressMintDetails",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            }
        ],
        "name": "zoraFeeForAmount",
        "outputs": [
            {
                "internalType": "address payable",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "fee",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "correctPrice",
                "type": "uint256"
            }
        ],
        "name": "Purchase_WrongPrice",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "Sale_Inactive",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "Presale_Inactive",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "Mint_SoldOut",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "MintZeroQuantity",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "MintToZeroAddress",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "INVALID_ETH_AMOUNT",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "Some_MissingError", // Replace with the actual error name if identified
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "tokenContract",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "comment",
                "type": "string"
            }
        ],
        "name": "MintComment",
        "type": "event"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
] as const;

// Extract only the essential functions needed for minting
export const zoraMintAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            }
        ],
        "name": "purchase",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            }
        ],
        "name": "purchase",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "comment",
                "type": "string"
            }
        ],
        "name": "purchaseWithComment",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "saleDetails",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "bool",
                        "name": "publicSaleActive",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "presaleActive",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "publicSalePrice",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint64",
                        "name": "publicSaleStart",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "publicSaleEnd",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "presaleStart",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "presaleEnd",
                        "type": "uint64"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "presaleMerkleRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxSalePurchasePerAddress",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalMinted",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "maxSupply",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct IERC721Drop.SaleDetails",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "salesConfig",
        "outputs": [
            {
                "internalType": "uint104",
                "name": "publicSalePrice",
                "type": "uint104"
            },
            {
                "internalType": "uint32",
                "name": "maxSalePurchasePerAddress",
                "type": "uint32"
            },
            {
                "internalType": "uint64",
                "name": "publicSaleStart",
                "type": "uint64"
            },
            {
                "internalType": "uint64",
                "name": "publicSaleEnd",
                "type": "uint64"
            },
            {
                "internalType": "uint64",
                "name": "presaleStart",
                "type": "uint64"
            },
            {
                "internalType": "uint64",
                "name": "presaleEnd",
                "type": "uint64"
            },
            {
                "internalType": "bytes32",
                "name": "presaleMerkleRoot",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
    "inputs": [
        {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
        }
    ],
    "name": "ownerOf",
    "outputs": [
        {
            "internalType": "address",
            "name": "",
            "type": "address"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "minter",
                "type": "address"
            }
        ],
        "name": "mintedPerAddress",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "totalMints",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "presaleMints",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "publicMints",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct IERC721Drop.AddressMintDetails",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            }
        ],
        "name": "zoraFeeForAmount",
        "outputs": [
            {
                "internalType": "address payable",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "fee",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "tokenURI",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export default zoraMintAbi;
