'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getXandeumClient } from '@/lib/xandeumRpc';
import type { NetworkCluster, PNode, GetClusterNodesResponse } from '@/lib/types';

export const queryKeys = {
    pNodes: (cluster: NetworkCluster) => ['pNodes', cluster] as const,
    pNodeDetails: (cluster: NetworkCluster, pubkey: string) => ['pNode', cluster, pubkey] as const,
};

export function usePNodes(cluster: NetworkCluster = 'devnet') {
    return useQuery<GetClusterNodesResponse>({
        queryKey: queryKeys.pNodes(cluster),
        queryFn: async () => {
            const client = getXandeumClient(cluster);
            return client.getClusterNodes();
        },
        refetchInterval: 30000,
        staleTime: 10000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

export function usePNodeDetails(cluster: NetworkCluster, pubkey: string | null) {
    return useQuery<PNode | null>({
        queryKey: queryKeys.pNodeDetails(cluster, pubkey || ''),
        queryFn: async () => {
            if (!pubkey) return null;
            const client = getXandeumClient(cluster);
            return client.getPNodeInfo(pubkey);
        },
        enabled: !!pubkey,
        staleTime: 5000,
    });
}

export function useRefreshPNodes() {
    const queryClient = useQueryClient();

    return (cluster: NetworkCluster) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.pNodes(cluster) });
    };
}
