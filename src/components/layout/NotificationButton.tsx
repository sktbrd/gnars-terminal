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
  const [frameAdded, setFrameAdded] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [addingFrame, setAddingFrame] = useState(false);
  const [enablingNotifications, setEnablingNotifications] = useState(false);
  const [disablingNotifications, setDisablingNotifications] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [context, setContext] = useState<any>(null);

  useEffect(() => {
    const loadContext: () => Promise<void> = async () => {
      if (!sdk) {
        setErrorMessage('Please open this website inside a Farcaster app that supports Frames v2.');
        return;
      }

      const ctx = await sdk.context;
      setContext(ctx);

      if (ctx?.client) {
        setFrameAdded(ctx.client.added);
      }

      if (ctx?.user?.fid) {
        try {
          const response = await fetch(`/api/farcaster/frame?fid=${ctx.user.fid}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              // If we have data in the backend, notifications are enabled
              setNotificationsEnabled(true);
              setFrameAdded(true);
            } else if (ctx?.client?.added) {
              // Frame is added but no notification data found
              setFrameAdded(true);
              setNotificationsEnabled(false);
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
      setFrameAdded(true);

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

  const handleEnableNotifications = useCallback(async () => {
    if (!context?.user?.fid) return;

    try {
      setEnablingNotifications(true);
      setErrorMessage(null);

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

      setNotificationsEnabled(true);
      console.log('Notifications enabled successfully');
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to enable notifications. Please try again.'
      );
    } finally {
      setEnablingNotifications(false);
    }
  }, [context?.user?.fid]);

  const handleDisableNotifications = useCallback(async () => {
    if (!context?.user?.fid) return;

    try {
      setDisablingNotifications(true);
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
        setNotificationsEnabled(false);
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
      setDisablingNotifications(false);
    }
  }, [context?.user?.fid]);

  const getButtonText = () => {
    if (!frameAdded) return "Add Frame";
    if (!notificationsEnabled) return "Enable Notifications";
    return "Disable Notifications";
  };

  const getButtonColor = () => {
    if (!frameAdded) return "yellow";
    if (!notificationsEnabled) return "blue";
    return "red";
  };

  const handleButtonClick = () => {
    if (!frameAdded) {
      return handleAddFrame();
    }
    if (!notificationsEnabled) {
      return handleEnableNotifications();
    }
    return handleDisableNotifications();
  };

  const isLoading = addingFrame || enablingNotifications || disablingNotifications;

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
              
              {frameAdded && !notificationsEnabled && (
                <Text fontSize={"sm"} fontWeight="medium">
                  You've added this frame. Enable notifications to get updates about proposals.
                </Text>
              )}
              
              {frameAdded && notificationsEnabled && (
                <Text fontSize={"sm"} fontWeight="medium" color="green.500">
                  You will receive notifications about new proposals and voting periods.
                </Text>
              )}
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
                colorPalette={getButtonColor()}
                variant="surface"
                onClick={handleButtonClick}
                disabled={isLoading || errorMessage !== null}
                loading={isLoading}
              >
                {getButtonText()}
              </Button>
            </VStack>
          </DrawerFooter>
        </DrawerContent>
      </DrawerRoot>
    </>
  );
}