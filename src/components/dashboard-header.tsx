'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type NetworkCluster, NETWORK_CONFIGS } from '@/lib/types';
import {
    RefreshCw,
    ChevronDown,
    Check,
    Zap,
    Globe,
} from 'lucide-react';

interface DashboardHeaderProps {
    cluster: NetworkCluster;
    onClusterChange: (cluster: NetworkCluster) => void;
    onRefresh: () => void;
    isRefreshing?: boolean;
    lastUpdated?: Date;
}

export function DashboardHeader({
    cluster,
    onClusterChange,
    onRefresh,
    isRefreshing = false,
    lastUpdated,
}: DashboardHeaderProps) {
    const [showClusterMenu, setShowClusterMenu] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const clusters: NetworkCluster[] = ['mainnet', 'devnet', 'testnet'];

    const clusterColors = {
        mainnet: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
        devnet: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
        testnet: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    };

    return (
        <header className="border-b border-white/10 bg-black/40 backdrop-blur-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-teal-500 blur-xl opacity-30 animate-pulse" />
                            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-teal-300 bg-clip-text text-transparent">
                                Xandeum pNode Explorer
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Real-time analytics for the Xandeum storage network
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {mounted && lastUpdated && (
                            <span className="text-xs text-muted-foreground hidden sm:block">
                                Updated {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 hover:bg-white/5"
                            onClick={onRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={cn(
                                'h-4 w-4 mr-2',
                                isRefreshing && 'animate-spin'
                            )} />
                            Refresh
                        </Button>

                        <div className="relative">
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    'border gap-2',
                                    clusterColors[cluster]
                                )}
                                onClick={() => setShowClusterMenu(!showClusterMenu)}
                            >
                                <Globe className="h-4 w-4" />
                                <span className="capitalize">{NETWORK_CONFIGS[cluster].label}</span>
                                <ChevronDown className={cn(
                                    'h-4 w-4 transition-transform',
                                    showClusterMenu && 'rotate-180'
                                )} />
                            </Button>

                            {showClusterMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowClusterMenu(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0f] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                                        {clusters.map((c) => (
                                            <button
                                                key={c}
                                                className={cn(
                                                    'w-full px-4 py-2.5 text-left text-sm flex items-center justify-between',
                                                    'hover:bg-white/5 transition-colors',
                                                    c === cluster && 'bg-white/5'
                                                )}
                                                onClick={() => {
                                                    onClusterChange(c);
                                                    setShowClusterMenu(false);
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        'w-2 h-2 rounded-full',
                                                        c === 'mainnet' && 'bg-teal-500',
                                                        c === 'devnet' && 'bg-purple-500',
                                                        c === 'testnet' && 'bg-orange-500'
                                                    )} />
                                                    <span className="capitalize">{NETWORK_CONFIGS[c].label}</span>
                                                </div>
                                                {c === cluster && (
                                                    <Check className="h-4 w-4 text-teal-400" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export function DashboardFooter() {
    return (
        <footer className="border-t border-white/10 bg-black/40 backdrop-blur-lg mt-auto">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span>© 2024 Xandeum pNode Explorer</span>
                        <span className="hidden sm:inline">•</span>
                        <a
                            href="https://xandeum.network"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline hover:text-teal-400 transition-colors"
                        >
                            xandeum.network
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                        <span>Connected</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
