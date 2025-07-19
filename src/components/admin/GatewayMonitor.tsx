"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Button,
  Grid,
} from '@chakra-ui/react';
import { getGatewayStats, clearGatewayCaches, preloadCommonContent } from '@/utils/ipfs-gateway';

interface GatewayStats {
  url: string;
  name: string;
  cost: 'free' | 'paid' | 'unknown';
  reliability: 'high' | 'medium' | 'low';
  timeout: number;
  health: {
    successCount: number;
    failureCount: number;
    lastSuccess: number;
    avgResponseTime: number;
  };
  reliabilityScore: number;
}

export function GatewayMonitor() {
  const [stats, setStats] = useState<GatewayStats[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshStats = () => {
    const gatewayStats = getGatewayStats();
    setStats(gatewayStats);
  };

  const handleClearCaches = () => {
    clearGatewayCaches();
    alert('All IPFS gateway caches have been cleared.');
    refreshStats();
  };

  const handlePreloadContent = async () => {
    setLoading(true);
    try {
      const commonCids = [
        'bafybeibizoza4jwnx5t3nqz3x3lho6allperhgbksbkpx4iqzgcqh4q5di',
      ];
      
      await preloadCommonContent(commonCids);
      alert('Common content has been preloaded into cache.');
    } catch (error) {
      alert('Failed to preload some content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getCostBadgeColor = (cost: string) => {
    switch (cost) {
      case 'free': return 'green';
      case 'paid': return 'red';
      default: return 'gray';
    }
  };

  const formatLastSuccess = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const totalRequests = stats.reduce((sum, gateway) => 
    sum + gateway.health.successCount + gateway.health.failureCount, 0
  );

  const totalSuccesses = stats.reduce((sum, gateway) => 
    sum + gateway.health.successCount, 0
  );

  const overallSuccessRate = totalRequests > 0 ? (totalSuccesses / totalRequests) * 100 : 0;

  const costSavings = stats.reduce((savings, gateway) => {
    const requests = gateway.health.successCount + gateway.health.failureCount;
    return gateway.cost === 'free' ? savings + requests : savings;
  }, 0);

  const costSavingsPercentage = totalRequests > 0 ? (costSavings / totalRequests) * 100 : 0;

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack gap={6} align="stretch">
        <Heading size="lg">IPFS Gateway Monitor</Heading>
        
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <Box p={4} borderWidth={1} borderRadius="md">
            <Text fontSize="sm" color="gray.500">Overall Success Rate</Text>
            <Text fontSize="2xl" fontWeight="bold">{overallSuccessRate.toFixed(1)}%</Text>
            <Text fontSize="sm" color="gray.600">{totalRequests} total requests</Text>
          </Box>
          
          <Box p={4} borderWidth={1} borderRadius="md">
            <Text fontSize="sm" color="gray.500">Cost Savings</Text>
            <Text fontSize="2xl" fontWeight="bold">{costSavingsPercentage.toFixed(1)}%</Text>
            <Text fontSize="sm" color="gray.600">{costSavings} free requests</Text>
          </Box>
          
          <Box p={4} borderWidth={1} borderRadius="md">
            <Text fontSize="sm" color="gray.500">Active Gateways</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.length}</Text>
            <Text fontSize="sm" color="gray.600">{stats.filter(g => g.health.successCount > 0).length} responding</Text>
          </Box>
          
          <Box p={4} borderWidth={1} borderRadius="md">
            <Text fontSize="sm" color="gray.500">Avg Response Time</Text>
            <Text fontSize="2xl" fontWeight="bold">
              {stats.length > 0 
                ? Math.round(stats.reduce((sum, g) => sum + g.health.avgResponseTime, 0) / stats.length)
                : 0
              }ms
            </Text>
            <Text fontSize="sm" color="gray.600">Across all gateways</Text>
          </Box>
        </Grid>

        <HStack gap={4}>
          <Button onClick={refreshStats} variant="outline">
            Refresh Stats
          </Button>
          <Button onClick={handleClearCaches} variant="outline">
            Clear Caches
          </Button>
          <Button 
            onClick={handlePreloadContent} 
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Loading...' : 'Preload Common Content'}
          </Button>
        </HStack>

        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={4}>
          {stats.map((gateway, index) => (
            <Box key={gateway.url} p={4} borderWidth={1} borderRadius="md">
              <VStack align="stretch" gap={3}>
                <HStack justify="space-between" align="center">
                  <VStack align="start" gap={1}>
                    <Heading size="sm">{gateway.name}</Heading>
                    <Text fontSize="xs" color="gray.500">
                      {gateway.url}
                    </Text>
                  </VStack>
                  <VStack gap={1}>
                    <Badge colorScheme={getCostBadgeColor(gateway.cost)}>
                      {gateway.cost}
                    </Badge>
                    <Text fontSize="xs">
                      Priority {index + 1}
                    </Text>
                  </VStack>
                </HStack>
                
                <Box>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm">Reliability Score</Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {(gateway.reliabilityScore * 100).toFixed(1)}%
                    </Text>
                  </HStack>
                  <Box bg="gray.200" borderRadius="md" h="8px" w="100%">
                    <Box 
                      bg={gateway.reliabilityScore >= 0.8 ? 'green.400' : gateway.reliabilityScore >= 0.6 ? 'yellow.400' : 'red.400'}
                      h="100%" 
                      borderRadius="md"
                      width={`${gateway.reliabilityScore * 100}%`}
                    />
                  </Box>
                </Box>
                
                <Grid templateColumns="repeat(2, 1fr)" gap={2} fontSize="sm">
                  <Box>
                    <Text color="gray.500">Successes</Text>
                    <Text fontWeight="bold" color="green.500">
                      {gateway.health.successCount}
                    </Text>
                  </Box>
                  <Box>
                    <Text color="gray.500">Failures</Text>
                    <Text fontWeight="bold" color="red.500">
                      {gateway.health.failureCount}
                    </Text>
                  </Box>
                  <Box>
                    <Text color="gray.500">Avg Response</Text>
                    <Text fontWeight="bold">
                      {Math.round(gateway.health.avgResponseTime)}ms
                    </Text>
                  </Box>
                  <Box>
                    <Text color="gray.500">Last Success</Text>
                    <Text fontWeight="bold">
                      {formatLastSuccess(gateway.health.lastSuccess)}
                    </Text>
                  </Box>
                </Grid>
              </VStack>
            </Box>
          ))}
        </Grid>

        {stats.length === 0 && (
          <Box p={8} borderWidth={1} borderRadius="md" textAlign="center">
            <Text color="gray.500">
              No gateway statistics available yet. 
              Make some IPFS requests to see performance data.
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

export default GatewayMonitor;
