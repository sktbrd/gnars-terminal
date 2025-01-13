'use client';
import WalletPage from '@/components/treasure/WalletPage';

const TreasurePage = () => {
    const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY!;
    return <WalletPage address={treasuryAddress} />;
};

export default TreasurePage;
