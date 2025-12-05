'use client';

import { useEffect, useState } from 'react';
import { type PNode } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, ChevronDown, ChevronUp } from 'lucide-react';

interface NetworkMapProps {
    nodes: PNode[];
    onNodeClick?: (node: PNode) => void;
}

const DynamicMap = ({ nodes, onNodeClick }: NetworkMapProps) => {
    const [MapComponents, setMapComponents] = useState<{
        MapContainer: any;
        TileLayer: any;
        CircleMarker: any;
        Popup: any;
        Tooltip: any;
    } | null>(null);

    useEffect(() => {
        import('react-leaflet').then((module) => {
            setMapComponents({
                MapContainer: module.MapContainer,
                TileLayer: module.TileLayer,
                CircleMarker: module.CircleMarker,
                Popup: module.Popup,
                Tooltip: module.Tooltip,
            });
        });

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, []);

    if (!MapComponents) {
        return (
            <div className="h-[300px] bg-black/40 rounded-lg flex items-center justify-center">
                <div className="text-muted-foreground">Loading map...</div>
            </div>
        );
    }

    const { MapContainer, TileLayer, CircleMarker, Tooltip } = MapComponents;

    const nodesWithLocation = nodes.filter((node) => node.location);

    const statusColors = {
        active: '#2dd4bf',
        degraded: '#eab308',
        inactive: '#ef4444',
    };

    return (
        <MapContainer
            center={[20, 0]}
            zoom={2}
            scrollWheelZoom={true}
            style={{ height: '300px', width: '100%', borderRadius: '0.5rem' }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {nodesWithLocation.map((node) => (
                <CircleMarker
                    key={node.pubkey}
                    center={[node.location!.lat, node.location!.lon]}
                    radius={8}
                    pathOptions={{
                        fillColor: statusColors[node.status],
                        fillOpacity: 0.7,
                        color: statusColors[node.status],
                        weight: 2,
                    }}
                    eventHandlers={{
                        click: () => onNodeClick?.(node),
                    }}
                >
                    <Tooltip>
                        <div className="text-xs">
                            <div className="font-mono">{node.pubkey.slice(0, 8)}...</div>
                            <div>{node.location?.city}, {node.location?.country}</div>
                            <div className="capitalize">{node.status}</div>
                        </div>
                    </Tooltip>
                </CircleMarker>
            ))}
        </MapContainer>
    );
};

export function NetworkMap({ nodes, onNodeClick }: NetworkMapProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const nodesWithLocation = nodes.filter((node) => node.location);

    const regionCounts = nodesWithLocation.reduce((acc, node) => {
        const region = node.location?.country || 'Unknown';
        acc[region] = (acc[region] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topRegions = Object.entries(regionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return (
        <Card className="bg-gradient-to-br from-purple-500/10 to-teal-500/5 border-purple-500/20">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Map className="h-5 w-5 text-teal-400" />
                        Global Node Distribution
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{nodesWithLocation.length} nodes mapped</span>
                    <span>•</span>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-teal-500" />
                            Active
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                            Degraded
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            Inactive
                        </div>
                    </div>
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent className="pt-2">
                    <DynamicMap nodes={nodes} onNodeClick={onNodeClick} />
                    <div className="mt-4 flex flex-wrap gap-2">
                        {topRegions.map(([region, count]) => (
                            <div
                                key={region}
                                className="px-3 py-1 bg-white/5 rounded-full text-xs text-muted-foreground"
                            >
                                {region}: <span className="text-foreground font-medium">{count}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
