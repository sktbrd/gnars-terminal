import { Textarea, VStack } from '@chakra-ui/react';
import React from 'react';
import { Button } from '../ui/button';
import { useForm, Controller } from 'react-hook-form';
import { useAccount } from 'wagmi';

interface FormData {
  content: string;
}

function PropdatesEditor({ propdateId }: { propdateId: string }) {
  const { control, handleSubmit } = useForm<FormData>();
  const { address } = useAccount();

  const onSubmit = (data: FormData) => {
    console.log('Submitted update:', data);
    fetch('/api/propdates', {
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
  };

  return (
    <VStack align={'end'} gap={2} w={'full'} asChild>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name='content'
          control={control}
          defaultValue=''
          rules={{ required: 'Update content is required' }}
          render={({ field, fieldState }) => (
            <Textarea
              {...field}
              placeholder='Write your proposal updates'
              minH={'140px'}
            />
          )}
        />
        <Button type='submit'>Submit</Button>
      </form>
    </VStack>
  );
}

export default PropdatesEditor;
