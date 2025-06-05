'use client';
import { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Heading,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';
import { NFT } from '@/hooks/useTreasure';

interface NFTSectionProps {
  nfts: NFT[];
}

const ITEMS_PER_PAGE = 20;

const NFTSection: React.FC<NFTSectionProps> = ({ nfts }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Sort NFTs in reverse order
  const sortedNfts = [...nfts].reverse();

  const paginatedNfts = sortedNfts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage * ITEMS_PER_PAGE < nfts.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  console.log('NFTs:', nfts);
  return (
    <Box py={8}>
      <Heading size='lg' mb={6} textAlign='center'>
        NFTs
      </Heading>
      <Grid templateColumns='repeat(auto-fill, minmax(220px, 1fr))' gap={2}>
        {paginatedNfts.map((nft) => (
          <Box
            key={`${nft.token.collection.openseaId}-${nft.token.tokenId}`}
            borderWidth='1px'
            borderRadius='lg'
            overflow='hidden'
            boxShadow='lg'
            _hover={{
              transform: 'scale(1.03)',
              transition: '0.3s',
            }}
          >
            <Box height='240px' position='relative' bg='gray.900'>
              {nft.token.medias &&
              nft.token.medias.length > 0 &&
              nft.token.medias[0].originalUrl ? (
                <Image
                  src={nft.token.medias[0].originalUrl}
                  alt={nft.token.collection.name}
                  width='100%'
                  height='100%'
                  objectFit='cover'
                />
              ) : (
                <Image
                  src='/images/loading.gif'
                  alt='Default Placeholder'
                  width='100%'
                  height='100%'
                  objectFit='contain'
                />
              )}
            </Box>
            <VStack
              p={4}
              gap={1}
              align='center'
              height='100px'
              justify='center'
            >
              <Text fontWeight='bold' fontSize='lg' truncate textAlign='center'>
                {nft.token.collection.name || 'Unnamed Collection'}
              </Text>
              <Text fontSize='sm' color='gray.400' textAlign='center'>
                Token ID: {nft.token.tokenId || 'Unknown'}
              </Text>
            </VStack>
          </Box>
        ))}
      </Grid>
      <Box mt={8} display='flex' justifyContent='center' gap={4}>
        <Button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          variant='solid'
          colorScheme='teal'
        >
          Previous
        </Button>
        <Button
          onClick={handleNextPage}
          disabled={currentPage * ITEMS_PER_PAGE >= nfts.length}
          variant='solid'
          colorScheme='teal'
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default NFTSection;
