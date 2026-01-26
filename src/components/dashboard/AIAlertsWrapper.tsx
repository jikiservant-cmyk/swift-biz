'use client';

import { useEffect, useState, useMemo } from 'react';
import { generateAlerts } from '@/ai/flows/ai-powered-alerts';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { Task, Transaction } from '@/lib/types';
import { getThisMonthTransactions, getOverdueTasks } from '@/lib/helpers';
import { AIAlerts } from './AIAlerts';
import { useToast } from '@/hooks/use-toast';

export function AIAlertsWrapper() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRun, setHasRun] = useState(false); // Use this to run only once per mount

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

  useEffect(() => {
    const isDataLoaded = !isLoadingIncome && !isLoadingExpenses && !isLoadingTasks && !!user;
    
    // Only run the fetch logic if the initial data is loaded and we haven't run it yet for this component mount.
    if (isDataLoaded && !hasRun) {
      setHasRun(true); // Prevent re-running on subsequent data changes

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
          console.error('AIAlerts Error:', error);
          setAlerts([]);
          toast({
            variant: "destructive",
            title: "AI Alerts Failed",
            description: "Could not load alerts. You may have exceeded your usage quota.",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchAlerts();
    }
  }, [
    hasRun, // Dependency to prevent re-run
    isLoadingIncome,
    isLoadingExpenses,
    isLoadingTasks,
    user,
    transactionsWithDates, // Dependency to get latest data when effect runs
    tasksWithDates,       // Dependency to get latest data when effect runs
    toast
  ]);

  // The component is loading if the underlying data is loading, OR if the AI fetch is in progress.
  const isComponentLoading = isLoading || isLoadingIncome || isLoadingExpenses || isLoadingTasks;

  return <AIAlerts alerts={alerts} isLoading={isComponentLoading} />;
}
