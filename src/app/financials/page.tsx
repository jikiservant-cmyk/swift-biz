import { FinancialsPage } from "@/components/financials/FinancialsPage";
import { transactions } from "@/lib/data";

export default function Financials() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <FinancialsPage initialTransactions={transactions} />
    </div>
  );
}
