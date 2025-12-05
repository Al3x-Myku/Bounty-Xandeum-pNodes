'use client';

import { useState } from 'react';
import { usePNodes } from '@/hooks/usePNodes';
import { StatsCard } from '@/components/stats-card';
import { NodeTable } from '@/components/node-table';
import { NodeDetailModal } from '@/components/node-detail-modal';
import { NetworkMap } from '@/components/network-map';
import { DashboardHeader, DashboardFooter } from '@/components/dashboard-header';
import { formatBytes } from '@/lib/xandeumRpc';
import { type NetworkCluster, type PNode } from '@/lib/types';
import {
    Server,
    HardDrive,
    Activity,
    TrendingUp,
    AlertTriangle,
} from 'lucide-react';

export function Dashboard() {
    const [cluster, setCluster] = useState<NetworkCluster>('devnet');
    const [selectedNode, setSelectedNode] = useState<PNode | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const { data, isLoading, isError, error, refetch, isFetching } = usePNodes(cluster);

    const handleRefresh = async () => {
        await refetch();
        setLastUpdated(new Date());
    };

    const handleClusterChange = (newCluster: NetworkCluster) => {
        setCluster(newCluster);
        setLastUpdated(new Date());
    };

    const stats = data?.stats;
    const nodes = data?.nodes || [];

    return (
        <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/5 rounded-full blur-3xl" />
            </div>

            <DashboardHeader
                cluster={cluster}
                onClusterChange={handleClusterChange}
                onRefresh={handleRefresh}
                isRefreshing={isFetching}
                lastUpdated={lastUpdated}
            />

            <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
                {isError && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-red-400 font-medium">Failed to fetch pNode data</p>
                            <p className="text-xs text-red-400/70">{(error as Error)?.message || 'Unknown error'}</p>
                        </div>
                    </div>
                )}

                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-teal-400" />
                        Network Overview
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard
                            title="Total pNodes"
                            value={stats?.totalNodes.toLocaleString() || '—'}
                            subtitle={`${stats?.activeNodes || 0} active`}
                            icon={Server}
                            accentColor="purple"
                            loading={isLoading}
                            trend={stats ? { value: 5.2, isPositive: true } : undefined}
                        />
                        <StatsCard
                            title="Active Nodes"
                            value={stats?.activeNodes.toLocaleString() || '—'}
                            subtitle={`${((stats?.activeNodes || 0) / (stats?.totalNodes || 1) * 100).toFixed(1)}% of total`}
                            icon={Activity}
                            accentColor="teal"
                            loading={isLoading}
                        />
                        <StatsCard
                            title="Total Storage"
                            value={stats ? formatBytes(stats.totalStorageCapacity) : '—'}
                            subtitle={stats ? `${formatBytes(stats.totalStorageUsed)} used` : undefined}
                            icon={HardDrive}
                            accentColor="purple"
                            loading={isLoading}
                        />
                        <StatsCard
                            title="Avg. Uptime"
                            value={stats ? `${stats.averageUptime.toFixed(1)}%` : '—'}
                            subtitle={stats ? `${(stats.averagePerformanceScore * 100).toFixed(0)}% avg score` : undefined}
                            icon={TrendingUp}
                            accentColor="teal"
                            loading={isLoading}
                        />
                    </div>
                </section>

                {!isLoading && nodes.length > 0 && (
                    <section className="mb-8">
                        <NetworkMap nodes={nodes} onNodeClick={setSelectedNode} />
                    </section>
                )}

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Server className="h-5 w-5 text-purple-400" />
                            pNode Directory
                        </h2>
                        <span className="text-sm text-muted-foreground">
                            {nodes.length} nodes
                        </span>
                    </div>
                    <NodeTable
                        nodes={nodes}
                        loading={isLoading}
                        onRowClick={setSelectedNode}
                    />
                </section>

                {stats && !isLoading && (
                    <section className="mt-6">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-teal-500" />
                                <span>{stats.activeNodes} Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span>{stats.degradedNodes} Degraded</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500" />
                                <span>{stats.inactiveNodes} Inactive</span>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <DashboardFooter />

            <NodeDetailModal
                node={selectedNode}
                open={!!selectedNode}
                onClose={() => setSelectedNode(null)}
            />
        </div>
    );
}
