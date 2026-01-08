"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, ClipboardList, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Client, Task, Transaction } from "@/lib/types";
import { tasks as allTasks } from "@/lib/data";

export function ClientsPage({ initialClients, tasks, transactions }: { initialClients: Client[], tasks: Task[], transactions: Transaction[] }) {
  const [clients, setClients] = useState(initialClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const clientTasks = (clientId: string) => tasks.filter(t => t.client?.id === clientId);
  // A real app would link transactions to clients, here we just show all for demo
  const clientTransactions = (clientId: string) => transactions.slice(0,3);

  return (
    <>
      <PageHeader 
        title="Clients"
        actionButton={
          <Button>
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Add Client
          </Button>
        }
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clients.map(client => (
          <Card key={client.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={`https://picsum.photos/seed/${client.id}/80/80`} />
                <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{client.name}</CardTitle>
                <CardDescription>{client.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{client.notes}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setSelectedClient(client)}>View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Sheet open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedClient && (
            <>
              <SheetHeader className="mb-6 text-left">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={`https://picsum.photos/seed/${selectedClient.id}/80/80`} />
                    <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-2xl">{selectedClient.name}</SheetTitle>
                    <SheetDescription className="text-base">{selectedClient.email}</SheetDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4"/>
                    <span>{selectedClient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4"/>
                    <span>{selectedClient.phone}</span>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground bg-secondary p-4 rounded-md">{selectedClient.notes}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-2">Linked Tasks ({clientTasks(selectedClient.id).length})</h3>
                  <div className="space-y-2">
                    {clientTasks(selectedClient.id).map(task => (
                      <div key={task.id} className="text-sm p-3 border rounded-md flex justify-between items-center">
                        <span>{task.title}</span>
                        <span className="text-xs text-muted-foreground">{task.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                   <h3 className="text-lg font-semibold mb-2">Linked Payments ({clientTransactions(selectedClient.id).length})</h3>
                   <div className="space-y-2">
                    {clientTransactions(selectedClient.id).map(tx => (
                        <div key={tx.id} className="text-sm p-3 border rounded-md flex justify-between items-center">
                          <span>{tx.description}</span>
                          <span className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{tx.type === 'income' ? '+' : '-'} ${tx.amount}</span>
                        </div>
                    ))}
                   </div>
                </div>

              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
