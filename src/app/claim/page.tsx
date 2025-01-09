'use client';

import SENDIT_ABI from '@/components/proposal/transactions/utils/SENDIT_abi';
import { Button } from '@/components/ui/button';
import { SENDIT_CONTRACT_ADDRESS } from '@/utils/constants';
import { Box, HStack, Input, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { BaseError, encodeFunctionData, formatUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { abi } from './sm_abi';

function ClaimPage() {
  const smartWallet = '0xEe4c350A3da359B9f8C774250787f08E769a0aAE';

  const { data: hash, error, writeContract } = useWriteContract();
  const { address } = useAccount();

  // Pega balance de sendit da smart wallet
  const { data: balance } = useReadContract({
    address: SENDIT_CONTRACT_ADDRESS,
    abi: SENDIT_ABI,
    functionName: 'balanceOf',
    args: [smartWallet],
  });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    console.log('submit');
    e.preventDefault();

    if (!address || !balance) {
      console.error('No address or balance');
      return;
    }

    console.log(address, balance);

    // Cria calldata de transferencia de sendit
    const data = encodeFunctionData({
      abi: SENDIT_ABI,
      functionName: 'transfer',
      args: [address, 1n],
    });

    console.log(data);

    writeContract({
      address: smartWallet,
      abi,
      functionName: 'execute',
      args: [SENDIT_CONTRACT_ADDRESS, 0n, data],
    });
  }

  return (
    <HStack w={'full'} minH={'full'} justify={'center'}>
      <VStack alignItems={'center'} gap={1}>
        <form onSubmit={submit}>
          <VStack alignItems={'center'} gap={1}>
            <Text>Claim Sendit from Zora wallet</Text>
            <Input
              type='text'
              placeholder='Smart Wallet address'
              id='smartwallet'
            />
            <Button w={'full'} type='submit'>
              Claim
            </Button>
          </VStack>
          {balance && <Text>Balance: {formatUnits(balance, 18)}</Text>}
          {hash && <Text>Hash: {hash}</Text>}
          {error && (
            <Text>
              Error: {(error as BaseError).shortMessage || error.message}
            </Text>
          )}
        </form>
      </VStack>
    </HStack>
  );
}

export default ClaimPage;
