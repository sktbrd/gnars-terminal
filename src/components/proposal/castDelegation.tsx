'use client';

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
import {
    ButtonProps,
    Link as ChakraLink,
    HStack,
    Text,
    Textarea,
    useMediaQuery,
    VStack,
    Input,
    Center,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { LuExternalLink } from 'react-icons/lu';
import { Address, zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from '../ui/button';
import { Field } from '../ui/field';
import { useReadTokenDelegates, useSimulateTokenDelegate, useWriteTokenDelegate, tokenAbi, tokenAddress, useReadGovernorGetVotes } from '@/hooks/wagmiGenerated';
import { FormattedAddress } from '../utils/ethereum';
import { toaster } from "@/components/ui/toaster";

interface CastDelegationProps {
    onOpen: boolean;
    setOpen: (value: boolean) => void;
}

interface DelegationBodyProps {
    disableFields: boolean;
    setDelegationAddress: (address: string) => void;
}

const DelegationBody = forwardRef<HTMLDivElement, DelegationBodyProps>(
    function DelegationBody({ disableFields, setDelegationAddress }, ref) {
        return (
            <VStack gap={4} align='stretch'>
                <Field label='Delegate to:'>
                    <Input
                        placeholder='Enter address here'
                        onChange={(event) => setDelegationAddress(event.target.value)}
                        disabled={disableFields}
                    />
                </Field>
            </VStack>
        );
    }
);

interface DelegationFooterProps {
    loading: boolean;
    disableFields: boolean;
    onClickDelegation: () => void;
    txHash: string | null;
}

const DelegationFooter: React.FC<DelegationFooterProps> = ({ loading, disableFields, onClickDelegation, txHash }) => {
    return (
        <VStack w={'full'}>
            <Button
                loading={loading}
                disabled={disableFields}
                onClick={onClickDelegation}
                w={'full'}
            >
                {disableFields ? 'Submitted' : 'Submit'}
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

export default function CastDelegation({ onOpen, setOpen }: CastDelegationProps) {
    const account = useAccount();
    const [delegationAddress, setDelegationAddress] = useState<string>('');
    const [txHash, setTxHash] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentTimestamp, setCurrentTimestamp] = useState<BigInt | null>(null);

    const userAddress = account.address ? account.address.toLocaleLowerCase() : zeroAddress;
    const { data: userVotes, error: userVotesError } = useReadGovernorGetVotes({
        args: userAddress && currentTimestamp ? [userAddress as Address, currentTimestamp as bigint] : undefined,
    });
    const tokensDelegated = useReadTokenDelegates({ args: [userAddress as Address] });
    // TODO: Add a check to see if the delegation address is a valid address with this function if ever needed 
    const delegateSimulation = useSimulateTokenDelegate({ args: [delegationAddress as Address] });
    const { writeContractAsync: writeDelegation } = useWriteTokenDelegate();


    useEffect(() => {
        const timestamp = Math.floor(Date.now() / 1000);
        setCurrentTimestamp(BigInt(timestamp));
    }, []);


    const [isLargerThanMd] = useMediaQuery(['(min-width: 768px)'], { fallback: [true] });

    const disableFields = useMemo(() => txHash !== null || loading, [txHash, loading]);

    const onClickDelegation = useCallback(async () => {
        if (delegationAddress.toLowerCase() === tokensDelegated.data?.toLowerCase()) {
            toaster.error({
                title: "Warning",
                description: "You are already delegated to this address.",
            });
            return;
        }
        setLoading(true);
        try {
            const tx = await writeDelegation({ args: [delegationAddress as Address] });
            setTxHash(tx);
            toaster.success({
                title: "Success",
                description: "Delegation submitted successfully.",
            });
        } catch (error) {
            console.error(error);
            toaster.error({
                title: "Error",
                description: "Failed to submit delegation.",
            });
        } finally {
            setLoading(false);
        }
    }, [delegationAddress, tokensDelegated.data, writeDelegation]);

    const DialogContentComponent = (
        <>
            <DialogHeader pb={2}>
                <DialogTitle>Submit Delegation</DialogTitle>
            </DialogHeader>
            <DialogBody pb={2}>
                <Text mb={4} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                    {tokensDelegated.data?.toLowerCase() === userAddress
                        ? <span>You are in control of <strong>{userVotes?.toString() || "XX"}</strong> votes. </span>
                        : (
                            <VStack>
                                <HStack>
                                    <span>You delegated your votes to </span>
                                    <FormattedAddress address={tokensDelegated.data} />
                                </HStack>
                                <Text>
                                    In order to recover your votes, you must delegate to yourself.
                                </Text>
                            </VStack>
                        )}
                </Text>
                <DelegationBody disableFields={disableFields} setDelegationAddress={setDelegationAddress} />
            </DialogBody>
            <DialogFooter>
                <DelegationFooter loading={loading} disableFields={disableFields} onClickDelegation={onClickDelegation} txHash={txHash} />
            </DialogFooter>
            <DialogCloseTrigger onClick={() => setOpen(false)} />
        </>
    );

    const DrawerContentComponent = (
        <>
            <DrawerHeader>
                <DrawerTitle>Submit Delegation</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
                <Text mb={4} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                    {tokensDelegated.data?.toLowerCase() === userAddress
                        ? <span>You are in control of <strong>{userVotes?.toString() || "XX"}</strong> votes. </span>
                        : (
                            <HStack>
                                <span>Delegated to</span>
                                <FormattedAddress address={tokensDelegated.data} />
                            </HStack>
                        )}
                </Text>
                <DelegationBody disableFields={disableFields} setDelegationAddress={setDelegationAddress} />
            </DrawerBody>
            <DrawerFooter>
                <DelegationFooter loading={loading} disableFields={disableFields} onClickDelegation={onClickDelegation} txHash={txHash} />
            </DrawerFooter>
            <DrawerCloseTrigger onClick={() => setOpen(false)} />
        </>
    );

    return isLargerThanMd ? (
        <DialogRoot placement={'center'} motionPreset='slide-in-bottom' open={onOpen}>
            <DialogContent>{DialogContentComponent}</DialogContent>
        </DialogRoot>
    ) : (
        <DrawerRoot placement={'bottom'} open={onOpen} closeOnEscape>
            <DrawerBackdrop />
            <DrawerContent roundedTop={'md'}>{DrawerContentComponent}</DrawerContent>
        </DrawerRoot>
    );
}
