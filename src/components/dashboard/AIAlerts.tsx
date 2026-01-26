'use client';

import { AlertCircle, CheckCircle, Wand2, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '../ui/button';

type AIAlertsProps = {
  alerts: string[] | null;
  isLoading: boolean;
  fetchAlerts: () => void;
};

export function AIAlerts({ alerts, isLoading, fetchAlerts }: AIAlertsProps) {
  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (alerts === null) {
    return (
      <Alert className="bg-secondary/50">
        <Wand2 className="h-4 w-4" />
        <AlertTitle className="font-bold">AI-Powered Insights</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <p>Click the button to check for important alerts about your business.</p>
          <Button onClick={fetchAlerts} size="sm" disabled={isLoading}>
            <Zap className="mr-2 h-4 w-4" />
            Generate Alerts
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (alerts.length === 0) {
    return (
      <Alert className="bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200">
        <CheckCircle className="h-4 w-4 !text-green-500" />
        <AlertTitle className="font-bold flex items-center gap-2">
          All Clear!
        </AlertTitle>
        <AlertDescription>
          The AI analysis didn't find any critical issues requiring your immediate attention.
        </AlertDescription>
      </Alert>
    );
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
