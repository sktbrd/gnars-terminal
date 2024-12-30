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
import { useDialog, VStack } from '@chakra-ui/react';
import { Dispatch, SetStateAction, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import Editor from '../create-proposal/Editor';
import { Button } from '../ui/button';

interface FormData {
  content: string;
}

interface PropdatesEditorProps {
  propdateId: string;
  setPropdates: Dispatch<SetStateAction<PropDateInterface[]>>;
}

function PropdatesEditor({ propdateId, setPropdates }: PropdatesEditorProps) {
  const { control, handleSubmit, formState } = useForm<FormData>();
  const { address } = useAccount();

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/propdates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        proposal: propdateId,
        text: data.content,
        author: address,
      }),
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

    setPropdates((prevPropdates) => [...res.data, ...prevPropdates]);
  };

  return (
    <DialogRoot size={'lg'} onExitComplete={() => control._reset()}>
      <DialogTrigger asChild>
        <Button w={'full'} variant='surface'>
          Create new Propdate
        </Button>
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
                defaultValue=''
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
