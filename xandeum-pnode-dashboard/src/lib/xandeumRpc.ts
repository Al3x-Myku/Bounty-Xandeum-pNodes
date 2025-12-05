import {
    type PNode,
    type ClusterStats,
    type GetClusterNodesResponse,
    type RpcResponse,
    type NetworkCluster,
    NETWORK_CONFIGS,
    type NodeStatus,
} from './types';

async function rpcRequest<T>(
    endpoint: string,
    method: string,
    params: unknown[] = []
): Promise<T> {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method,
            params,
        }),
    });

    if (!response.ok) {
        throw new Error(`RPC request failed: ${response.status} ${response.statusText}`);
    }

    const data: RpcResponse<T> = await response.json();

    if (data.error) {
        throw new Error(`RPC error: ${data.error.message} (code: ${data.error.code})`);
    }

    if (data.result === undefined) {
        throw new Error('RPC response missing result');
    }

    return data.result;
}

function transformClusterNode(node: Record<string, unknown>, index: number): PNode {
    const mockStorageCapacity = Math.floor(Math.random() * 10 * 1024 * 1024 * 1024 * 1024);
    const mockStorageUsed = Math.floor(Math.random() * mockStorageCapacity);
    const mockUptime = 85 + Math.random() * 15;
    const mockPerformanceScore = 0.7 + Math.random() * 0.3;

    let status: NodeStatus = 'active';
    if (!node.version) {
        status = 'inactive';
    } else if (mockUptime < 90) {
        status = 'degraded';
    }

    const locations = [
        { lat: 37.7749, lon: -122.4194, city: 'San Francisco', country: 'United States', countryCode: 'US' },
        { lat: 40.7128, lon: -74.0060, city: 'New York', country: 'United States', countryCode: 'US' },
        { lat: 51.5074, lon: -0.1278, city: 'London', country: 'United Kingdom', countryCode: 'GB' },
        { lat: 52.5200, lon: 13.4050, city: 'Berlin', country: 'Germany', countryCode: 'DE' },
        { lat: 35.6762, lon: 139.6503, city: 'Tokyo', country: 'Japan', countryCode: 'JP' },
        { lat: 1.3521, lon: 103.8198, city: 'Singapore', country: 'Singapore', countryCode: 'SG' },
        { lat: -33.8688, lon: 151.2093, city: 'Sydney', country: 'Australia', countryCode: 'AU' },
        { lat: 48.8566, lon: 2.3522, city: 'Paris', country: 'France', countryCode: 'FR' },
        { lat: 55.7558, lon: 37.6173, city: 'Moscow', country: 'Russia', countryCode: 'RU' },
        { lat: -23.5505, lon: -46.6333, city: 'São Paulo', country: 'Brazil', countryCode: 'BR' },
    ];

    return {
        pubkey: node.pubkey as string,
        gossip: (node.gossip as string) || null,
        tpu: (node.tpu as string) || null,
        tpuQuic: (node.tpuQuic as string) || null,
        rpc: (node.rpc as string) || null,
        pubsub: (node.pubsub as string) || null,
        version: (node.version as string) || null,
        featureSet: (node.featureSet as number) || null,
        shredVersion: (node.shredVersion as number) || 0,
        storageCapacity: mockStorageCapacity,
        storageUsed: mockStorageUsed,
        storageAvailable: mockStorageCapacity - mockStorageUsed,
        uptime: mockUptime,
        performanceScore: mockPerformanceScore,
        responseTime: Math.floor(50 + Math.random() * 150),
        status,
        lastSeen: Date.now() - Math.floor(Math.random() * 3600000),
        firstSeen: Date.now() - Math.floor(Math.random() * 30 * 24 * 3600000),
        location: locations[index % locations.length],
        stakedXand: Math.floor(Math.random() * 100000),
        delegatedStake: Math.floor(Math.random() * 50000),
        commission: Math.floor(Math.random() * 10),
    };
}

function calculateStats(nodes: PNode[]): ClusterStats {
    const activeNodes = nodes.filter(n => n.status === 'active').length;
    const inactiveNodes = nodes.filter(n => n.status === 'inactive').length;
    const degradedNodes = nodes.filter(n => n.status === 'degraded').length;

    const totalStorageCapacity = nodes.reduce((sum, n) => sum + (n.storageCapacity || 0), 0);
    const totalStorageUsed = nodes.reduce((sum, n) => sum + (n.storageUsed || 0), 0);

    const uptimes = nodes.filter(n => n.uptime !== undefined).map(n => n.uptime!);
    const averageUptime = uptimes.length > 0
        ? uptimes.reduce((sum, u) => sum + u, 0) / uptimes.length
        : 0;

    const scores = nodes.filter(n => n.performanceScore !== undefined).map(n => n.performanceScore!);
    const averagePerformanceScore = scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : 0;

    return {
        totalNodes: nodes.length,
        activeNodes,
        inactiveNodes,
        degradedNodes,
        totalStorageCapacity,
        totalStorageUsed,
        averageUptime,
        averagePerformanceScore,
    };
}

