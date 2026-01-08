import { ClientsPage } from "@/components/clients/ClientsPage";
import { clients, tasks, transactions } from "@/lib/data";

export default function Clients() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <ClientsPage 
        initialClients={clients}
        tasks={tasks}
        transactions={transactions}
      />
    </div>
  );
}
