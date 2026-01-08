'use client';

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Phone, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Client, Task } from '@/lib/types';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, Timestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

export function ClientsPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const clientsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'clients') : null),
    [firestore, user]
  );
  const { data: clients, isLoading: isLoadingClients } = useCollection<Client>(clientsQuery);

  const tasksQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'tasks') : null),
    [firestore, user]
  );
  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Omit<Task, 'dueDate'> & { dueDate: Timestamp }>(tasksQuery);
  const tasksWithDates = useMemo(() => tasks?.map(t => ({ ...t, dueDate: t.dueDate.toDate() })) || [], [tasks]);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isSmsDialogOpen, setIsSmsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const clientTasks = (clientId: string) => tasksWithDates.filter(t => t.clientId === clientId);

  const handleOpenClientDialog = (client: Client | null = null) => {
    setEditingClient(client);
    setIsClientDialogOpen(true);
  };

  const handleSaveClient = (clientData: Omit<Client, 'id'> & { id?: string }) => {
    if (!user || !firestore) return;
    const clientPayload = { ...clientData, userId: user.uid };

    if (clientData.id) {
      // Editing
      const clientRef = doc(firestore, 'users', user.uid, 'clients', clientData.id);
      updateDocumentNonBlocking(clientRef, clientPayload);
      toast({ title: 'Client updated' });
    } else {
      // Creating
      const clientsCol = collection(firestore, 'users', user.uid, 'clients');
      addDocumentNonBlocking(clientsCol, clientPayload);
      toast({ title: 'Client added' });
    }
    setIsClientDialogOpen(false);
    setEditingClient(null);
  };

  const handleSendSms = (message: string) => {
    if (!clients || clients.length === 0) {
      toast({
        title: 'No clients to message',
        description: 'Add some clients before sending a bulk SMS.',
        variant: 'destructive',
      });
      return;
    }
    console.log(`Sending SMS: "${message}" to ${clients.length} clients.`);
    toast({
      title: 'SMS Sent (Simulated)',
      description: `Your message has been sent to ${clients.length} clients.`,
    });
    setIsSmsDialogOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Clients"
        actionButton={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsSmsDialogOpen(true)}>
              <MessageSquare className="-ml-1 mr-2 h-4 w-4" />
              Send Bulk SMS
            </Button>
            <Button onClick={() => handleOpenClientDialog()}>
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>
        }
      />
      {isLoadingClients ? (
        <p>Loading clients...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients?.map(client => (
            <Card key={client.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
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
                <Button variant="outline" className="w-full" onClick={() => setSelectedClient(client)}>
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ClientFormDialog isOpen={isClientDialogOpen} setIsOpen={setIsClientDialogOpen} onSave={handleSaveClient} client={editingClient} />

      <BulkSmsDialog isOpen={isSmsDialogOpen} setIsOpen={setIsSmsDialogOpen} onSend={handleSendSms} />

      <Sheet open={!!selectedClient} onOpenChange={open => !open && setSelectedClient(null)}>
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
                    <Mail className="h-4 w-4" />
                    <span>{selectedClient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
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
                    {isLoadingTasks ? (
                      <p>Loading tasks...</p>
                    ) : (
                      clientTasks(selectedClient.id).map(task => (
                        <div key={task.id} className="text-sm p-3 border rounded-md flex justify-between items-center">
                          <span>{task.title}</span>
                          <span className="text-xs text-muted-foreground">{task.status}</span>
                        </div>
                      ))
                    )}
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

function ClientFormDialog({ isOpen, setIsOpen, onSave, client }: { isOpen: boolean; setIsOpen: (open: boolean) => void; onSave: (data: any) => void; client: Client | null }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (client) {
      setName(client.name);
      setEmail(client.email);
      setPhone(client.phone);
      setNotes(client.notes);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setNotes('');
    }
  }, [client, isOpen]);

  const handleSubmit = () => {
    onSave({ id: client?.id, name, email, phone, notes });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? 'Edit Client' : 'Add Client'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" value={email} onChange={e => setEmail(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Notes
            </Label>
            <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Save Client</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkSmsDialog({ isOpen, setIsOpen, onSend }: { isOpen: boolean; setIsOpen: (open: boolean) => void; onSend: (message: string) => void }) {
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setMessage('');
    }
  }, [isOpen]);

  const handleSend = () => {
    onSend(message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Bulk SMS</DialogTitle>
          <DialogDescription>Compose a message to send to all your clients.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message here..." className="min-h-[120px]" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSend} disabled={!message.trim()}>
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
