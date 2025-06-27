/**
 * IPFS Gateway Configuration and Optimization Utility
 * 
 * This module provides cost-saving strategies for IPFS content delivery:
 * 1. Configurable gateway fallback order (free gateways first)
 * 2. Client-side caching with simple LRU implementation
 * 3. Request deduplication
 * 4. Error handling and retry logic
 * 5. Gateway health monitoring
 */

// Simple LRU Cache implementation to avoid external dependencies
class SimpleLRUCache<K, V> {
  private cache = new Map<K, { value: V; timestamp: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number, ttl: number) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    // Move to end (mark as recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.value;
  }

  set(key: K, value: V): void {
    // Remove expired items
    this.cleanup();
    
    // Remove oldest items if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export interface GatewayConfig {
  url: string;
  name: string;
  timeout: number;
  cost: 'free' | 'paid' | 'unknown';
  reliability: 'high' | 'medium' | 'low';
  priority: number; // Lower number = higher priority
}

// Default gateway configurations (ordered by priority)
// Based on Nouns.build research for optimal public gateways
const DEFAULT_GATEWAYS: GatewayConfig[] = [
  {
    url: 'https://ipfs.io/ipfs/',
    name: 'IPFS.io',
    timeout: 8000,
    cost: 'free',
    reliability: 'high',
    priority: 1,
  },
  {
    url: 'https://dweb.link/ipfs/',
    name: 'DWeb.link',
    timeout: 7000,
    cost: 'free',
    reliability: 'high',
    priority: 2,
  },
  {
    url: 'https://w3s.link/ipfs/',
    name: 'Web3.Storage',
    timeout: 6000,
    cost: 'free',
    reliability: 'high',
    priority: 3,
  },
  {
    url: 'https://flk-ipfs.xyz/ipfs/',
    name: 'FLK IPFS',
    timeout: 7000,
    cost: 'free',
    reliability: 'medium',
    priority: 4,
  },
  {
    url: 'https://ipfs.decentralized-content.com/ipfs/',
    name: 'Decentralized Content',
    timeout: 8000,
    cost: 'free',
    reliability: 'medium',
    priority: 5,
  },
  {
    url: 'https://ipfs.skatehive.app/ipfs/',
    name: 'Skatehive (Paid)',
    timeout: 5000,
    cost: 'paid',
    reliability: 'high',
    priority: 6,
  },
  {
    url: 'https://gateway.pinata.cloud/ipfs/',
    name: 'Pinata',
    timeout: 5000,
    cost: 'paid',
    reliability: 'high',
    priority: 7,
  },
];

// Environment variable overrides
function getGatewayConfigFromEnv(): GatewayConfig[] {
  const envGateways = process.env.NEXT_PUBLIC_IPFS_GATEWAYS;
  const envPaidGateway = process.env.NEXT_PUBLIC_IPFS_PAID_GATEWAY;
  
  if (envGateways) {
    try {
      const parsed = JSON.parse(envGateways) as GatewayConfig[];
      return parsed.sort((a, b) => a.priority - b.priority);
    } catch (error) {
      console.warn('Failed to parse NEXT_PUBLIC_IPFS_GATEWAYS, using defaults');
    }
  }
  
  // If only paid gateway is specified, add it to defaults
  if (envPaidGateway) {
    const customGateways = [...DEFAULT_GATEWAYS];
    const paidIndex = customGateways.findIndex(g => g.cost === 'paid');
    if (paidIndex >= 0) {
      customGateways[paidIndex] = {
        ...customGateways[paidIndex],
        url: envPaidGateway.endsWith('/') ? envPaidGateway : `${envPaidGateway}/`,
      };
    }
    return customGateways;
  }
  
  return DEFAULT_GATEWAYS;
}

// LRU Cache for successful resolutions
const urlCache = new SimpleLRUCache<string, string>(1000, 1000 * 60 * 30); // 1000 items, 30 min TTL

// Cache for failed attempts to avoid repeated failures
const failureCache = new SimpleLRUCache<string, Set<string>>(500, 1000 * 60 * 5); // 500 items, 5 min TTL

// In-flight request tracking to prevent duplicate requests
const inflightRequests = new Map<string, Promise<string>>();

// Gateway health tracking
const gatewayHealth = new Map<string, { 
  successCount: number; 
  failureCount: number; 
  lastSuccess: number;
  avgResponseTime: number;
}>();

/**
 * Check if a URL is accessible with timeout
 */
