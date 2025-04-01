'use client';

import { Proposal } from '@/app/services/proposal';
import { PropDateInterface } from '@/utils/database/interfaces';
import { createContext, ReactNode, useContext, useState } from 'react';
import { TransactionReceipt } from 'viem';

interface ProposalContextType {
    // Core proposal data
    proposal: Proposal;
    setProposal: (proposal: Proposal) => void;
    proposalNumber: number;

    // Transaction related data
    descriptionHash?: string;
    blockNumber?: number;

    // Droposal specific data
    tokenCreated: string | null;
    setTokenCreated: (address: string | null) => void;

    // Transaction receipt data
    transactionReceipt: TransactionReceipt | null;
    setTransactionReceipt: (receipt: TransactionReceipt | null) => void;

    // Propdates
    propdates: PropDateInterface[];
    setPropdates: React.Dispatch<React.SetStateAction<PropDateInterface[]>>;
}

const ProposalContext = createContext<ProposalContextType | undefined>(undefined);

export function ProposalProvider({
    children,
    initialProposal,
    initialProposalNumber,
    initialDescriptionHash,
    initialBlockNumber,
    initialPropdates = [],
}: {
    children: ReactNode;
    initialProposal: Proposal;
    initialProposalNumber: number;
    initialDescriptionHash?: string;
    initialBlockNumber?: number;
    initialPropdates?: PropDateInterface[];
}) {
    const [proposal, setProposal] = useState<Proposal>(initialProposal);
    const [tokenCreated, setTokenCreated] = useState<string | null>(null);
    const [transactionReceipt, setTransactionReceipt] = useState<TransactionReceipt | null>(null);
    const [propdates, setPropdates] = useState<PropDateInterface[]>(initialPropdates || []);

    return (
        <ProposalContext.Provider
            value={{
                proposal,
                setProposal,
                proposalNumber: initialProposalNumber,
                descriptionHash: initialDescriptionHash,
                blockNumber: initialBlockNumber,
                tokenCreated,
                setTokenCreated,
                transactionReceipt,
                setTransactionReceipt,
                propdates,
                setPropdates,
            }}
        >
            {children}
        </ProposalContext.Provider>
    );
}

export function useProposal() {
    const context = useContext(ProposalContext);
    if (context === undefined) {
        throw new Error('useProposal must be used within a ProposalProvider');
    }
    return context;
}
