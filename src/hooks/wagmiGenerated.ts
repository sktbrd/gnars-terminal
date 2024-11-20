import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Auction
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const auctionAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_manager', internalType: 'address', type: 'address' },
      { name: '_rewardsManager', internalType: 'address', type: 'address' },
      { name: '_weth', internalType: 'address', type: 'address' },
      { name: '_builderRewardsBPS', internalType: 'uint16', type: 'uint16' },
      { name: '_referralRewardsBPS', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'payable',
  },
  { type: 'error', inputs: [], name: 'ADDRESS_ZERO' },
  { type: 'error', inputs: [], name: 'ALREADY_INITIALIZED' },
  { type: 'error', inputs: [], name: 'AUCTION_ACTIVE' },
  { type: 'error', inputs: [], name: 'AUCTION_CREATE_FAILED_TO_LAUNCH' },
  { type: 'error', inputs: [], name: 'AUCTION_NOT_STARTED' },
  { type: 'error', inputs: [], name: 'AUCTION_OVER' },
  { type: 'error', inputs: [], name: 'AUCTION_SETTLED' },
  { type: 'error', inputs: [], name: 'CANNOT_CREATE_AUCTION' },
  { type: 'error', inputs: [], name: 'DELEGATE_CALL_FAILED' },
  { type: 'error', inputs: [], name: 'FAILING_WETH_TRANSFER' },
  { type: 'error', inputs: [], name: 'INITIALIZING' },
  { type: 'error', inputs: [], name: 'INSOLVENT' },
  { type: 'error', inputs: [], name: 'INVALID_REWARDS_BPS' },
  { type: 'error', inputs: [], name: 'INVALID_REWARDS_RECIPIENT' },
  { type: 'error', inputs: [], name: 'INVALID_REWARD_TOTAL' },
  { type: 'error', inputs: [], name: 'INVALID_TARGET' },
  { type: 'error', inputs: [], name: 'INVALID_TOKEN_ID' },
  {
    type: 'error',
    inputs: [{ name: 'impl', internalType: 'address', type: 'address' }],
    name: 'INVALID_UPGRADE',
  },
  { type: 'error', inputs: [], name: 'MINIMUM_BID_NOT_MET' },
  { type: 'error', inputs: [], name: 'MIN_BID_INCREMENT_1_PERCENT' },
  { type: 'error', inputs: [], name: 'NOT_INITIALIZING' },
  { type: 'error', inputs: [], name: 'ONLY_CALL' },
  { type: 'error', inputs: [], name: 'ONLY_DELEGATECALL' },
  { type: 'error', inputs: [], name: 'ONLY_MANAGER' },
  { type: 'error', inputs: [], name: 'ONLY_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PENDING_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PROXY' },
  { type: 'error', inputs: [], name: 'ONLY_UUPS' },
  { type: 'error', inputs: [], name: 'PAUSED' },
  { type: 'error', inputs: [], name: 'REENTRANCY' },
  { type: 'error', inputs: [], name: 'RESERVE_PRICE_NOT_MET' },
  { type: 'error', inputs: [], name: 'UNPAUSED' },
  { type: 'error', inputs: [], name: 'UNSAFE_CAST' },
  { type: 'error', inputs: [], name: 'UNSUPPORTED_UUID' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bidder',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'extended', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'endTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AuctionBid',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'startTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'endTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AuctionCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'winner',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AuctionSettled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'duration',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DurationUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reward',
        internalType: 'struct AuctionTypesV2.FounderReward',
        type: 'tuple',
        components: [
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'percentBps', internalType: 'uint16', type: 'uint16' },
        ],
        indexed: false,
      },
    ],
    name: 'FounderRewardUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'minBidIncrementPercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MinBidIncrementPercentageUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'canceledOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnerCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pendingOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnerPending',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'prevOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'user',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reservePrice',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ReservePriceUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'timeBuffer',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TimeBufferUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'user',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'impl',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REWARDS_REASON',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'auction',
    outputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'highestBid', internalType: 'uint256', type: 'uint256' },
      { name: 'highestBidder', internalType: 'address', type: 'address' },
      { name: 'startTime', internalType: 'uint40', type: 'uint40' },
      { name: 'endTime', internalType: 'uint40', type: 'uint40' },
      { name: 'settled', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'builderRewardsBPS',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cancelOwnershipTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractVersion',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'createBid',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_referral', internalType: 'address', type: 'address' },
    ],
    name: 'createBidWithReferral',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'currentBidReferral',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'duration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'founderReward',
    outputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'percentBps', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_founder', internalType: 'address', type: 'address' },
      { name: '_treasury', internalType: 'address', type: 'address' },
      { name: '_duration', internalType: 'uint256', type: 'uint256' },
      { name: '_reservePrice', internalType: 'uint256', type: 'uint256' },
      {
        name: '_founderRewardRecipient',
        internalType: 'address',
        type: 'address',
      },
      { name: '_founderRewardBps', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minBidIncrement',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'referralRewardsBPS',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'reservePrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'safeTransferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_duration', internalType: 'uint256', type: 'uint256' }],
    name: 'setDuration',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'reward',
        internalType: 'struct AuctionTypesV2.FounderReward',
        type: 'tuple',
        components: [
          { name: 'recipient', internalType: 'address', type: 'address' },
          { name: 'percentBps', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    name: 'setFounderReward',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_percentage', internalType: 'uint256', type: 'uint256' }],
    name: 'setMinimumBidIncrement',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_reservePrice', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setReservePrice',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_timeBuffer', internalType: 'uint256', type: 'uint256' }],
    name: 'setTimeBuffer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'settleAuction',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'settleCurrentAndCreateNewAuction',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'timeBuffer',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'contract Token', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newImpl', internalType: 'address', type: 'address' }],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newImpl', internalType: 'address', type: 'address' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

