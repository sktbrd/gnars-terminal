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
import { useCallback, useState } from 'react';
import { LuBell } from 'react-icons/lu';
import { Tooltip } from '../ui/tooltip';

export default function NotificationButton() {
  const { open, onOpen, onClose } = useDisclosure();
  const [added, setAdded] = useState(false);
  const [addingFrame, setAddingFrame] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState<FrameNotificationDetails|null>(null);
  const [notificationResult, setNotificationResult] = useState<string | null>(null);

  const handleAddFrame = useCallback(async () => {
    try {
      setAddingFrame(true);
      setErrorMessage(null);
      setNotificationResult(null);

      const result = await sdk.actions.addFrame();
      setAdded(true);

      if (result.notificationDetails) {
        setNotificationDetails(result.notificationDetails);
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
  }, []);

  const handleSendNotification = useCallback(async () => {
    if (!notificationDetails) return;

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
          token: notificationDetails.token,
          url: notificationDetails.url,
          targetUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setNotificationResult('Notification sent successfully!');
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
  }, [notificationDetails]);

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
                  disabled={sendingNotification || !notificationDetails}
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
            </VStack>
          </DrawerFooter>
        </DrawerContent>
      </DrawerRoot>
    </>
  );
}