async function testGatewayUrl(url: string, timeout: number): Promise<{ success: boolean; responseTime: number }> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache',
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - start;
    
    return {
      success: response.ok,
      responseTime,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      success: false,
      responseTime: Date.now() - start,
    };
  }
}

/**
 * Update gateway health metrics
 */
function updateGatewayHealth(gatewayUrl: string, success: boolean, responseTime: number) {
  const current = gatewayHealth.get(gatewayUrl) || {
    successCount: 0,
    failureCount: 0,
    lastSuccess: 0,
    avgResponseTime: 0,
  };
  
  if (success) {
    current.successCount++;
    current.lastSuccess = Date.now();
    // Update average response time with exponential moving average
    current.avgResponseTime = current.avgResponseTime === 0 
      ? responseTime 
      : (current.avgResponseTime * 0.8 + responseTime * 0.2);
  } else {
    current.failureCount++;
  }
  
  gatewayHealth.set(gatewayUrl, current);
}

/**
 * Get gateway reliability score (0-1, higher is better)
 */
function getGatewayReliabilityScore(gatewayUrl: string): number {
  const health = gatewayHealth.get(gatewayUrl);
  if (!health) return 0.5; // Neutral score for unknown gateways
  
  const total = health.successCount + health.failureCount;
  if (total === 0) return 0.5;
  
  const successRate = health.successCount / total;
  const recencyBonus = Date.now() - health.lastSuccess < 60000 ? 0.1 : 0; // Recent success bonus
  
  return Math.min(1, successRate + recencyBonus);
}

/**
 * Sort gateways by priority, considering health and cost
 */
function sortGatewaysByEffectiveness(gateways: GatewayConfig[]): GatewayConfig[] {
  return [...gateways].sort((a, b) => {
    // First priority: cost (free before paid)
    if (a.cost !== b.cost) {
      if (a.cost === 'free' && b.cost === 'paid') return -1;
      if (a.cost === 'paid' && b.cost === 'free') return 1;
    }
    
    // Second priority: reliability score
    const scoreA = getGatewayReliabilityScore(a.url);
    const scoreB = getGatewayReliabilityScore(b.url);
    
    if (Math.abs(scoreA - scoreB) > 0.1) {
      return scoreB - scoreA; // Higher score first
    }
    
    // Third priority: configured priority
    return a.priority - b.priority;
  });
}

/**
 * Convert IPFS URI to HTTP URL with intelligent gateway selection
 */