export const auctionAddress =
  '0x1EF59B5276466b99D2F6600FFeAf3CCEFea001AB' as const

export const auctionConfig = {
  address: auctionAddress,
  abi: auctionAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Token
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const tokenAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_manager', internalType: 'address', type: 'address' }],
    stateMutability: 'payable',
  },
  { type: 'error', inputs: [], name: 'ADDRESS_ZERO' },
  { type: 'error', inputs: [], name: 'ALREADY_INITIALIZED' },
  { type: 'error', inputs: [], name: 'ALREADY_MINTED' },
  { type: 'error', inputs: [], name: 'CANNOT_CHANGE_RESERVE' },
  { type: 'error', inputs: [], name: 'CANNOT_DECREASE_RESERVE' },
  { type: 'error', inputs: [], name: 'DELEGATE_CALL_FAILED' },
  { type: 'error', inputs: [], name: 'EXPIRED_SIGNATURE' },
  { type: 'error', inputs: [], name: 'INITIALIZING' },
  { type: 'error', inputs: [], name: 'INVALID_APPROVAL' },
  { type: 'error', inputs: [], name: 'INVALID_FOUNDER_OWNERSHIP' },
  { type: 'error', inputs: [], name: 'INVALID_OWNER' },
  { type: 'error', inputs: [], name: 'INVALID_RECIPIENT' },
  { type: 'error', inputs: [], name: 'INVALID_SIGNATURE' },
  { type: 'error', inputs: [], name: 'INVALID_TARGET' },
  { type: 'error', inputs: [], name: 'INVALID_TIMESTAMP' },
  {
    type: 'error',
    inputs: [{ name: 'impl', internalType: 'address', type: 'address' }],
    name: 'INVALID_UPGRADE',
  },
  { type: 'error', inputs: [], name: 'NOT_INITIALIZING' },
  { type: 'error', inputs: [], name: 'NOT_MINTED' },
  { type: 'error', inputs: [], name: 'NO_METADATA_GENERATED' },
  { type: 'error', inputs: [], name: 'ONLY_AUCTION' },
  { type: 'error', inputs: [], name: 'ONLY_AUCTION_OR_MINTER' },
  { type: 'error', inputs: [], name: 'ONLY_CALL' },
  { type: 'error', inputs: [], name: 'ONLY_DELEGATECALL' },
  { type: 'error', inputs: [], name: 'ONLY_MANAGER' },
  { type: 'error', inputs: [], name: 'ONLY_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PENDING_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_PROXY' },
  { type: 'error', inputs: [], name: 'ONLY_TOKEN_OWNER' },
  { type: 'error', inputs: [], name: 'ONLY_UUPS' },
  { type: 'error', inputs: [], name: 'REENTRANCY' },
  { type: 'error', inputs: [], name: 'TOKEN_NOT_RESERVED' },
  { type: 'error', inputs: [], name: 'UNSUPPORTED_UUID' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'delegator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'DelegateChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'delegate',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'prevTotalVotes',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newTotalVotes',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DelegateVotesChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newFounders',
        internalType: 'struct IManager.FounderParams[]',
        type: 'tuple[]',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint256', type: 'uint256' },
          { name: 'vestExpiry', internalType: 'uint256', type: 'uint256' },
        ],
        indexed: false,
      },
    ],
    name: 'FounderAllocationsCleared',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'renderer',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'MetadataRendererUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'baseTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'founderId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'founder',
        internalType: 'struct TokenTypesV1.Founder',
        type: 'tuple',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint8', type: 'uint8' },
          { name: 'vestExpiry', internalType: 'uint32', type: 'uint32' },
        ],
        indexed: false,
      },
    ],
    name: 'MintScheduled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'baseTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'founderId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'founder',
        internalType: 'struct TokenTypesV1.Founder',
        type: 'tuple',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint8', type: 'uint8' },
          { name: 'vestExpiry', internalType: 'uint32', type: 'uint32' },
        ],
        indexed: false,
      },
    ],
    name: 'MintUnscheduled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'minter',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: 'allowed', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'MinterUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'canceledOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnerCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pendingOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnerPending',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'prevOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'reservedUntilTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ReservedUntilTokenIDUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'impl',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'auction',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cancelOwnershipTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractVersion',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: '_to', internalType: 'address', type: 'address' }],
    name: 'delegate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_from', internalType: 'address', type: 'address' },
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_deadline', internalType: 'uint256', type: 'uint256' },
      { name: '_v', internalType: 'uint8', type: 'uint8' },
      { name: '_r', internalType: 'bytes32', type: 'bytes32' },
      { name: '_s', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'delegateBySig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'delegates',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_founderId', internalType: 'uint256', type: 'uint256' }],
    name: 'getFounder',
    outputs: [
      {
        name: '',
        internalType: 'struct TokenTypesV1.Founder',
        type: 'tuple',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint8', type: 'uint8' },
          { name: 'vestExpiry', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getFounders',
    outputs: [
      {
        name: '',
        internalType: 'struct TokenTypesV1.Founder[]',
        type: 'tuple[]',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint8', type: 'uint8' },
          { name: 'vestExpiry', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_account', internalType: 'address', type: 'address' },
      { name: '_timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getPastVotes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getScheduledRecipient',
    outputs: [
      {
        name: '',
        internalType: 'struct TokenTypesV1.Founder',
        type: 'tuple',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint8', type: 'uint8' },
          { name: 'vestExpiry', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'getVotes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_founders',
        internalType: 'struct IManager.FounderParams[]',
        type: 'tuple[]',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint256', type: 'uint256' },
          { name: 'vestExpiry', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: '_initStrings', internalType: 'bytes', type: 'bytes' },
      {
        name: '_reservedUntilTokenId',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: '_metadataRenderer', internalType: 'address', type: 'address' },
      { name: '_auction', internalType: 'address', type: 'address' },
      { name: '_initialOwner', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_minter', internalType: 'address', type: 'address' }],
    name: 'isMinter',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'metadataRenderer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'mint',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'mintBatchTo',
    outputs: [
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mintFromReserveTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'recipient', internalType: 'address', type: 'address' }],
    name: 'mintTo',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'minter',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_account', internalType: 'address', type: 'address' }],
    name: 'nonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'onFirstAuctionStarted',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'remainingTokensInReserve',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'reservedUntilTokenId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_from', internalType: 'address', type: 'address' },
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_from', internalType: 'address', type: 'address' },
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'safeTransferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_operator', internalType: 'address', type: 'address' },
      { name: '_approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newRenderer',
        internalType: 'contract IBaseMetadata',
        type: 'address',
      },
    ],
    name: 'setMetadataRenderer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newReservedUntilTokenId',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'setReservedUntilTokenId',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalFounderOwnership',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalFounders',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_from', internalType: 'address', type: 'address' },
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newFounders',
        internalType: 'struct IManager.FounderParams[]',
        type: 'tuple[]',
        components: [
          { name: 'wallet', internalType: 'address', type: 'address' },
          { name: 'ownershipPct', internalType: 'uint256', type: 'uint256' },
          { name: 'vestExpiry', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'updateFounders',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_minters',
        internalType: 'struct TokenTypesV2.MinterParams[]',
        type: 'tuple[]',
        components: [
          { name: 'minter', internalType: 'address', type: 'address' },
          { name: 'allowed', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    name: 'updateMinters',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newImpl', internalType: 'address', type: 'address' }],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newImpl', internalType: 'address', type: 'address' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

export const tokenAddress =
  '0x6940100C44D214cD1570b394A1C42949C3eB820d' as const

export const tokenConfig = { address: tokenAddress, abi: tokenAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__
 */
export const useReadAuction = /*#__PURE__*/ createUseReadContract({
  abi: auctionAbi,
  address: auctionAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"REWARDS_REASON"`
 */
export const useReadAuctionRewardsReason = /*#__PURE__*/ createUseReadContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'REWARDS_REASON',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"auction"`
 */
export const useReadAuctionAuction = /*#__PURE__*/ createUseReadContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'auction',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"builderRewardsBPS"`
 */
export const useReadAuctionBuilderRewardsBps =
  /*#__PURE__*/ createUseReadContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'builderRewardsBPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"contractVersion"`
 */
export const useReadAuctionContractVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'contractVersion',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"currentBidReferral"`
 */
export const useReadAuctionCurrentBidReferral =
  /*#__PURE__*/ createUseReadContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'currentBidReferral',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"duration"`
 */
export const useReadAuctionDuration = /*#__PURE__*/ createUseReadContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'duration',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"founderReward"`
 */
export const useReadAuctionFounderReward = /*#__PURE__*/ createUseReadContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'founderReward',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"minBidIncrement"`
 */
export const useReadAuctionMinBidIncrement =
  /*#__PURE__*/ createUseReadContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'minBidIncrement',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"owner"`
 */
export const useReadAuctionOwner = /*#__PURE__*/ createUseReadContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"paused"`
 */
export const useReadAuctionPaused = /*#__PURE__*/ createUseReadContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const useReadAuctionPendingOwner = /*#__PURE__*/ createUseReadContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'pendingOwner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadAuctionProxiableUuid = /*#__PURE__*/ createUseReadContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"referralRewardsBPS"`
 */
export const useReadAuctionReferralRewardsBps =
  /*#__PURE__*/ createUseReadContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'referralRewardsBPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"reservePrice"`
 */
export const useReadAuctionReservePrice = /*#__PURE__*/ createUseReadContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'reservePrice',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"timeBuffer"`
 */
export const useReadAuctionTimeBuffer = /*#__PURE__*/ createUseReadContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'timeBuffer',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"token"`
 */
export const useReadAuctionToken = /*#__PURE__*/ createUseReadContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'token',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadAuctionTreasury = /*#__PURE__*/ createUseReadContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'treasury',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__
 */
export const useWriteAuction = /*#__PURE__*/ createUseWriteContract({
  abi: auctionAbi,
  address: auctionAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useWriteAuctionAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const useWriteAuctionCancelOwnershipTransfer =
  /*#__PURE__*/ createUseWriteContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'cancelOwnershipTransfer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"createBid"`
 */
export const useWriteAuctionCreateBid = /*#__PURE__*/ createUseWriteContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'createBid',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"createBidWithReferral"`
 */
export const useWriteAuctionCreateBidWithReferral =
  /*#__PURE__*/ createUseWriteContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'createBidWithReferral',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteAuctionInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteAuctionPause = /*#__PURE__*/ createUseWriteContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'pause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const useWriteAuctionSafeTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'safeTransferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setDuration"`
 */
export const useWriteAuctionSetDuration = /*#__PURE__*/ createUseWriteContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'setDuration',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setFounderReward"`
 */
export const useWriteAuctionSetFounderReward =
  /*#__PURE__*/ createUseWriteContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'setFounderReward',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setMinimumBidIncrement"`
 */
export const useWriteAuctionSetMinimumBidIncrement =
  /*#__PURE__*/ createUseWriteContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'setMinimumBidIncrement',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setReservePrice"`
 */
export const useWriteAuctionSetReservePrice =
  /*#__PURE__*/ createUseWriteContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'setReservePrice',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setTimeBuffer"`
 */
export const useWriteAuctionSetTimeBuffer =
  /*#__PURE__*/ createUseWriteContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'setTimeBuffer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"settleAuction"`
 */
export const useWriteAuctionSettleAuction =
  /*#__PURE__*/ createUseWriteContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'settleAuction',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"settleCurrentAndCreateNewAuction"`
 */
export const useWriteAuctionSettleCurrentAndCreateNewAuction =
  /*#__PURE__*/ createUseWriteContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'settleCurrentAndCreateNewAuction',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteAuctionTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteAuctionUnpause = /*#__PURE__*/ createUseWriteContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'unpause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const useWriteAuctionUpgradeTo = /*#__PURE__*/ createUseWriteContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteAuctionUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__
 */
export const useSimulateAuction = /*#__PURE__*/ createUseSimulateContract({
  abi: auctionAbi,
  address: auctionAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useSimulateAuctionAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const useSimulateAuctionCancelOwnershipTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'cancelOwnershipTransfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"createBid"`
 */
export const useSimulateAuctionCreateBid =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'createBid',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"createBidWithReferral"`
 */
export const useSimulateAuctionCreateBidWithReferral =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'createBidWithReferral',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateAuctionInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateAuctionPause = /*#__PURE__*/ createUseSimulateContract({
  abi: auctionAbi,
  address: auctionAddress,
  functionName: 'pause',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const useSimulateAuctionSafeTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'safeTransferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setDuration"`
 */
export const useSimulateAuctionSetDuration =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'setDuration',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setFounderReward"`
 */
export const useSimulateAuctionSetFounderReward =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'setFounderReward',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setMinimumBidIncrement"`
 */
export const useSimulateAuctionSetMinimumBidIncrement =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'setMinimumBidIncrement',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setReservePrice"`
 */
export const useSimulateAuctionSetReservePrice =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'setReservePrice',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"setTimeBuffer"`
 */
export const useSimulateAuctionSetTimeBuffer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'setTimeBuffer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"settleAuction"`
 */
export const useSimulateAuctionSettleAuction =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'settleAuction',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"settleCurrentAndCreateNewAuction"`
 */
export const useSimulateAuctionSettleCurrentAndCreateNewAuction =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'settleCurrentAndCreateNewAuction',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateAuctionTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateAuctionUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const useSimulateAuctionUpgradeTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'upgradeTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link auctionAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateAuctionUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: auctionAbi,
    address: auctionAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__
 */
export const useWatchAuctionEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: auctionAbi,
  address: auctionAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"AuctionBid"`
 */
export const useWatchAuctionAuctionBidEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: auctionAbi,
    address: auctionAddress,
    eventName: 'AuctionBid',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"AuctionCreated"`
 */
export const useWatchAuctionAuctionCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: auctionAbi,
    address: auctionAddress,
    eventName: 'AuctionCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"AuctionSettled"`
 */
export const useWatchAuctionAuctionSettledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: auctionAbi,
    address: auctionAddress,
    eventName: 'AuctionSettled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"DurationUpdated"`
 */
export const useWatchAuctionDurationUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: auctionAbi,
    address: auctionAddress,
    eventName: 'DurationUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"FounderRewardUpdated"`
 */
export const useWatchAuctionFounderRewardUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: auctionAbi,
    address: auctionAddress,
    eventName: 'FounderRewardUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchAuctionInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: auctionAbi,
    address: auctionAddress,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"MinBidIncrementPercentageUpdated"`
 */
export const useWatchAuctionMinBidIncrementPercentageUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: auctionAbi,
    address: auctionAddress,
    eventName: 'MinBidIncrementPercentageUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"OwnerCanceled"`
 */
export const useWatchAuctionOwnerCanceledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: auctionAbi,
    address: auctionAddress,
    eventName: 'OwnerCanceled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"OwnerPending"`
 */
export const useWatchAuctionOwnerPendingEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: auctionAbi,
    address: auctionAddress,
    eventName: 'OwnerPending',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"OwnerUpdated"`
 */
export const useWatchAuctionOwnerUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: auctionAbi,
    address: auctionAddress,
    eventName: 'OwnerUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchAuctionPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: auctionAbi,
    address: auctionAddress,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"ReservePriceUpdated"`
 */
export const useWatchAuctionReservePriceUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: auctionAbi,
    address: auctionAddress,
    eventName: 'ReservePriceUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"TimeBufferUpdated"`
 */
export const useWatchAuctionTimeBufferUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: auctionAbi,
    address: auctionAddress,
    eventName: 'TimeBufferUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchAuctionUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: auctionAbi,
    address: auctionAddress,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link auctionAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchAuctionUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: auctionAbi,
    address: auctionAddress,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__
 */
export const useReadToken = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 */
export const useReadTokenDomainSeparator = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'DOMAIN_SEPARATOR',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"auction"`
 */
export const useReadTokenAuction = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'auction',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadTokenBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"contractURI"`
 */
export const useReadTokenContractUri = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'contractURI',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"contractVersion"`
 */
export const useReadTokenContractVersion = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'contractVersion',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"delegates"`
 */
export const useReadTokenDelegates = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'delegates',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"getApproved"`
 */
export const useReadTokenGetApproved = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'getApproved',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"getFounder"`
 */
export const useReadTokenGetFounder = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'getFounder',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"getFounders"`
 */
export const useReadTokenGetFounders = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'getFounders',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"getPastVotes"`
 */
export const useReadTokenGetPastVotes = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'getPastVotes',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"getScheduledRecipient"`
 */
export const useReadTokenGetScheduledRecipient =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'getScheduledRecipient',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"getVotes"`
 */
export const useReadTokenGetVotes = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'getVotes',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadTokenIsApprovedForAll = /*#__PURE__*/ createUseReadContract(
  { abi: tokenAbi, address: tokenAddress, functionName: 'isApprovedForAll' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"isMinter"`
 */
export const useReadTokenIsMinter = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'isMinter',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"metadataRenderer"`
 */
export const useReadTokenMetadataRenderer = /*#__PURE__*/ createUseReadContract(
  { abi: tokenAbi, address: tokenAddress, functionName: 'metadataRenderer' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"minter"`
 */
export const useReadTokenMinter = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'minter',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"name"`
 */
export const useReadTokenName = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"nonce"`
 */
export const useReadTokenNonce = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'nonce',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"owner"`
 */
export const useReadTokenOwner = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadTokenOwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const useReadTokenPendingOwner = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'pendingOwner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadTokenProxiableUuid = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"remainingTokensInReserve"`
 */
export const useReadTokenRemainingTokensInReserve =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'remainingTokensInReserve',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"reservedUntilTokenId"`
 */
export const useReadTokenReservedUntilTokenId =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'reservedUntilTokenId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadTokenSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadTokenSymbol = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadTokenTokenUri = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"totalFounderOwnership"`
 */
export const useReadTokenTotalFounderOwnership =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'totalFounderOwnership',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"totalFounders"`
 */
export const useReadTokenTotalFounders = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'totalFounders',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadTokenTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__
 */
export const useWriteToken = /*#__PURE__*/ createUseWriteContract({
  abi: tokenAbi,
  address: tokenAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useWriteTokenAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteTokenApprove = /*#__PURE__*/ createUseWriteContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"burn"`
 */
export const useWriteTokenBurn = /*#__PURE__*/ createUseWriteContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'burn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const useWriteTokenCancelOwnershipTransfer =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'cancelOwnershipTransfer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"delegate"`
 */
export const useWriteTokenDelegate = /*#__PURE__*/ createUseWriteContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'delegate',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"delegateBySig"`
 */
export const useWriteTokenDelegateBySig = /*#__PURE__*/ createUseWriteContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'delegateBySig',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteTokenInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteTokenMint = /*#__PURE__*/ createUseWriteContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mintBatchTo"`
 */
export const useWriteTokenMintBatchTo = /*#__PURE__*/ createUseWriteContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'mintBatchTo',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mintFromReserveTo"`
 */
export const useWriteTokenMintFromReserveTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'mintFromReserveTo',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mintTo"`
 */
export const useWriteTokenMintTo = /*#__PURE__*/ createUseWriteContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'mintTo',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"onFirstAuctionStarted"`
 */
export const useWriteTokenOnFirstAuctionStarted =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'onFirstAuctionStarted',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteTokenSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const useWriteTokenSafeTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'safeTransferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteTokenSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"setMetadataRenderer"`
 */
export const useWriteTokenSetMetadataRenderer =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'setMetadataRenderer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"setReservedUntilTokenId"`
 */
export const useWriteTokenSetReservedUntilTokenId =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'setReservedUntilTokenId',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteTokenTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteTokenTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"updateFounders"`
 */
export const useWriteTokenUpdateFounders = /*#__PURE__*/ createUseWriteContract(
  { abi: tokenAbi, address: tokenAddress, functionName: 'updateFounders' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"updateMinters"`
 */
export const useWriteTokenUpdateMinters = /*#__PURE__*/ createUseWriteContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'updateMinters',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const useWriteTokenUpgradeTo = /*#__PURE__*/ createUseWriteContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'upgradeTo',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteTokenUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__
 */
export const useSimulateToken = /*#__PURE__*/ createUseSimulateContract({
  abi: tokenAbi,
  address: tokenAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useSimulateTokenAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateTokenApprove = /*#__PURE__*/ createUseSimulateContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"burn"`
 */
export const useSimulateTokenBurn = /*#__PURE__*/ createUseSimulateContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'burn',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 */
export const useSimulateTokenCancelOwnershipTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'cancelOwnershipTransfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"delegate"`
 */
export const useSimulateTokenDelegate = /*#__PURE__*/ createUseSimulateContract(
  { abi: tokenAbi, address: tokenAddress, functionName: 'delegate' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"delegateBySig"`
 */
export const useSimulateTokenDelegateBySig =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'delegateBySig',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateTokenInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateTokenMint = /*#__PURE__*/ createUseSimulateContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mintBatchTo"`
 */
export const useSimulateTokenMintBatchTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'mintBatchTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mintFromReserveTo"`
 */
export const useSimulateTokenMintFromReserveTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'mintFromReserveTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"mintTo"`
 */
export const useSimulateTokenMintTo = /*#__PURE__*/ createUseSimulateContract({
  abi: tokenAbi,
  address: tokenAddress,
  functionName: 'mintTo',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"onFirstAuctionStarted"`
 */
export const useSimulateTokenOnFirstAuctionStarted =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'onFirstAuctionStarted',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateTokenSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"safeTransferOwnership"`
 */
export const useSimulateTokenSafeTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'safeTransferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateTokenSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"setMetadataRenderer"`
 */
export const useSimulateTokenSetMetadataRenderer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'setMetadataRenderer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"setReservedUntilTokenId"`
 */
export const useSimulateTokenSetReservedUntilTokenId =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'setReservedUntilTokenId',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateTokenTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateTokenTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"updateFounders"`
 */
export const useSimulateTokenUpdateFounders =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'updateFounders',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"updateMinters"`
 */
export const useSimulateTokenUpdateMinters =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'updateMinters',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const useSimulateTokenUpgradeTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'upgradeTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateTokenUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__
 */
export const useWatchTokenEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: tokenAbi,
  address: tokenAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchTokenApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchTokenApprovalForAllEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"DelegateChanged"`
 */
export const useWatchTokenDelegateChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'DelegateChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"DelegateVotesChanged"`
 */
export const useWatchTokenDelegateVotesChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'DelegateVotesChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"FounderAllocationsCleared"`
 */
export const useWatchTokenFounderAllocationsClearedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'FounderAllocationsCleared',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchTokenInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"MetadataRendererUpdated"`
 */
export const useWatchTokenMetadataRendererUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'MetadataRendererUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"MintScheduled"`
 */
export const useWatchTokenMintScheduledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'MintScheduled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"MintUnscheduled"`
 */
export const useWatchTokenMintUnscheduledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'MintUnscheduled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"MinterUpdated"`
 */
export const useWatchTokenMinterUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'MinterUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"OwnerCanceled"`
 */
export const useWatchTokenOwnerCanceledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'OwnerCanceled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"OwnerPending"`
 */
export const useWatchTokenOwnerPendingEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'OwnerPending',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"OwnerUpdated"`
 */
export const useWatchTokenOwnerUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'OwnerUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"ReservedUntilTokenIDUpdated"`
 */
export const useWatchTokenReservedUntilTokenIdUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'ReservedUntilTokenIDUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchTokenTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchTokenUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenAbi,
    address: tokenAddress,
    eventName: 'Upgraded',
  })
