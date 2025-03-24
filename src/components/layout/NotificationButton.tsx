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
import { useCallback, useState } from 'react';
import { LuBell } from 'react-icons/lu';
import { Tooltip } from '../ui/tooltip';

export default function NotificationButton() {
  const { open, onOpen, onClose } = useDisclosure();
  const [added, setAdded] = useState(false);
  const [addingFrame, setAddingFrame] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddFrame = useCallback(async () => {
    try {
      setAddingFrame(true);
      setErrorMessage(null);

      const result = await sdk.actions.addFrame();
      setAdded(true);

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
              <Text fontSize={"md"}>
                Stay updated with the latest proposals and votes in the Gnars DAO. Receive a notification on Farcaster whenever a new proposal is created or the voting period starts.
              </Text>
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <VStack w="full" gap={3}>
              {errorMessage && (
                <Text color="red.500" fontSize="sm">
                  {errorMessage}
                </Text>
              )}

              <Button
                w="full"
                colorScheme="yellow"
                onClick={handleAddFrame}
                disabled={added || addingFrame}
                loading={addingFrame}
              >
                {added
                  ? "✓ Added to Farcaster"
                  : "Add Frame on Farcaster"}
              </Button>

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