export async function resolveIpfsUrl(
  ipfsUri: string,
  options: {
    preferCache?: boolean;
    timeout?: number;
    skipPaidGateways?: boolean;
  } = {}
): Promise<string> {
  // Extract CID from various IPFS URI formats
  let cid: string;
  if (ipfsUri.startsWith('ipfs://')) {
    cid = ipfsUri.slice(7);
  } else if (ipfsUri.startsWith('ipfs/')) {
    cid = ipfsUri.slice(5);
  } else if (ipfsUri.includes('/ipfs/')) {
    cid = ipfsUri.split('/ipfs/')[1];
  } else {
    // Assume it's already a CID or regular URL
    return ipfsUri;
  }
  
  // Clean CID by removing query parameters and fragments
  if (cid) {
    // Remove query parameters (everything after ?)
    const queryIndex = cid.indexOf('?');
    if (queryIndex !== -1) {
      cid = cid.substring(0, queryIndex);
    }
    
    // Remove URL fragments (everything after #)
    const fragmentIndex = cid.indexOf('#');
    if (fragmentIndex !== -1) {
      cid = cid.substring(0, fragmentIndex);
    }
    
    // Remove any trailing slashes
    cid = cid.replace(/\/+$/, '');
    
    // Validate that we still have a valid CID-like string
    if (!cid || cid.length < 10) {
      console.warn(`Invalid CID extracted from ${ipfsUri}: ${cid}`);
      return ipfsUri;
    }
  }
  
  // Check cache first
  const cacheKey = `ipfs:${cid}`;
  if (options.preferCache !== false) {
    const cached = urlCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  // Check if request is already in flight
  const existing = inflightRequests.get(cacheKey);
  if (existing) {
    return existing;
  }
  
  // Get and sort gateways
  const allGateways = getGatewayConfigFromEnv();
  const availableGateways = options.skipPaidGateways 
    ? allGateways.filter(g => g.cost !== 'paid')
    : allGateways;
  
  const sortedGateways = sortGatewaysByEffectiveness(availableGateways);
  
  // Check which gateways have recently failed for this CID
  const failedGateways = failureCache.get(cid) || new Set();
  
  const resolvePromise = async (): Promise<string> => {
    for (const gateway of sortedGateways) {
      // Skip gateways that recently failed for this CID
      if (failedGateways.has(gateway.url)) {
        continue;
      }
      
      const url = `${gateway.url}${cid}`;
      const timeout = options.timeout || gateway.timeout;
      
      try {
        const result = await testGatewayUrl(url, timeout);
        
        if (result.success) {
          // Update health metrics
          updateGatewayHealth(gateway.url, true, result.responseTime);
          
          // Cache successful resolution
          urlCache.set(cacheKey, url);
          
          // Clear any failure record for this CID
          failureCache.delete(cid);
          
          return url;
        } else {
          // Track failure
          updateGatewayHealth(gateway.url, false, result.responseTime);
          failedGateways.add(gateway.url);
        }
      } catch (error) {
        // Track failure
        updateGatewayHealth(gateway.url, false, timeout);
        failedGateways.add(gateway.url);
        console.warn(`Gateway ${gateway.name} failed for ${cid}:`, error);
      }
    }
    
    // If all gateways failed, cache the failures and return first available URL
    if (failedGateways.size > 0) {
      failureCache.set(cid, failedGateways);
    }
    
    // Fallback to first gateway URL (even if it might fail)
    const fallbackUrl = `${sortedGateways[0]?.url || DEFAULT_GATEWAYS[0].url}${cid}`;
    console.warn(`All gateways failed for ${cid}, using fallback: ${fallbackUrl}`);
    
    return fallbackUrl;
  };
  
  // Track in-flight request
  const promise = resolvePromise();
  inflightRequests.set(cacheKey, promise);
  
  // Clean up in-flight tracking when done
  promise.finally(() => {
    inflightRequests.delete(cacheKey);
  });
  
  return promise;
}

/**
 * Simple synchronous IPFS to HTTP conversion for non-critical paths
 * Uses the first available free gateway or falls back to paid
 */
export function ipfsToHttp(ipfsUri: string): string {
  if (!ipfsUri || !ipfsUri.includes('ipfs')) {
    return ipfsUri;
  }
  
  let cid: string;
  if (ipfsUri.startsWith('ipfs://')) {
    cid = ipfsUri.slice(7);
  } else if (ipfsUri.startsWith('ipfs/')) {
    cid = ipfsUri.slice(5);
  } else if (ipfsUri.includes('/ipfs/')) {
    cid = ipfsUri.split('/ipfs/')[1];
  } else {
    return ipfsUri;
  }
  
  // Clean CID by removing query parameters and fragments
  if (cid) {
    // Remove query parameters (everything after ?)
    const queryIndex = cid.indexOf('?');
    if (queryIndex !== -1) {
      cid = cid.substring(0, queryIndex);
    }
    
    // Remove URL fragments (everything after #)
    const fragmentIndex = cid.indexOf('#');
    if (fragmentIndex !== -1) {
      cid = cid.substring(0, fragmentIndex);
    }
    
    // Remove any trailing slashes
    cid = cid.replace(/\/+$/, '');
  }
  
  // Check cache first
  const cached = urlCache.get(`ipfs:${cid}`);
  if (cached) {
    return cached;
  }
  
  // Use first free gateway as default
  const gateways = getGatewayConfigFromEnv();
  const freeGateway = gateways.find(g => g.cost === 'free') || gateways[0];
  
  return `${freeGateway.url}${cid}`;
}

/**
 * Get gateway statistics for monitoring
 */
export function getGatewayStats() {
  const gateways = getGatewayConfigFromEnv();
  
  return gateways.map(gateway => {
    const health = gatewayHealth.get(gateway.url);
    const reliability = getGatewayReliabilityScore(gateway.url);
    
    return {
      ...gateway,
      health: health || { successCount: 0, failureCount: 0, lastSuccess: 0, avgResponseTime: 0 },
      reliabilityScore: reliability,
    };
  });
}

/**
 * Clear all caches (useful for debugging)
 */
export function clearGatewayCaches() {
  urlCache.clear();
  failureCache.clear();
  gatewayHealth.clear();
  inflightRequests.clear();
}

/**
 * Preload common IPFS content to warm up caches
 */
export async function preloadCommonContent(cids: string[]) {
  const promises = cids.map(cid => 
    resolveIpfsUrl(`ipfs://${cid}`, { preferCache: false })
      .catch(error => console.warn(`Failed to preload ${cid}:`, error))
  );
  
  await Promise.allSettled(promises);
}

export default {
  resolveIpfsUrl,
  ipfsToHttp,
  getGatewayStats,
  clearGatewayCaches,
  preloadCommonContent,
};
