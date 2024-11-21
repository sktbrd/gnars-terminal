import { DAO_ADDRESSES } from '@/utils/constants';
import { Box, Heading } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Button } from '../ui/button';

function GovernorCard() {
  const [jsonData, setJsonData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const doThings = async () => {
    setIsLoading(true);
    console.log('doing things');
    const data = await fetch(`/api/governor/${DAO_ADDRESSES.token}`);
    console.log(data);
    const json = await data.json();
    console.log(json);
    setJsonData(JSON.stringify(json, null, 2));
    setIsLoading(false);
  };

  return (
    <Box
      shadow={'sm'}
      w={'full'}
      padding={4}
      rounded={'md'}
      _dark={{ borderColor: 'yellow', borderWidth: 1 }}
      display={'flex'}
      flexDirection={'column'}
      gap={2}
    >
      <Heading as='h2'>Proposals</Heading>
      {jsonData ? (
        <Box
          overflow={'auto'}
          p={4}
          borderWidth={1}
          borderRadius={'md'}
          bg={'bg.subtle'}
          maxH={'240px'}
        >
          <pre>{jsonData}</pre>
        </Box>
      ) : (
        <Button w={'full'} onClick={doThings} loading={isLoading}>
          Fetch data
        </Button>
      )}
    </Box>
  );
}

export default GovernorCard;
