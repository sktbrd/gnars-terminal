'use client';

import {
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PropDateInterface } from '@/utils/database/interfaces';
import { VStack } from '@chakra-ui/react';
import {
  Dispatch,
  ForwardRefExoticComponent,
  RefAttributes,
  SetStateAction,
} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import Editor from '../create-proposal/Editor';
import { Button, ButtonProps } from '../ui/button';

interface FormData {
  content: string;
}

interface PropdatesEditorProps {
  proposalId: string;
  setPropdates: Dispatch<SetStateAction<PropDateInterface[]>>;
  existingPropdate?: PropDateInterface;
  buttonProps?: ButtonProps & RefAttributes<HTMLButtonElement>;
  buttonInnerChildren?: React.ReactNode;
}

function PropdatesEditor({
  proposalId,
  setPropdates,
  existingPropdate,
  buttonProps,
  buttonInnerChildren,
}: PropdatesEditorProps) {
  const { control, handleSubmit, formState, reset } = useForm<FormData>({
    defaultValues: { content: existingPropdate?.text || '' },
  });
  const { address } = useAccount();

  const onSubmit = async (data: FormData) => {
    const method = existingPropdate ? 'PUT' : 'POST';
    const bodyData = existingPropdate
      ? { propdate: existingPropdate.id, text: data.content }
      : { proposal: proposalId, text: data.content, author: address };

    const res = await fetch('/api/propdates', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to create propdate');
        }
        return response.json();
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    setPropdates((prevPropdates) => {
      if (existingPropdate) {
        return prevPropdates.map((pd) =>
          pd.id === existingPropdate.id ? { ...pd, text: data.content } : pd
        );
      }
      return [...res.data, ...prevPropdates];
    });
  };

  return (
    <DialogRoot
      size={'lg'}
      onExitComplete={() => reset({ content: existingPropdate?.text || '' })}
    >
      <DialogTrigger asChild>
        <Button {...buttonProps}>{buttonInnerChildren}</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create new Propdate</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack align={'stretch'} gap={2} w={'full'} asChild>
              <Controller
                name='content'
                control={control}
                rules={{ required: 'Update content is required' }}
                render={({ field }) => (
                  <Editor
                    value={field.value}
                    onChange={(content) => {
                      field.onChange(content);
                    }}
                    height={400}
                  />
                )}
              />
            </VStack>
          </DialogBody>
          <DialogFooter>
            {formState.isSubmitted ? (
              <DialogActionTrigger asChild>
                <Button variant='outline'>Close</Button>
              </DialogActionTrigger>
            ) : formState.isSubmitting ? (
              <Button variant='outline' disabled>
                Submitting...
              </Button>
            ) : (
              <>
                <DialogActionTrigger asChild>
                  <Button variant='outline'>Cancel</Button>
                </DialogActionTrigger>
                <Button type='submit'>Submit</Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}

export default PropdatesEditor;
