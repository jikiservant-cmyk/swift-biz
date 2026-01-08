'use client';

import { AlertCircle, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

type AIAlertsProps = {
  alerts: string[];
  isLoading: boolean;
};

export function AIAlerts({ alerts, isLoading }: AIAlertsProps) {
  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Alert className="bg-accent/10 border-accent/50 text-accent-foreground dark:bg-accent/20">
      <AlertCircle className="h-4 w-4 !text-accent" />
      <AlertTitle className="text-accent font-bold flex items-center gap-2">
        <Zap className="h-4 w-4" /> AI Powered Alerts
      </AlertTitle>
      <AlertDescription className="text-foreground">
        <ul className="list-disc pl-5 mt-2 space-y-1">
          {alerts.map((alert, index) => (
            <li key={index}>{alert}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
