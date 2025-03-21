import React, { useState } from 'react';
import TransactionList from './TransactionList';
import TransactionItem from './TransactionItem';
import TransactionTypes, { transactionOptions } from './TransactionTypes';
import { Box, Heading, VStack, Text } from '@chakra-ui/react';

const ProposalCreator = () => {
    const [transactions, setTransactions] = useState<{ type: string; details: Record<string, any> }[]>([]);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingTransaction, setEditingTransaction] = useState<{ type: string; details: Record<string, any> } | null>(null);

    const handleAddTransaction = (transaction: { type: string; details: Record<string, any> }) => {
        if (editingIndex !== null) {
            // If editing, update the transaction at the specified index
            setTransactions(prev => {
                const newTransactions = [...prev];
                newTransactions[editingIndex] = transaction;
                return newTransactions;
            });

            // Reset editing state
            setEditingIndex(null);
            setEditingTransaction(null);
        } else {
            // If adding new, push to array
            setTransactions(prev => [...prev, transaction]);
        }

        // Reset transaction type selection
        setSelectedType(null);
    };

    const handleEditTransaction = (index: number, transaction: { type: string; details: Record<string, any> }) => {
        setEditingIndex(index);
        setEditingTransaction(transaction);
        setSelectedType(transaction.type);
    };

    const handleDeleteTransaction = (index: number) => {
        setTransactions(prev => prev.filter((_, i) => i !== index));
    };

    const handleCancelEdit = () => {
        setSelectedType(null);
        setEditingIndex(null);
        setEditingTransaction(null);
    };

    return (
        <VStack gap={8} align="stretch" width="100%">
            <Heading as="h1" size="xl">Create Proposal</Heading>

            {!selectedType && (
                <Box>
                    <Heading as="h2" size="md" mb={4}>Select Transaction Type</Heading>
                    <TransactionTypes onSelect={setSelectedType} />
                </Box>
            )}

            {selectedType && (
                <TransactionItem
                    type={selectedType}
                    onAdd={handleAddTransaction}
                    onCancel={handleCancelEdit}
                    initialValues={editingTransaction?.details}
                />
            )}

            <Box>
                <Heading as="h2" size="md" mb={4}>Transaction List</Heading>
                <TransactionList
                    transactions={transactions}
                    onDelete={handleDeleteTransaction}
                    onEdit={handleEditTransaction}
                />
            </Box>
        </VStack>
    );
};

export default ProposalCreator;
