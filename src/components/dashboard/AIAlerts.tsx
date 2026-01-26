
'use client';

import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle, Wand2, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '../ui/button';
import { generateAlerts } from '@/ai/flows/ai-powered-alerts';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { Task, Transaction } from '@/lib/types';
import { getThisMonthTransactions, getOverdueTasks } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';

export function AIAlerts() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [alerts, setAlerts] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const incomeQuery = useMemoFirebase(
        () => (user ? collection(firestore, 'users', user.uid, 'incomes') : null),
        [firestore, user]
    );
    const { data: incomeTxs, isLoading: isLoadingIncome } = useCollection<Omit<Transaction, 'date'> & { date: Timestamp }>(incomeQuery);

    const expenseQuery = useMemoFirebase(
        () => (user ? collection(firestore, 'users', user.uid, 'expenses') : null),
        [firestore, user]
    );
    const { data: expenseTxs, isLoading: isLoadingExpenses } = useCollection<Omit<Transaction, 'date'> & { date: Timestamp }>(expenseQuery);

    const transactionsWithDates = useMemo(() => {
        const allTxs = [
        ...(incomeTxs || []).map(t => ({...t, type: 'income' as const})),
        ...(expenseTxs || []).map(t => ({...t, type: 'expense' as const}))
        ];
        return allTxs.map(t => ({...t, date: t.date.toDate()})).sort((a,b) => b.date.getTime() - a.date.getTime());
    }, [incomeTxs, expenseTxs]);

    const tasksQuery = useMemoFirebase(
        () => (user ? collection(firestore, 'users', user.uid, 'tasks') : null),
        [firestore, user]
    );
    const { data: tasks, isLoading: isLoadingTasks } = useCollection<Omit<Task, 'dueDate'> & { dueDate: Timestamp }>(tasksQuery);
    const tasksWithDates = useMemo(() => tasks?.map(t => ({...t, dueDate: t.dueDate.toDate()})) || [], [tasks]);


    const fetchAlerts = async () => {
        setIsLoading(true);

        const monthlyTransactions = getThisMonthTransactions(transactionsWithDates);
        const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const totalBalance = transactionsWithDates.reduce((balance, t) => balance + (t.type === 'income' ? t.amount : -t.amount), 0);
        const overdueTasks = getOverdueTasks(tasksWithDates);

        try {
        const alertsData = await generateAlerts({
            cashBalance: totalBalance,
            overdueTasksCount: overdueTasks.length,
            totalTasksCount: tasksWithDates.length,
            unpaidInvoices: 0, // This can be updated to use real data later
            monthlyIncome: monthlyIncome,
            monthlyExpenses: monthlyExpenses,
        });
        if (alertsData.alerts) {
            setAlerts(alertsData.alerts);
        }
        } catch (error) {
          setAlerts(null); // Set back to null to allow retrying
          toast({
              variant: "destructive",
              title: "AI Alerts Failed",
              description: "Could not load alerts. You may have exceeded your usage quota or an error occurred.",
          });
        } finally {
        setIsLoading(false);
        }
    };
    
    const isDataLoading = isLoadingIncome || isLoadingExpenses || isLoadingTasks;

    if (isDataLoading) {
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
                {isLoading ? 'Generating...' : <><Zap className="mr-2 h-4 w-4" /> Generate Alerts</>}
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