export class XandeumRpcClient {
    private endpoint: string;
    private cluster: NetworkCluster;

    constructor(cluster: NetworkCluster = 'devnet') {
        this.cluster = cluster;
        this.endpoint = NETWORK_CONFIGS[cluster].rpcEndpoint;
    }

    getEndpoint(): string {
        return this.endpoint;
    }

    getCluster(): NetworkCluster {
        return this.cluster;
    }

    switchCluster(cluster: NetworkCluster): void {
        this.cluster = cluster;
        this.endpoint = NETWORK_CONFIGS[cluster].rpcEndpoint;
    }

    async getClusterNodes(): Promise<GetClusterNodesResponse> {
        try {
            const rawNodes = await rpcRequest<Record<string, unknown>[]>(
                this.endpoint,
                'getClusterNodes'
            );
            const nodes = rawNodes.map((node, index) => transformClusterNode(node, index));
            const stats = calculateStats(nodes);
            return { nodes, stats };
        } catch (error) {
            console.warn('RPC call failed, using mock data:', error);
            return this.getMockData();
        }
    }

    async getPNodeInfo(pubkey: string): Promise<PNode | null> {
        const { nodes } = await this.getClusterNodes();
        return nodes.find(n => n.pubkey === pubkey) || null;
    }

    private getMockData(): GetClusterNodesResponse {
        const mockNodes: PNode[] = Array.from({ length: 25 }, (_, i) => {
            const mockStorageCapacity = Math.floor((1 + Math.random() * 9) * 1024 * 1024 * 1024 * 1024);
            const mockStorageUsed = Math.floor(Math.random() * mockStorageCapacity);
            const mockUptime = 85 + Math.random() * 15;

            const statuses: NodeStatus[] = ['active', 'active', 'active', 'active', 'degraded', 'inactive'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            const locations = [
                { lat: 37.7749, lon: -122.4194, city: 'San Francisco', country: 'United States', countryCode: 'US' },
                { lat: 40.7128, lon: -74.0060, city: 'New York', country: 'United States', countryCode: 'US' },
                { lat: 51.5074, lon: -0.1278, city: 'London', country: 'United Kingdom', countryCode: 'GB' },
                { lat: 52.5200, lon: 13.4050, city: 'Berlin', country: 'Germany', countryCode: 'DE' },
                { lat: 35.6762, lon: 139.6503, city: 'Tokyo', country: 'Japan', countryCode: 'JP' },
                { lat: 1.3521, lon: 103.8198, city: 'Singapore', country: 'Singapore', countryCode: 'SG' },
                { lat: -33.8688, lon: 151.2093, city: 'Sydney', country: 'Australia', countryCode: 'AU' },
                { lat: 48.8566, lon: 2.3522, city: 'Paris', country: 'France', countryCode: 'FR' },
            ];

            const versions = ['0.6.0', '0.6.0', '0.6.0', '0.5.9', '0.5.8'];

            return {
                pubkey: `${Array.from({ length: 8 }, () =>
                    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[
                    Math.floor(Math.random() * 58)
                    ]
                ).join('')}...${Array.from({ length: 4 }, () =>
                    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[
                    Math.floor(Math.random() * 58)
                    ]
                ).join('')}`,
                gossip: `${10 + Math.floor(Math.random() * 240)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}:8001`,
                tpu: `${10 + Math.floor(Math.random() * 240)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}:8004`,
                tpuQuic: null,
                rpc: `${10 + Math.floor(Math.random() * 240)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}:8899`,
                pubsub: null,
                version: versions[Math.floor(Math.random() * versions.length)],
                featureSet: 4215500110,
                shredVersion: 50093,
                storageCapacity: mockStorageCapacity,
                storageUsed: mockStorageUsed,
                storageAvailable: mockStorageCapacity - mockStorageUsed,
                uptime: mockUptime,
                performanceScore: 0.7 + Math.random() * 0.3,
                responseTime: Math.floor(50 + Math.random() * 150),
                status,
                lastSeen: Date.now() - Math.floor(Math.random() * 3600000),
                firstSeen: Date.now() - Math.floor(Math.random() * 30 * 24 * 3600000),
                location: locations[i % locations.length],
                stakedXand: Math.floor(Math.random() * 100000),
                delegatedStake: Math.floor(Math.random() * 50000),
                commission: Math.floor(Math.random() * 10),
            };
        });

        return {
            nodes: mockNodes,
            stats: calculateStats(mockNodes),
        };
    }
}

let clientInstance: XandeumRpcClient | null = null;

export function getXandeumClient(cluster: NetworkCluster = 'devnet'): XandeumRpcClient {
    if (!clientInstance || clientInstance.getCluster() !== cluster) {
        clientInstance = new XandeumRpcClient(cluster);
    }
    return clientInstance;
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatUptime(uptime: number): string {
    return `${uptime.toFixed(1)}%`;
}

export function formatTimestamp(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
}

export function shortenPubkey(pubkey: string, chars: number = 4): string {
    if (pubkey.length <= chars * 2 + 3) return pubkey;
    return `${pubkey.slice(0, chars)}...${pubkey.slice(-chars)}`;
}
