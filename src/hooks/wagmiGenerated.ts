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
