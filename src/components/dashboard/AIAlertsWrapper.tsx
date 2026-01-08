'use client';

import { useEffect, useState, useMemo } from 'react';
import { generateAlerts } from '@/ai/flows/ai-powered-alerts';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { Task, Transaction } from '@/lib/types';
import { getThisMonthTransactions, getOverdueTasks } from '@/lib/helpers';
import { AIAlerts } from './AIAlerts';

export function AIAlertsWrapper() {
  const { firestore, user } = useFirebase();
  const [alerts, setAlerts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    async function fetchAlerts() {
      if (isLoadingIncome || isLoadingExpenses || isLoadingTasks || !user) {
        // We also need to wait for the user to be loaded
        return;
      }

      const monthlyTransactions = getThisMonthTransactions(transactionsWithDates);
      const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const totalBalance = transactionsWithDates.reduce((balance, t) => balance + (t.type === 'income' ? t.amount : -t.amount), 0);
      const overdueTasks = getOverdueTasks(tasksWithDates);

      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlerts();
  }, [isLoadingIncome, isLoadingExpenses, isLoadingTasks, transactionsWithDates, tasksWithDates, user]);

  return <AIAlerts alerts={alerts} isLoading={isLoading || isLoadingIncome || isLoadingExpenses || isLoadingTasks} />;
}
