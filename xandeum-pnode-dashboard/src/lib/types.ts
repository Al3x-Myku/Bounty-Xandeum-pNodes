export type NodeStatus = 'active' | 'inactive' | 'degraded';

export interface NodeLocation {
    lat: number;
    lon: number;
    city?: string;
    country?: string;
    countryCode?: string;
}

export interface PNode {
    pubkey: string;
    gossip: string | null;
    tpu: string | null;
    tpuQuic: string | null;
    rpc: string | null;
    pubsub: string | null;
    version: string | null;
    featureSet: number | null;
    shredVersion: number;
    storageCapacity?: number;
    storageUsed?: number;
    storageAvailable?: number;
    uptime?: number;
    performanceScore?: number;
    responseTime?: number;
    status: NodeStatus;
    lastSeen?: number;
    firstSeen?: number;
    location?: NodeLocation;
    stakedXand?: number;
    delegatedStake?: number;
    commission?: number;
}

export interface ClusterStats {
    totalNodes: number;
    activeNodes: number;
    inactiveNodes: number;
    degradedNodes: number;
    totalStorageCapacity: number;
    totalStorageUsed: number;
    averageUptime: number;
    averagePerformanceScore: number;
}

export interface RpcResponse<T> {
    jsonrpc: '2.0';
    id: number | string;
    result?: T;
    error?: RpcError;
}

export interface RpcError {
    code: number;
    message: string;
    data?: unknown;
}

export interface GetClusterNodesResponse {
    nodes: PNode[];
    stats: ClusterStats;
}

export type SortField = 'pubkey' | 'version' | 'uptime' | 'status' | 'storageCapacity' | 'lastSeen';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

export type NetworkCluster = 'mainnet' | 'devnet' | 'testnet';

export interface NetworkConfig {
    name: NetworkCluster;
    rpcEndpoint: string;
    wsEndpoint?: string;
    label: string;
}

export const NETWORK_CONFIGS: Record<NetworkCluster, NetworkConfig> = {
    mainnet: {
        name: 'mainnet',
        rpcEndpoint: 'https://rpc.xandeum.network',
        label: 'Mainnet',
    },
    devnet: {
        name: 'devnet',
        rpcEndpoint: 'https://api.devnet.xandeum.com:8899',
        label: 'Devnet',
    },
    testnet: {
        name: 'testnet',
        rpcEndpoint: 'https://api.testnet.xandeum.com:8899',
        label: 'Testnet',
    },
};
