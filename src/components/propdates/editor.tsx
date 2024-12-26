import { Input, Textarea, VStack } from '@chakra-ui/react';
import React from 'react';
import { Button } from '../ui/button';

function PropdatesEditor() {
  return (
    <VStack align={'end'} gap={2} w={'full'}>
      <Textarea placeholder='Write your proposal updates' minH={'140px'} />
      <Button>Submit</Button>
    </VStack>
  );
}

export default PropdatesEditor;
