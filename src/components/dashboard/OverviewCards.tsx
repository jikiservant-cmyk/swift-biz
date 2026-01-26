"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getThisMonthTransactions, getOverdueTasks, formatCurrency } from "@/lib/helpers";
import { ArrowUpRight, ArrowDownLeft, Clock, AlertTriangle } from "lucide-react";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, Timestamp } from "firebase/firestore";
import { useMemo } from "react";
import { Task, Transaction } from "@/lib/types";
import { unpaidInvoices as staticUnpaidInvoices } from "@/lib/data";

export function OverviewCards() {
  const { firestore, user } = useFirebase();

  // Fetch both income and expense transactions
  const incomeQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'incomes') : null),
    [firestore, user]
  );
  const { data: incomeTxs } = useCollection<Omit<Transaction, 'date'> & { date: Timestamp }>(incomeQuery);

  const expenseQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'expenses') : null),
    [firestore, user]
  );
  const { data: expenseTxs } = useCollection<Omit<Transaction, 'date'> & { date: Timestamp }>(expenseQuery);

  // Combine transactions and convert Timestamps to Dates
  const transactionsWithDates = useMemo(() => {
    const allTxs = [
      ...(incomeTxs || []).map(t => ({...t, type: 'income' as const})),
      ...(expenseTxs || []).map(t => ({...t, type: 'expense' as const}))
    ];
    return allTxs.map(t => ({...t, date: t.date.toDate()}));
  }, [incomeTxs, expenseTxs]);

  // Fetch tasks
  const tasksQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'tasks') : null),
    [firestore, user]
  );
  const { data: tasks } = useCollection<Omit<Task, 'dueDate'> & { dueDate: Timestamp }>(tasksQuery);
  const tasksWithDueDates = useMemo(() => tasks?.map(t => ({...t, dueDate: t.dueDate.toDate()})) || [], [tasks]);

  const monthlyTransactions = getThisMonthTransactions(transactionsWithDates);
  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const overdueTasksCount = getOverdueTasks(tasksWithDueDates).length;
  const unpaidInvoicesCount = staticUnpaidInvoices.length;

  const cards = [
    {
      title: "This Month's Income",
      Icon: ArrowUpRight,
      value: formatCurrency(monthlyIncome),
      details: "+20.1% from last month",
      color: "text-green-500",
    },
    {
      title: "This Month's Expenses",
      Icon: ArrowDownLeft,
      value: formatCurrency(monthlyExpenses),
      details: "+12.4% from last month",
      color: "text-red-500",
    },
    {
      title: "Overdue Tasks",
      Icon: Clock,
      value: `+${overdueTasksCount}`,
      details: "Action required",
      color: "text-amber-500",
    },
    {
      title: "Unpaid Invoices",
      Icon: AlertTriangle,
      value: `+${unpaidInvoicesCount}`,
      details: `Totaling ${formatCurrency(staticUnpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0))}`,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.Icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.details}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
