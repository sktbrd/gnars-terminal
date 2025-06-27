import React from 'react';
import { Box, Heading, Text, VStack, Code } from '@chakra-ui/react';
import GatewayMonitor from '@/components/admin/GatewayMonitor';

/**
 * Example page demonstrating the IPFS Gateway optimization system
 * 
 * Add this to your app to monitor gateway performance and costs
 */
export default function GatewayDemoPage() {
  return (
    <Box p={6} maxW="1400px" mx="auto">
      <VStack gap={8} align="stretch">
        <Box>
          <Heading size="xl" mb={4}>IPFS Gateway Cost Optimization</Heading>
          <Text fontSize="lg" color="gray.600">
            Monitor and optimize your IPFS gateway usage to reduce bandwidth costs
          </Text>
        </Box>

        <Box p={4} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.400">
          <VStack align="start" gap={2} textAlign="left">
            <Text fontWeight="bold">Cost Savings Strategy</Text>
            <Text fontSize="sm">
              This system prioritizes free gateways (ipfs.io, Cloudflare) before falling back to your paid Pinata gateway. 
              Expected savings: 70-95% reduction in paid bandwidth usage.
            </Text>
          </VStack>
        </Box>

        <Box>
          <Heading size="lg" mb={4}>Configuration</Heading>
          <Text mb={4}>Add these environment variables to your <Code>.env.local</Code> file:</Text>
          
          <Code p={4} borderRadius="md" display="block" whiteSpace="pre" fontSize="sm" bg="gray.50">
{`# Your paid gateway (Pinata)
NEXT_PUBLIC_IPFS_PAID_GATEWAY="https://gateway.pinata.cloud/ipfs/"

# Skip paid gateways for development (saves costs)
NEXT_PUBLIC_IPFS_SKIP_PAID_GATEWAYS=true

# Enable aggressive caching for production
NEXT_PUBLIC_IPFS_AGGRESSIVE_CACHE=true`}
          </Code>
        </Box>

        <Box>
          <Heading size="lg" mb={4}>Usage Example</Heading>
          <Code p={4} borderRadius="md" display="block" whiteSpace="pre" fontSize="sm" bg="gray.50">
{`import { ipfsToHttp } from '@/utils/ipfs-gateway';

// Simple usage (automatically uses free gateways first)
const imageUrl = ipfsToHttp('ipfs://QmHash...');

// React hook with loading states
import { useIpfsUrl } from '@/hooks/useIpfsUrl';

function MyComponent({ ipfsUri }) {
  const { resolvedUrl, loading, error } = useIpfsUrl(ipfsUri, {
    skipPaidGateways: true, // Save costs
  });
  
  if (loading) return <Spinner />;
  if (error) return <Text>Failed to load</Text>;
  
  return <Image src={resolvedUrl} alt="IPFS content" />;
}`}
          </Code>
        </Box>

        {/* Gateway Monitor Component */}
        <GatewayMonitor />
      </VStack>
    </Box>
  );
}
