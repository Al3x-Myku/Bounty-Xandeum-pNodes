'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    loading?: boolean;
    className?: string;
    accentColor?: 'purple' | 'teal' | 'blue' | 'orange';
}

export function StatsCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    loading = false,
    className,
    accentColor = 'purple',
}: StatsCardProps) {
    const accentColors = {
        purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
        teal: 'from-teal-500/20 to-teal-600/5 border-teal-500/30',
        blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
        orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/30',
    };

    const iconColors = {
        purple: 'text-purple-400 bg-purple-500/10',
        teal: 'text-teal-400 bg-teal-500/10',
        blue: 'text-blue-400 bg-blue-500/10',
        orange: 'text-orange-400 bg-orange-500/10',
    };

    const glowColors = {
        purple: 'shadow-purple-500/20',
        teal: 'shadow-teal-500/20',
        blue: 'shadow-blue-500/20',
        orange: 'shadow-orange-500/20',
    };

    if (loading) {
        return (
            <Card className={cn(
                'bg-gradient-to-br border backdrop-blur-sm',
                accentColors[accentColor],
                className
            )}>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                            <Skeleton className="h-4 w-24 bg-white/10" />
                            <Skeleton className="h-8 w-32 bg-white/10" />
                            <Skeleton className="h-3 w-20 bg-white/10" />
                        </div>
                        <Skeleton className="h-12 w-12 rounded-xl bg-white/10" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn(
            'bg-gradient-to-br border backdrop-blur-sm transition-all duration-300',
            'hover:shadow-lg hover:scale-[1.02] hover:border-opacity-50',
            accentColors[accentColor],
            glowColors[accentColor],
            className
        )}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <h3 className="text-2xl font-bold tracking-tight text-foreground">
                            {value}
                        </h3>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground">{subtitle}</p>
                        )}
                        {trend && (
                            <p className={cn(
                                'text-xs font-medium flex items-center gap-1',
                                trend.isPositive ? 'text-teal-400' : 'text-red-400'
                            )}>
                                <span>{trend.isPositive ? '↑' : '↓'}</span>
                                <span>{Math.abs(trend.value)}%</span>
                                <span className="text-muted-foreground">vs last epoch</span>
                            </p>
                        )}
                    </div>
                    <div className={cn(
                        'p-3 rounded-xl',
                        iconColors[accentColor]
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
