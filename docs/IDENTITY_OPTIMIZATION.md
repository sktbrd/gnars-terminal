# Gnars Terminal Identity Optimization

## Overview

This document describes the new identity resolution and display system implemented for the Gnars Terminal app. The goal is to provide fast, reliable, and user-friendly display of Ethereum addresses, ENS names, and avatars throughout the app, replacing the previous Whisk API resolver.

## Key Features

- **ENS Resolution:** Uses wagmi's `useEnsName` and `useEnsAvatar` hooks to resolve ENS names and avatars for any Ethereum address, always querying on Ethereum mainnet.
- **Performance Optimization:** Centralized hook (`useENSData`) with memoization and caching to minimize redundant lookups and improve UI responsiveness.
- **Zero Address & Duplicate Filtering:** All tables and lists filter out zero addresses and duplicates for clean display.
- **Special Address Handling:** Custom display for known addresses (e.g., Gnars Treasury) with links and labels.
- **Fallback Avatars:** Uses DiceBear identicons for addresses without ENS avatars.

## Main Files

- `src/hooks/useENSData.ts`: Centralized hook for ENS name and avatar resolution, with performance optimizations and fallback logic.
- `src/components/utils/names.tsx`: `FormattedAddress` component for displaying addresses, ENS names, and links, using `useENSData`.
- `src/components/utils/OptimizedIdentity.tsx`: Optimized avatar and name components for use in tables and cards, leveraging shared ENS data.
- `src/components/cards/members.tsx`: Members table, now filters zero addresses and duplicates, and uses `FormattedAddress` for display.
- `src/utils/helpers.ts`: Utility functions for address formatting and display.
- `src/utils/wagmi.ts`: Wagmi config, now imports chains from `viem/chains` and uses Alchemy mainnet RPC for reliable ENS resolution.

## Usage Example

```tsx
import { FormattedAddress } from '@/components/utils/names';

<FormattedAddress address={member.owner} />;
```

## How It Works

1. **Address passed to `FormattedAddress`.**
2. **`useENSData` resolves ENS name and avatar on mainnet.**
3. **Memoized display name and avatar returned.**
4. **Special cases (e.g., treasury) handled in component.**
5. **Fallback to identicon if no ENS avatar.**

## Migration Notes

- Whisk API resolver is commented out and replaced everywhere with ENS-based system.
- All address display logic is now centralized and optimized for performance.
- Debug logging is removed for production.

## Further Improvements

- Add support for Farcaster, Lens, or other identity systems as needed.
- UI enhancements for avatar and name display.

---

For questions or further improvements, see the code in the files listed above or contact the maintainers.
