/**
 * Safety Status Indicator
 * Shows real-time safety monitoring status to admin/user
 */

import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SafetyIndicatorProps {
  riskLevel: 'safe' | 'monitor' | 'intervene' | 'emergency';
  className?: string;
  showLabel?: boolean;
}

export function SafetyIndicator({
  riskLevel,
  className,
  showLabel = false,
}: SafetyIndicatorProps) {
  const config = {
    safe: {
      icon: ShieldCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Safe',
    },
    monitor: {
      icon: Shield,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      label: 'Monitoring',
    },
    intervene: {
      icon: ShieldAlert,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      label: 'Intervention',
    },
    emergency: {
      icon: ShieldAlert,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Emergency',
    },
  };

  const current = config[riskLevel];
  const Icon = current.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        current.bgColor,
        className
      )}
    >
      <Icon className={cn('w-4 h-4', current.color)} />
      {showLabel && (
        <span className={cn('text-sm font-medium', current.color)}>
          {current.label}
        </span>
      )}
    </div>
  );
}
