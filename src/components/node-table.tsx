'use client';

import { useState, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type PNode, type SortConfig, type SortField } from '@/lib/types';
import { formatBytes, formatUptime, formatTimestamp, shortenPubkey } from '@/lib/xandeumRpc';
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Copy,
    MapPin,
    Check,
} from 'lucide-react';

interface NodeTableProps {
    nodes: PNode[];
    loading?: boolean;
    onRowClick?: (node: PNode) => void;
}

const statusColors = {
    active: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    inactive: 'bg-red-500/20 text-red-400 border-red-500/30',
    degraded: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const statusDots = {
    active: 'bg-teal-500',
    inactive: 'bg-red-500',
    degraded: 'bg-yellow-500',
};

export function NodeTable({ nodes, loading = false, onRowClick }: NodeTableProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: 'status',
        direction: 'asc',
    });
    const [copiedPubkey, setCopiedPubkey] = useState<string | null>(null);

    const handleSort = (field: SortField) => {
        setSortConfig((current) => ({
            field,
            direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const sortedNodes = useMemo(() => {
        const sorted = [...nodes].sort((a, b) => {
            const { field, direction } = sortConfig;
            let comparison = 0;

            switch (field) {
                case 'pubkey':
                    comparison = a.pubkey.localeCompare(b.pubkey);
                    break;
                case 'version':
                    comparison = (a.version || '').localeCompare(b.version || '');
                    break;
                case 'uptime':
                    comparison = (a.uptime || 0) - (b.uptime || 0);
                    break;
                case 'status':
                    const statusOrder = { active: 0, degraded: 1, inactive: 2 };
                    comparison = statusOrder[a.status] - statusOrder[b.status];
                    break;
                case 'storageCapacity':
                    comparison = (a.storageCapacity || 0) - (b.storageCapacity || 0);
                    break;
                case 'lastSeen':
                    comparison = (a.lastSeen || 0) - (b.lastSeen || 0);
                    break;
            }

            return direction === 'asc' ? comparison : -comparison;
        });

        return sorted;
    }, [nodes, sortConfig]);

    const handleCopyPubkey = async (pubkey: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(pubkey);
        setCopiedPubkey(pubkey);
        setTimeout(() => setCopiedPubkey(null), 2000);
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortConfig.field !== field) {
            return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
        }
        return sortConfig.direction === 'asc' ? (
            <ArrowUp className="h-4 w-4 text-teal-400" />
        ) : (
            <ArrowDown className="h-4 w-4 text-teal-400" />
        );
    };

    if (loading) {
        return (
            <div className="rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-muted-foreground font-medium">Node</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Version</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Uptime</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Storage</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Location</TableHead>
                            <TableHead className="text-muted-foreground font-medium">Last Seen</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <TableRow key={i} className="border-white/5">
                                <TableCell><Skeleton className="h-4 w-32 bg-white/5" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16 bg-white/5" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 bg-white/5 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16 bg-white/5" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20 bg-white/5" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24 bg-white/5" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16 bg-white/5" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (nodes.length === 0) {
        return (
            <div className="rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm p-12 text-center">
                <p className="text-muted-foreground">No pNodes found</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-muted-foreground hover:text-foreground font-medium"
                                onClick={() => handleSort('pubkey')}
                            >
                                Node <SortIcon field="pubkey" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-muted-foreground hover:text-foreground font-medium"
                                onClick={() => handleSort('version')}
                            >
                                Version <SortIcon field="version" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-muted-foreground hover:text-foreground font-medium"
                                onClick={() => handleSort('status')}
                            >
                                Status <SortIcon field="status" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-muted-foreground hover:text-foreground font-medium"
                                onClick={() => handleSort('uptime')}
                            >
                                Uptime <SortIcon field="uptime" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-muted-foreground hover:text-foreground font-medium"
                                onClick={() => handleSort('storageCapacity')}
                            >
                                Storage <SortIcon field="storageCapacity" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-medium">
                            Location
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-muted-foreground hover:text-foreground font-medium"
                                onClick={() => handleSort('lastSeen')}
                            >
                                Last Seen <SortIcon field="lastSeen" />
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedNodes.map((node) => (
                        <TableRow
                            key={node.pubkey}
                            className={cn(
                                'border-white/5 cursor-pointer transition-colors',
                                'hover:bg-purple-500/5'
                            )}
                            onClick={() => onRowClick?.(node)}
                        >
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <code className="text-sm font-mono text-purple-300">
                                        {shortenPubkey(node.pubkey, 6)}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-white/10"
                                        onClick={(e) => handleCopyPubkey(node.pubkey, e)}
                                    >
                                        {copiedPubkey === node.pubkey ? (
                                            <Check className="h-3 w-3 text-teal-400" />
                                        ) : (
                                            <Copy className="h-3 w-3 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm font-mono text-muted-foreground">
                                    {node.version || 'unknown'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'capitalize font-medium border',
                                        statusColors[node.status]
                                    )}
                                >
                                    <span className={cn(
                                        'w-2 h-2 rounded-full mr-2 animate-pulse',
                                        statusDots[node.status]
                                    )} />
                                    {node.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all',
                                                (node.uptime || 0) >= 98 ? 'bg-teal-500' :
                                                    (node.uptime || 0) >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                                            )}
                                            style={{ width: `${node.uptime || 0}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {formatUptime(node.uptime || 0)}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm">
                                    <span className="text-foreground">{formatBytes(node.storageUsed || 0)}</span>
                                    <span className="text-muted-foreground"> / {formatBytes(node.storageCapacity || 0)}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {node.location ? (
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span>{node.location.city}</span>
                                        <span className="text-xs opacity-60">{node.location.countryCode}</span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-muted-foreground">Unknown</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-muted-foreground">
                                    {formatTimestamp(node.lastSeen || Date.now())}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
