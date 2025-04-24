'use client';

import { Button } from '@/components/ui/button';
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  IconButton,
  Text,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import sdk from '@farcaster/frame-sdk';
import { useCallback, useEffect, useState } from 'react';
import { LuBell } from 'react-icons/lu';
import { Tooltip } from '../ui/tooltip';

export default function NotificationButton() {
  const { open, onOpen, onClose } = useDisclosure();
  const [added, setAdded] = useState(false);
  const [addingFrame, setAddingFrame] = useState(false);
  const [removingFrame, setRemovingFrame] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [context, setContext] = useState<any>(null);

  useEffect(() => {
    const loadContext: () => Promise<void> = async () => {
      const ctx = await sdk.context;
      setContext(ctx);

      if (ctx?.client) {
        setAdded(ctx.client.added);
      }

      if (ctx?.user?.fid) {
        try {
          const response = await fetch(`/api/farcaster/frame?fid=${ctx.user.fid}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setAdded(true);
            }
          }
        } catch (error) {
          console.error('Error checking notification status:', error);
        }
      }
    };
    loadContext();
  }, []);

  const handleAddFrame = useCallback(async () => {
    try {
      setAddingFrame(true);
      setErrorMessage(null);

      const result = await sdk.actions.addFrame();
      setAdded(true);

      // Store frame details in Supabase
      const response = await fetch('/api/farcaster/frame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fid: context?.user?.fid,
          targetUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to store frame details');
      }

      console.log('Frame added successfully', result);
    } catch (error) {
      console.error('Error adding frame:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to add frame. Please try again.'
      );
    } finally {
      setAddingFrame(false);
    }
  }, [context?.user?.fid]);

  const handleDisableNotifications = useCallback(async () => {
    if (!context?.user?.fid) return;

    try {
      setRemovingFrame(true);
      setErrorMessage(null);

      const response = await fetch('/api/farcaster/frame', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fid: context.user.fid,
        }),
      });

      if (response.ok) {
        setAdded(false);
      } else {
        const error = await response.json();
        setErrorMessage(`Error: ${error.error || 'Failed to disable notifications'}`);
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to disable notifications. Please try again.'
      );
    } finally {
      setRemovingFrame(false);
    }
  }, [context?.user?.fid]);

  return (
    <>
      <Tooltip content="Get DAO Notifications">
        <IconButton
          aria-label="Get DAO notifications"
          variant="ghost"
          size="sm"
          onClick={onOpen}
        >
          <LuBell />
        </IconButton>
      </Tooltip>

      <DrawerRoot open={open} onOpenChange={onClose} size="md" placement="bottom">
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerCloseTrigger />

          <DrawerHeader>
            <DrawerTitle>Farcaster Notifications</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <VStack gap={6} align="stretch">
              <Text fontSize={"sm"}>
                Receive a notification on Farcaster whenever a new proposal is created or the voting period starts.
              </Text>
            </VStack>
          </DrawerBody>

          <DrawerFooter mb={8}>
            <VStack w="full" gap={3}>
              {errorMessage && (
                <Text color="red.500" fontSize="sm">
                  {errorMessage}
                </Text>
              )}

              <Button
                w="full"
                size={"lg"}
                colorScheme={added ? "red" : "yellow"}
                onClick={added ? handleDisableNotifications : handleAddFrame}
                disabled={addingFrame || removingFrame}
                loading={addingFrame || removingFrame}
              >
                {added ? "Disable Notifications" : "Add Frame on Farcaster"}
              </Button>
            </VStack>
          </DrawerFooter>
        </DrawerContent>
      </DrawerRoot>
    </>
  );
}