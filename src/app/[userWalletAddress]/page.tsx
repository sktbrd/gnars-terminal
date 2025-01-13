'use client';
import { useParams } from 'next/navigation';
import WalletPage from '@/components/treasure/WalletPage';

const UserWalletPage = () => {
    const params = useParams();
    const userWalletAddress = params?.userWalletAddress as string | undefined;
    return <WalletPage address={userWalletAddress!} />;
};

export default UserWalletPage;
