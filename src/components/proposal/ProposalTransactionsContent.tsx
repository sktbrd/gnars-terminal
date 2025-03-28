import { Box, VStack, Heading, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import {
  decodeSenditTransaction,
  decodeUsdcTransaction,
} from './transactions/utils/decodeTXs';
import EthTransferTransaction from './transactions/EthTransferTransaction';
import { Address } from 'viem';
import USDCTransaction from './transactions/USDCTransaction';
import MintBatchTransaction from './transactions/MintBatchTransaction';
import DroposalTransaction from './transactions/DroposalTransaction';
import NftTransferTransaction from './transactions/NFTTransfer';
import SenditTransaction from './transactions/SenditTransaction';
import { tokenAddress } from '@/hooks/wagmiGenerated';
import { SENDIT_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from '@/utils/constants';

// Utility function to normalize calldata
const normalizeCalldata = (calldata: Address): Address => {
  return calldata === '0x' || calldata === ('0' as Address) ? '0x' : calldata;
};

// Utility function to validate calldata
const isValidCalldata = (calldata: Address): boolean => {
  return calldata !== '0x' && calldata.length >= 10;
};

interface ProposalTransactionsContentProps {
  proposal: {
    targets: string[];
    values: string[];
    calldatas: string[] | string; // Allow both string[] and delimited string
    descriptionHash?: string;
    blockNumber?: number;
  };
}

function TransactionItem({
  index,
  target,
  value,
  calldata,
  descriptionHash,
  blockNumber,
}: {
  index: number;
  target: string;
  value: string;
  calldata: Address;
  descriptionHash?: string;
  blockNumber?: number;
}) {
  const normalizedCalldata = normalizeCalldata(calldata);

  console.debug(`Transaction ${index + 1}:`);
  console.debug(`Target Address: ${target}`);
  console.debug(`Normalized Calldata: ${normalizedCalldata}`);

  if (target === SENDIT_CONTRACT_ADDRESS) {
    const senditTransaction = isValidCalldata(normalizedCalldata)
      ? decodeSenditTransaction(normalizedCalldata)
      : null;

    if (senditTransaction) {
      const { to, value: decodedValue } = senditTransaction;
      const formattedValue = (
        BigInt(decodedValue) / BigInt(10 ** 18)
      ).toString();
      return <SenditTransaction index={index} to={to} value={formattedValue} />;
    }
  }

  // Debug log for USDC transaction check
  console.debug(
    `Checking if target matches USDC contract: ${target.toLowerCase()} === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'`
  );

  if (target.toLowerCase() === USDC_CONTRACT_ADDRESS.toLowerCase()) {
    const usdcTransaction = isValidCalldata(normalizedCalldata)
      ? decodeUsdcTransaction(normalizedCalldata)
      : null;

    if (usdcTransaction) {
      const { to, value: decodedValue } = usdcTransaction;
      const formattedValue = (BigInt(decodedValue) / BigInt(10 ** 6)).toString();
      return <USDCTransaction index={index} to={to} value={formattedValue} />;
    } else {
      console.debug(`Failed to decode USDC transaction for calldata: ${normalizedCalldata}`);
    }
  }

  if (normalizedCalldata === '0x' && value !== '0') {
    return (
      <EthTransferTransaction
        toAddress={target as Address}
        value={BigInt(value)}
      />
    );
  }
  // TODO: fix me 
  if (target === '0x58c3ccb2dcb9384e5ab9111cd1a5dea916b0f33c') {
    return <DroposalTransaction calldata={calldata} index={index} descriptionHash={descriptionHash} blockNumber={blockNumber} />;
  }

  if (target.toLowerCase() === tokenAddress.toLowerCase()) {
    const functionSignature = normalizedCalldata.slice(0, 10);

    if (functionSignature === '0x23b872dd') {
      return (
        <NftTransferTransaction calldata={normalizedCalldata} index={index} />
      );
    }

    if (functionSignature === '0xd52fbd91') {
      return (
        <MintBatchTransaction calldata={normalizedCalldata} index={index} />
      );
    }

    return (
      <Box p={4} borderWidth={1} rounded="md" shadow="sm" mb={4}>
        <Heading size="sm" mb={2}>
          Transaction {index + 1}: Unrecognized Transaction
        </Heading>
        <Text>
          <strong>Target:</strong> {target}
        </Text>
        <Text>
          <strong>Calldata:</strong> {normalizedCalldata}
        </Text>
      </Box>
    );
  }

  console.debug(`Transaction ${index + 1} fell into the generic case.`);
  return (
    <Box p={4} borderWidth={1} rounded="md" shadow="sm" mb={4}>
      <Heading size="sm" mb={2}>
        Transaction {index + 1}: Generic Transaction
      </Heading>
      <Text>
        <strong>Target:</strong> {target}
      </Text>
      <Text>
        <strong>Value:</strong> {value} wei
      </Text>
      <Text>
        <strong>Calldata:</strong> {normalizedCalldata}
      </Text>
    </Box>
  );
}

export default function ProposalTransactionsContent({
  proposal,
}: ProposalTransactionsContentProps) {
  const { targets, values, calldatas, descriptionHash } = proposal;

  const memoizedDescriptionHash = useMemo(() => descriptionHash, [descriptionHash]);

  const parsedCalldatas = useMemo(() => {
    return typeof calldatas === 'string'
      ? (calldatas.split(':') as Address[])
      : (calldatas as Address[]);
  }, [calldatas]);

  const normalizedCalldatas = useMemo(() => {
    return parsedCalldatas.map(normalizeCalldata);
  }, [parsedCalldatas]);

  if (
    !targets ||
    !values ||
    !parsedCalldatas ||
    targets.length === 0 ||
    targets.length !== values.length ||
    targets.length !== parsedCalldatas.length
  ) {
    console.error('Proposal data is inconsistent or missing!');
    return (
      <Box maxW="100%" minW="100%" p={2}>
        <Text>No transactions available for this proposal.</Text>
      </Box>
    );
  }

  return (
    <Box maxW="100%" minW="100%" p={2}>
      <VStack gap={2} align="stretch">
        {targets.map((target, index) => (
          <TransactionItem
            key={index}
            index={index}
            target={target}
            value={values[index]}
            calldata={normalizedCalldatas[index] as Address}
            descriptionHash={memoizedDescriptionHash}
          />
        ))}
      </VStack>
    </Box>
  );
}
