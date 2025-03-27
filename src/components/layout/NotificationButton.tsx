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
import sdk, { FrameNotificationDetails } from '@farcaster/frame-sdk';
import { useCallback, useEffect, useState } from 'react';
import { LuBell } from 'react-icons/lu';
import { Tooltip } from '../ui/tooltip';

export default function NotificationButton() {
  const { open, onOpen, onClose } = useDisclosure();
  const [added, setAdded] = useState(false);
  const [addingFrame, setAddingFrame] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState<FrameNotificationDetails | null>(null);
  const [notificationResult, setNotificationResult] = useState<string | null>(null);
  const [context, setContext] = useState<any>(null);

  useEffect(() => {
    const loadContext = async () => {
      const ctx = await sdk.context;
      setContext(ctx);

      if (ctx?.client) {
        setAdded(ctx.client.added);
        if (ctx.client.notificationDetails) {
          setNotificationDetails(ctx.client.notificationDetails);
        }
      }
    };
    loadContext();
  }, []);

  const handleAddFrame = useCallback(async () => {
    try {
      setAddingFrame(true);
      setErrorMessage(null);
      setNotificationResult(null);

      const result = await sdk.actions.addFrame();
      setAdded(true);

      if (result.notificationDetails) {
        setNotificationDetails(result.notificationDetails);

        // Store notification details in Supabase
        const response = await fetch('/api/farcaster/frame', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fid: context?.user?.fid,
            notificationDetails: result.notificationDetails,
            targetUrl: window.location.href,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to store notification details');
        }
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

  const handleSendNotification = useCallback(async () => {
    if (!context?.user?.fid) return;

    try {
      setSendingNotification(true);
      setNotificationResult(null);
      setErrorMessage(null);

      const response = await fetch('/api/farcaster/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUrl: window.location.href,
          title: 'Test Notification',
          body: 'This is a test notification from Gnars DAO',
          fid: context.user.fid, // Send to specific FID for test
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotificationResult('Notification sent successfully!');
        if (data.summary) {
          setNotificationResult(`Notification sent successfully! (${data.summary.successful} delivered, ${data.summary.rateLimited} rate limited)`);
        }
      } else if (response.status === 429) {
        setErrorMessage('Rate limited. Please try again later.');
      } else {
        setErrorMessage(`Error: ${data.error || 'Failed to send notification'}`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to send notification. Please try again.'
      );
    } finally {
      setSendingNotification(false);
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

              {notificationResult && (
                <Text color="green.500" fontSize="sm">
                  {notificationResult}
                </Text>
              )}

              <Button
                w="full"
                size={"lg"}
                colorScheme="yellow"
                onClick={handleAddFrame}
                disabled={added || addingFrame}
                loading={addingFrame}
              >
                {added
                  ? "✓ Added to Farcaster"
                  : "Add Frame on Farcaster"}
              </Button>

              {added && notificationDetails && (
                <Button
                  w="full"
                  colorScheme="blue"
                  onClick={handleSendNotification}
                  disabled={sendingNotification || !notificationDetails || !context?.user?.fid}
                  loading={sendingNotification}
                >
                  Send Test Notification
                </Button>
              )}

              {added && (
                <Text fontSize="sm" color="green.500">
                  You'll now receive notifications about Gnars DAO activities
                </Text>
              )}
              {notificationDetails && (
                <Text fontSize="sm" color="yellow.500">
                  {JSON.stringify(notificationDetails, null, 2)}
                </Text>
              )}
            </VStack>
          </DrawerFooter>
        </DrawerContent>
      </DrawerRoot>
    </>
  );
}