import { useState, useEffect, useCallback } from 'react';
import { resolveIpfsUrl, ipfsToHttp, getGatewayStats } from '@/utils/ipfs-gateway';

/**
 * React hook for optimized IPFS URL resolution
 * 
 * This hook provides:
 * - Automatic gateway fallback
 * - Loading states
 * - Error handling
 * - Cost optimization options
 */

interface UseIpfsUrlOptions {
  /** Skip paid gateways to save costs */
  skipPaidGateways?: boolean;
  /** Timeout for gateway resolution */
  timeout?: number;
  /** Enable aggressive caching */
  useCache?: boolean;
  /** Auto-resolve on mount */
  autoResolve?: boolean;
}

interface UseIpfsUrlReturn {
  /** Resolved HTTP URL */
  resolvedUrl: string | null;
  /** Loading state */
  loading: boolean;
  /** Error message if resolution failed */
  error: string | null;
  /** Manually trigger resolution */
  resolve: (newUri?: string) => Promise<void>;
  /** Get gateway statistics */
  getStats: () => ReturnType<typeof getGatewayStats>;
}

export function useIpfsUrl(
  ipfsUri: string | null | undefined,
  options: UseIpfsUrlOptions = {}
): UseIpfsUrlReturn {
  const {
    skipPaidGateways = false,
    timeout,
    useCache = true,
    autoResolve = true,
  } = options;

  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = useCallback(async (newUri?: string) => {
    const uri = newUri || ipfsUri;
    
    if (!uri) {
      setResolvedUrl(null);
      setError(null);
      return;
    }

    // Quick check for non-IPFS URIs
    if (!uri.includes('ipfs')) {
      setResolvedUrl(uri);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let resolved: string;
      
      // Use simple conversion for basic cases if caching is disabled
      if (!useCache) {
        resolved = ipfsToHttp(uri);
      } else {
        // Use full resolution with gateway optimization
        resolved = await resolveIpfsUrl(uri, {
          skipPaidGateways,
          timeout,
          preferCache: useCache,
        });
      }

      setResolvedUrl(resolved);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resolve IPFS URL';
      setError(message);
      
      // Fallback to simple conversion
      try {
        const fallback = ipfsToHttp(uri);
        setResolvedUrl(fallback);
      } catch {
        setResolvedUrl(null);
      }
    } finally {
      setLoading(false);
    }
  }, [ipfsUri, skipPaidGateways, timeout, useCache]);

  const getStats = useCallback(() => {
    return getGatewayStats();
  }, []);

  // Auto-resolve on mount and when URI changes
  useEffect(() => {
    if (autoResolve) {
      resolve();
    }
  }, [resolve, autoResolve]);

  return {
    resolvedUrl,
    loading,
    error,
    resolve,
    getStats,
  };
}

/**
 * Hook for batch IPFS URL resolution
 * Useful for resolving multiple URLs efficiently
 */
export function useIpfsUrls(
  ipfsUris: (string | null | undefined)[],
  options: UseIpfsUrlOptions = {}
): {
  resolvedUrls: (string | null)[];
  loading: boolean;
  errors: (string | null)[];
  resolve: () => Promise<void>;
} {
  const [resolvedUrls, setResolvedUrls] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<(string | null)[]>([]);

  const resolve = useCallback(async () => {
    setLoading(true);
    
    const results = await Promise.allSettled(
      ipfsUris.map(async (uri) => {
        if (!uri || !uri.includes('ipfs')) {
          return uri || null;
        }

        try {
          if (!options.useCache) {
            return ipfsToHttp(uri);
          }
          
          return await resolveIpfsUrl(uri, {
            skipPaidGateways: options.skipPaidGateways,
            timeout: options.timeout,
            preferCache: options.useCache,
          });
        } catch {
          return ipfsToHttp(uri); // Fallback
        }
      })
    );

    const urls: (string | null)[] = [];
    const errs: (string | null)[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        urls.push(result.value);
        errs.push(null);
      } else {
        urls.push(null);
        errs.push(result.reason?.message || 'Resolution failed');
      }
    });

    setResolvedUrls(urls);
    setErrors(errs);
    setLoading(false);
  }, [ipfsUris, options]);

  useEffect(() => {
    if (options.autoResolve !== false) {
      resolve();
    }
  }, [resolve, options.autoResolve]);

  return {
    resolvedUrls,
    loading,
    errors,
    resolve,
  };
}

/**
 * Simple hook that provides a synchronous IPFS to HTTP converter
 * Use this for non-critical paths where loading states aren't needed
 */
export function useSimpleIpfsConverter() {
  return useCallback((uri: string | null | undefined): string => {
    if (!uri) return '';
    return ipfsToHttp(uri);
  }, []);
}

export default useIpfsUrl;
