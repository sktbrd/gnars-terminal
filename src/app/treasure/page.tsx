'use client';
import WalletPage from '@/components/treasure/WalletPage';
import { Address } from 'viem';

const TreasurePage = () => {
    const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY! as Address
    return <WalletPage address={treasuryAddress} />;
};

export default TreasurePage;
