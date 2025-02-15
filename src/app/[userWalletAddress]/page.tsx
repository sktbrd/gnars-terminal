'use client';
import { useParams } from 'next/navigation';
import WalletPage from '@/components/treasure/WalletPage';
import { Address } from 'viem';

const UserWalletPage = () => {
    const params = useParams();
    const userWalletAddress = params?.userWalletAddress as Address | undefined;
    return <WalletPage address={userWalletAddress!} />;
};

export default UserWalletPage;
