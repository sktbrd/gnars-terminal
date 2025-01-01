'use client';

import { PropDateInterface } from '@/utils/database/interfaces';
import { Icon, Text } from '@chakra-ui/react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAccount } from 'wagmi';
import { Button } from '../ui/button';

interface PropdatesLikeProps {
  propdate: PropDateInterface;
}

function PropdatesLike({ propdate }: PropdatesLikeProps) {
  const { address } = useAccount();

  return (
    <Button colorPalette={'red'} variant={'ghost'} size={'sm'}>
      <Icon color={'red.600'}>
        {propdate.likes.some((like) => like.user === address) ? (
          <FaHeart />
        ) : (
          <FaRegHeart />
        )}
      </Icon>
      {propdate.likes.length ? <Text>{propdate.likes.length}</Text> : null}
    </Button>
  );
}

export default PropdatesLike;
