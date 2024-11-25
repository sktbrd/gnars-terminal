'use client';

import { Proposal } from '@/app/services/proposal';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useWriteGovernorCastVote,
  useWriteGovernorCastVoteWithReason,
} from '@/hooks/wagmiGenerated';
import {
  ButtonProps,
  HStack,
  Text,
  Textarea,
  useMediaQuery,
  VStack,
} from '@chakra-ui/react';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Field } from '../ui/field';
import { RadioCardItem, RadioCardRoot } from '../ui/radio-card';

import { Link as ChakraLink } from '@chakra-ui/react';
import NextLink from 'next/link';
import Countdown from 'react-countdown';
import { LuExternalLink } from 'react-icons/lu';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';

import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

interface CastVoteProps {
  proposal: Proposal;
}

type Vote = 'For' | 'Against' | 'Abstain';

const voteMap = {
  FOR: {
    label: 'For',
    color: 'green.500',
  },
  AGAINST: {
    label: 'Against',
    color: 'red.500',
  },
  ABSTAIN: {
    label: 'Abstain',
    color: 'yellow.500',
  },
};

export default function CastVote({ proposal }: CastVoteProps) {
  const account = useAccount();
  const userAddress = account.address
    ? account.address.toLocaleLowerCase()
    : zeroAddress;

  const [vote, setVote] = useState<Vote | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [isLargerThanMd] = useMediaQuery(['(min-width: 768px)'], {
    fallback: [false],
  });

  useEffect(() => {
    console.log({ isLargerThanMd });
  }, [isLargerThanMd]);

  // 0 = Against, 1 = For, 2 = Abstain
  const voteValue = vote === 'For' ? 1n : vote === 'Against' ? 0n : 2n;
  const disableFields = txHash !== null || loading;
  const voteStarted =
    new Date().getTime() > parseInt(proposal.voteStart) * 1000;
  const voteEnded = new Date().getTime() > parseInt(proposal.voteEnd) * 1000;

  const userVote = proposal.votes.find(
    (vote) => vote.voter.toLocaleLowerCase() === userAddress
  );

  const { writeContractAsync: writeCastVote } = useWriteGovernorCastVote();
  const { writeContractAsync: writeCastVoteReason } =
    useWriteGovernorCastVoteWithReason();

  const onClickVote = useCallback(async () => {
    setLoading(true);
    try {
      console.log(proposal, vote, reason);
      if (reason && reason !== '') {
        const receipt = await writeCastVoteReason({
          args: [proposal.proposalId, voteValue, reason],
        });
        setTxHash(receipt);
      } else {
        const receipt = await writeCastVote({
          args: [proposal.proposalId, voteValue],
        });
        setTxHash(receipt);
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        window.alert(`Error creating bid: ${error.message}`);
      } else {
        window.alert('Error creating bid');
      }
    } finally {
      setLoading(false);
    }
  }, [writeCastVote, vote, reason]);

  if (userVote) {
    return (
      <Text w={'full'} textAlign={'center'} mt={3} fontWeight={'medium'}>
        You voted{' '}
        <Text asChild color={voteMap[userVote.support].color}>
          <span>{voteMap[userVote.support].label}</span>
        </Text>{' '}
        with {userVote.weight} votes
      </Text>
    );
  }

  const VoteButton = forwardRef<HTMLButtonElement, ButtonProps>(
    function VoteButton(props, ref) {
      return (
        <Button
          size={'lg'}
          w={'full'}
          variant={'solid'}
          disabled={!voteStarted || voteEnded}
          {...props}
          ref={ref}
        >
          {voteStarted ? (
            'Submit Votes'
          ) : (
            <Countdown date={parseInt(proposal.voteStart) * 1000} />
          )}
        </Button>
      );
    }
  );

  const VoteBody = () => {
    return (
      <VStack gap={4} align='stretch'>
        <RadioCardRoot defaultValue={'Abstain'} disabled={disableFields}>
          <HStack align='stretch'>
            <RadioCardItem
              value={'For'}
              label={'For'}
              colorPalette={'green'}
              onChange={() => setVote('For')}
            />
            <RadioCardItem
              value={'Against'}
              label={'Against'}
              colorPalette={'red'}
              onChange={() => setVote('Against')}
            />
            <RadioCardItem
              value={'Abstain'}
              label={'Abstain'}
              colorPalette={'gray'}
              onChange={() => setVote('Abstain')}
            />
          </HStack>
        </RadioCardRoot>
        <Field label='Reason'>
          <Textarea
            placeholder='Enter your reason here'
            onChange={(event) => setReason(event.target.value)}
            disabled={disableFields}
          />
        </Field>
      </VStack>
    );
  };

  const VoteFooter = () => {
    return (
      <VStack w={'full'}>
        <Button
          loading={loading}
          disabled={disableFields}
          onClick={onClickVote}
          w={'full'}
        >
          {disableFields ? 'Submited' : 'Submit'}
        </Button>
        {txHash && (
          <ChakraLink asChild>
            <NextLink href={`https://basescan.org/tx/${txHash}`}>
              Transaction: {txHash.slice(0, 4)}...{txHash.slice(-4)}
              <LuExternalLink />
            </NextLink>
          </ChakraLink>
        )}
      </VStack>
    );
  };

  if (isLargerThanMd) {
    return (
      <DialogRoot placement={'center'} motionPreset='slide-in-bottom'>
        <DialogTrigger asChild>
          <VoteButton />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader pb={2}>
            <DialogTitle>Submit Votes</DialogTitle>
          </DialogHeader>
          <DialogBody pb={2}>
            <VoteBody />
          </DialogBody>
          <DialogFooter>
            <VoteFooter />
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    );
  }

  return (
    <DrawerRoot placement={'bottom'}>
      <DrawerBackdrop />
      <DrawerTrigger asChild>
        <VoteButton />
      </DrawerTrigger>
      <DrawerContent roundedTop={'md'}>
        <DrawerHeader>
          <DrawerTitle>Submit Votes</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <VoteBody />
        </DrawerBody>
        <DrawerFooter>
          <VoteFooter />
        </DrawerFooter>
        <DrawerCloseTrigger />
      </DrawerContent>
    </DrawerRoot>
  );
}
