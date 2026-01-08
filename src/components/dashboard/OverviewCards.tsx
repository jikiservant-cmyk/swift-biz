import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { unpaidInvoices } from "@/lib/data";
import { getThisMonthTransactions, getOverdueTasks, formatCurrency } from "@/lib/helpers";
import { ArrowUpRight, ArrowDownLeft, Clock, AlertTriangle } from "lucide-react";

export function OverviewCards() {
  const monthlyTransactions = getThisMonthTransactions();
  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const overdueTasksCount = getOverdueTasks().length;
  const unpaidInvoicesCount = unpaidInvoices.length;

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
      details: `Totaling ${formatCurrency(unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0))}`,
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
