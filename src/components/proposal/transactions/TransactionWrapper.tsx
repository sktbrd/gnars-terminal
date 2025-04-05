import { Box, Heading, VStack, HStack, Image } from '@chakra-ui/react';
import { ReactNode, memo } from 'react';

interface TransactionWrapperProps {
    index: number;
    title: string;
    children: ReactNode;
    logoSrc?: string;
    logoAlt?: string;
}

// Apply memoization to prevent unnecessary re-renders
const TransactionWrapper = memo(({
    index,
    title,
    children,
    logoSrc,
    logoAlt,
}: TransactionWrapperProps) => {
    return (
        <Box
            borderWidth='1px'
            borderRadius='md'
            p={4}
            _dark={{ bg: 'bg.emphasized', borderColor: 'yellow.500' }}
            mb={4}
        >
            <HStack gap={2} align='center'>
                {logoSrc && (
                    <Image mb={2} src={logoSrc} alt={logoAlt} boxSize='20px' objectFit='contain' />
                )}
                <Heading size='xl' mb={2}>
                    {title}
                </Heading>
            </HStack>
            <hr style={{ marginBottom: 10, border: '0.3px solid rgb(121, 121, 121)' }} />
            <VStack align='start' gap={2}>
                {children}
            </VStack>
        </Box>
    );
});

// Add display name for better debugging
TransactionWrapper.displayName = 'TransactionWrapper';

export default TransactionWrapper;
