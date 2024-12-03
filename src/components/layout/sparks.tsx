import { Button } from '@/components/ui/button';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { weiToSparks } from '@/utils/spark';
import { Badge, HStack, Text } from '@chakra-ui/react';
import { FaEthereum } from 'react-icons/fa';
import { LuSparkle } from 'react-icons/lu';
import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { Tooltip } from '../ui/tooltip';

export default function Sparks() {
  const { isConnected, address } = useAccount();
  const { data: balance } = useBalance({
    address,
  });

  if (!isConnected) return null;

  return (
    <DialogRoot placement={'center'} size={'xs'} motionPreset='slide-in-bottom'>
      <Tooltip content={'Sparks balance'}>
        <DialogTrigger asChild>
          <Button variant={'subtle'} size={'xs'} py={1}>
            <LuSparkle width={2} height={2} />
            {weiToSparks(balance?.value || 0n)}
          </Button>
        </DialogTrigger>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Balance</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <HStack justify={'center'}>
            <Badge size={'lg'}>
              <Text
                display={'flex'}
                alignContent={'center'}
                alignItems={'center'}
                gap={1}
                fontSize={'lg'}
                fontWeight={'bold'}
              >
                <LuSparkle width={2} height={2} />
                {weiToSparks(balance?.value || 0n)}
              </Text>
            </Badge>
            <Text fontSize={'xl'}>=</Text>
            <Badge size={'lg'}>
              <Text
                alignItems={'center'}
                display={'flex'}
                gap={1}
                fontSize={'lg'}
                fontWeight={'bold'}
              >
                <FaEthereum width={2} height={2} />
                {parseFloat(formatEther(balance?.value || 0n)).toFixed(6)}
              </Text>
            </Badge>
          </HStack>
        </DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}
