'use client';

import { PropDateInterface } from '@/utils/database/interfaces';
import { Icon, Text } from '@chakra-ui/react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAccount } from 'wagmi';
import { Button } from '../ui/button';
import { useCallback, useState } from 'react';
import { toaster } from '@/components/ui/toaster';

interface PropdatesLikeProps {
  propdate: PropDateInterface;
}

function PropdatesLike({ propdate }: PropdatesLikeProps) {
  const { address } = useAccount();
  const [userLiked, setUserLiked] = useState(false);
  const [likes, setLikes] = useState<{ user: string }[]>(propdate.likes || []);

  const propdateLiked =
    likes.some((like) => like.user === address) || userLiked;

  const handleLike = useCallback(async () => {
    const isLiking = !propdateLiked;

    const promise = new Promise<void>(async (resolve, reject) => {
      if (!address) return;

      setUserLiked(isLiking);
      setLikes((prevLikes) =>
        isLiking
          ? [...prevLikes, { user: address }]
          : prevLikes.filter((like) => like.user !== address)
      );
      try {
        const response = await fetch('/api/propdates/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propdate: propdate.id, user: address }),
        });
        const data = await response.json();
        if (!response.ok) {
          console.error(data.error);
          setUserLiked(!isLiking);
          setLikes((prevLikes) =>
            isLiking
              ? prevLikes.filter((like) => like.user !== address)
              : [...prevLikes, { user: address }]
          );
          reject(data.error);
        } else {
          resolve();
        }
      } catch (error) {
        setUserLiked(!isLiking);
        setLikes((prevLikes) =>
          isLiking
            ? prevLikes.filter((like) => like.user !== address)
            : [...prevLikes, { user: address }]
        );
        console.error(error);
        reject(error);
      }
    });
    const action = isLiking ? 'liked' : 'unliked';
    toaster.promise(promise, {
      success: {
        title: `Successfully ${action}!`,
        description: `You have successfully ${action}`,
      },
      error: {
        title: `${isLiking ? 'Like' : 'Unlike'} failed`,
        description: `Something went wrong while trying to ${isLiking ? 'like' : 'unlike'}`,
      },
      loading: {
        title: `${isLiking ? 'Liking' : 'Unliking'}...`,
        description: `Please wait while we ${isLiking ? 'like' : 'unlike'}`,
      },
    });
  }, [address, propdateLiked]);

  return (
    <Button
      onClick={handleLike}
      disabled={!address}
      colorPalette={'red'}
      variant={'ghost'}
      size={'sm'}
    >
      <Icon color={'red.600'}>
        {propdateLiked ? <FaHeart /> : <FaRegHeart />}
      </Icon>
      {likes.length ? (
        <Text>{likes.length}</Text>
      ) : userLiked ? (
        <Text>1</Text>
      ) : null}
    </Button>
  );
}

export default PropdatesLike;
