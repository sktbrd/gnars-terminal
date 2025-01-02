import { useQuery } from '@tanstack/react-query';

async function fetchNNSName(address: string, clds?: string[]) {
    const response = await fetch('https://api.nns.xyz/resolve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            address,
            clds,
            fallback: true,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to resolve NNS name');
    }

    const { name } = await response.json();
    return name as string | null;
}

export function useNNSName(address?: string, clds?: string[]) {
    return useQuery({
        queryKey: ['nnsName', address, clds],
        queryFn: () => fetchNNSName(address || '', clds),
        enabled: !!address,
    });
}
