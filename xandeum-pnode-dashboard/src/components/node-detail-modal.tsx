'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type PNode } from '@/lib/types';
import { formatBytes, formatUptime, formatTimestamp, shortenPubkey } from '@/lib/xandeumRpc';
import {
    Copy,
    Check,
    Server,
    HardDrive,
    Clock,
    MapPin,
    Coins,
    Activity,
} from 'lucide-react';
import { useState } from 'react';

interface NodeDetailModalProps {
    node: PNode | null;
    open: boolean;
    onClose: () => void;
}

const statusColors = {
    active: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    inactive: 'bg-red-500/20 text-red-400 border-red-500/30',
    degraded: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export function NodeDetailModal({ node, open, onClose }: NodeDetailModalProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [showRawJson, setShowRawJson] = useState(false);

    if (!node) return null;

    const handleCopy = async (value: string, field: string) => {
        await navigator.clipboard.writeText(value);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const CopyButton = ({ value, field }: { value: string; field: string }) => (
        <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-white/10"
            onClick={() => handleCopy(value, field)}
        >
            {copiedField === field ? (
                <Check className="h-3 w-3 text-teal-400" />
            ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
            )}
        </Button>
    );

    const DetailRow = ({
        label,
        value,
        copyable = false,
        mono = false,
    }: {
        label: string;
        value: string | React.ReactNode;
        copyable?: boolean;
        mono?: boolean;
    }) => (
        <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <span className={cn('text-sm text-foreground', mono && 'font-mono')}>
                    {value}
                </span>
                {copyable && typeof value === 'string' && (
                    <CopyButton value={value} field={label} />
                )}
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#0a0a0f] to-[#12121a] border-purple-500/20">
                <DialogHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <DialogTitle className="flex items-center gap-3 text-xl">
                                <Server className="h-5 w-5 text-purple-400" />
                                pNode Details
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-2">
                                <code className="text-sm font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
                                    {shortenPubkey(node.pubkey, 8)}
                                </code>
                                <CopyButton value={node.pubkey} field="pubkey-header" />
                            </DialogDescription>
                        </div>
                        <Badge
                            variant="outline"
                            className={cn(
                                'capitalize font-medium border',
                                statusColors[node.status]
                            )}
                        >
                            {node.status}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                            <Activity className="h-4 w-4" />
                            Network Information
                        </h4>
                        <div className="bg-black/40 rounded-lg p-4 space-y-0.5">
                            <DetailRow label="Pubkey" value={shortenPubkey(node.pubkey, 12)} copyable mono />
                            <DetailRow label="Gossip" value={node.gossip || 'N/A'} copyable mono />
                            <DetailRow label="RPC" value={node.rpc || 'N/A'} copyable mono />
                            <DetailRow label="TPU" value={node.tpu || 'N/A'} copyable mono />
                            <DetailRow label="Version" value={node.version || 'Unknown'} mono />
                            <DetailRow label="Shred Version" value={String(node.shredVersion)} mono />
                            <DetailRow label="Feature Set" value={node.featureSet ? String(node.featureSet) : 'N/A'} mono />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                            <HardDrive className="h-4 w-4" />
                            Storage
                        </h4>
                        <div className="bg-black/40 rounded-lg p-4">
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Usage</span>
                                    <span>
                                        <span className="text-foreground">{formatBytes(node.storageUsed || 0)}</span>
                                        <span className="text-muted-foreground"> / {formatBytes(node.storageCapacity || 0)}</span>
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-teal-400 rounded-full transition-all"
                                        style={{
                                            width: `${((node.storageUsed || 0) / (node.storageCapacity || 1)) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <DetailRow label="Available" value={formatBytes(node.storageAvailable || 0)} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                            <Clock className="h-4 w-4" />
                            Performance
                        </h4>
                        <div className="bg-black/40 rounded-lg p-4 space-y-0.5">
                            <DetailRow
                                label="Uptime"
                                value={
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full',
                                                    (node.uptime || 0) >= 98 ? 'bg-teal-500' :
                                                        (node.uptime || 0) >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                                                )}
                                                style={{ width: `${node.uptime || 0}%` }}
                                            />
                                        </div>
                                        {formatUptime(node.uptime || 0)}
                                    </div>
                                }
                            />
                            <DetailRow
                                label="Performance Score"
                                value={node.performanceScore ? `${(node.performanceScore * 100).toFixed(1)}%` : 'N/A'}
                            />
                            <DetailRow
                                label="Response Time"
                                value={node.responseTime ? `${node.responseTime}ms` : 'N/A'}
                            />
                            <DetailRow
                                label="Last Seen"
                                value={formatTimestamp(node.lastSeen || Date.now())}
                            />
                            <DetailRow
                                label="First Seen"
                                value={formatTimestamp(node.firstSeen || Date.now())}
                            />
                        </div>
                    </div>

                    {node.location && (
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                                <MapPin className="h-4 w-4" />
                                Location
                            </h4>
                            <div className="bg-black/40 rounded-lg p-4 space-y-0.5">
                                <DetailRow label="City" value={node.location.city || 'Unknown'} />
                                <DetailRow label="Country" value={node.location.country || 'Unknown'} />
                                <DetailRow
                                    label="Coordinates"
                                    value={`${node.location.lat.toFixed(4)}, ${node.location.lon.toFixed(4)}`}
                                    mono
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                            <Coins className="h-4 w-4" />
                            Staking
                        </h4>
                        <div className="bg-black/40 rounded-lg p-4 space-y-0.5">
                            <DetailRow
                                label="Staked XAND"
                                value={node.stakedXand ? `${node.stakedXand.toLocaleString()} XAND` : 'N/A'}
                            />
                            <DetailRow
                                label="Delegated Stake"
                                value={node.delegatedStake ? `${node.delegatedStake.toLocaleString()} XAND` : 'N/A'}
                            />
                            <DetailRow
                                label="Commission"
                                value={node.commission !== undefined ? `${node.commission}%` : 'N/A'}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-white/10 hover:bg-white/5"
                            onClick={() => setShowRawJson(!showRawJson)}
                        >
                            {showRawJson ? 'Hide' : 'Show'} Raw JSON
                        </Button>
                        {showRawJson && (
                            <div className="relative">
                                <pre className="bg-black/60 rounded-lg p-4 text-xs font-mono text-muted-foreground overflow-x-auto max-h-64">
                                    {JSON.stringify(node, null, 2)}
                                </pre>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-white/10"
                                    onClick={() => handleCopy(JSON.stringify(node, null, 2), 'json')}
                                >
                                    {copiedField === 'json' ? (
                                        <Check className="h-3 w-3 text-teal-400" />
                                    ) : (
                                        <Copy className="h-3 w-3 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
