'use client';

import SENDIT_ABI from '@/components/proposal/transactions/utils/SENDIT_abi';
import { Button } from '@/components/ui/button';
import { SENDIT_CONTRACT_ADDRESS } from '@/utils/constants';
import { Box, HStack, Input, Text, VStack } from '@chakra-ui/react';
import React, { useState, useCallback, useEffect } from 'react';
import {
  Address,
  BaseError,
  encodeFunctionData,
  formatUnits,
  zeroAddress,
} from 'viem';
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { abi } from './sm_abi';

function ClaimPage() {
  const [smartWalletAddress, setSmartWalletAddress] = useState('');
  const [buttonText, setButtonText] = useState('Claim');

  const {
    data: transactionHash,
    isPending: isWritting,
    error,
    writeContract,
  } = useWriteContract();
  const { address: userAddress } = useAccount();

  const { data: senditBalance } = useReadContract({
    address: SENDIT_CONTRACT_ADDRESS,
    abi: SENDIT_ABI,
    functionName: 'balanceOf',
    args: [(smartWalletAddress as Address) || zeroAddress],
  });

  const { data: userIsOwner } = useReadContract({
    address: smartWalletAddress as Address,
    abi,
    functionName: 'isOwnerAddress',
    args: [userAddress || zeroAddress],
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: transactionHash,
    });

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!smartWalletAddress || !userAddress || !senditBalance) {
        console.error('Missing smart wallet address, user address, or balance');
        return;
      }

      setButtonText('Claiming');

      const encodedData = encodeFunctionData({
        abi: SENDIT_ABI,
        functionName: 'transfer',
        args: [userAddress, senditBalance],
      });

      console.log(encodedData);

      try {
        writeContract({
          address: smartWalletAddress as Address,
          abi,
          functionName: 'execute',
          args: [SENDIT_CONTRACT_ADDRESS, 0n, encodedData],
        });
      } catch (error) {
        console.error(error);
      } finally {
        setButtonText('Claim');
      }
    },
    [smartWalletAddress, userAddress, senditBalance, writeContract]
  );

  useEffect(() => {
    if (isConfirmed) {
      setButtonText('Claimed');
      setTimeout(() => {
        setButtonText(
          senditBalance && senditBalance > 0n ? 'Claim' : 'Claimed'
        );
      }, 3000);
    }
  }, [isConfirmed, senditBalance]);

  return (
    <HStack w={'full'} minH={'80vh'} justify={'center'}>
      <VStack alignItems={'center'} gap={1}>
        <Box w={'full'} minW={'sm'} p={4} borderWidth={1} borderRadius={8}>
          <form onSubmit={handleSubmit}>
            <VStack alignItems={'start'} gap={2}>
              <VStack alignItems={'start'} gap={0}>
                <Text fontSize={'xl'} fontWeight={'bold'}>
                  Claim Sendit
                </Text>
                <Text color={'fg.muted'}>
                  Claim the tokens from a Smart Wallet
                </Text>
              </VStack>
              <Input
                type='text'
                placeholder='Smart Wallet Address'
                id='smartWallet'
                size={'lg'}
                value={smartWalletAddress}
                onChange={(e) => setSmartWalletAddress(e.target.value)}
              />
              <Button
                w={'full'}
                type='submit'
                variant={'surface'}
                disabled={
                  !smartWalletAddress || !senditBalance || senditBalance === 0n || !userIsOwner
                }
                loading={isWritting || isConfirming}
                loadingText={buttonText}
              >
                {buttonText}
              </Button>
            </VStack>
          </form>
        </Box>
        {senditBalance && (
          <Text>Balance: {formatUnits(senditBalance, 18)}</Text>
        )}
        {transactionHash && <Text>Hash: {transactionHash}</Text>}
        {userAddress && smartWalletAddress && !userIsOwner && <Text>User do not own the smart wallet</Text>}
        {error && (
          <Text>
            Error: {(error as BaseError).shortMessage || error.message}
          </Text>
        )}
      </VStack>
    </HStack>
  );
}

export default ClaimPage;
