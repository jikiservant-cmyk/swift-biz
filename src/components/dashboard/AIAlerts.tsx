import { generateAlerts } from "@/ai/flows/ai-powered-alerts";
import { transactions, tasks, unpaidInvoices } from "@/lib/data";
import { getThisMonthTransactions, getOverdueTasks } from "@/lib/helpers";
import { AlertCircle, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export async function AIAlerts() {
  // Note: This component is still using static data.
  // For a fully realtime experience, this should also be updated
  // to use hooks and fetch data from firebase.
  const monthlyTransactions = getThisMonthTransactions([]);
  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = transactions.reduce((balance, t) => balance + (t.type === 'income' ? t.amount : -t.amount), 0);
  const overdueTasks = getOverdueTasks([]);

  try {
    const alertsData = await generateAlerts({
      cashBalance: totalBalance,
      overdueTasksCount: overdueTasks.length,
      totalTasksCount: tasks.length,
      unpaidInvoices: unpaidInvoices.length,
      monthlyIncome: monthlyIncome,
      monthlyExpenses: monthlyExpenses,
    });

    if (!alertsData.alerts || alertsData.alerts.length === 0) {
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
            {alertsData.alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  } catch (error) {
    console.error("AIAlerts Error:", error);
    return null;
  }
}
