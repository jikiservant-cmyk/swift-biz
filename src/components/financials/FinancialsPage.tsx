"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, ArrowDownLeft, FileDown, MoreHorizontal, Edit, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/helpers";

type TransactionDialogState = {
  isOpen: boolean;
  type: 'income' | 'expense';
  editingTransaction: Transaction | null;
}

export function FinancialsPage({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [dialogState, setDialogState] = useState<TransactionDialogState>({ isOpen: false, type: 'income', editingTransaction: null });

  const monthlyTxs = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear());
  }, [transactions]);
  
  const monthlyIncome = monthlyTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthlyTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netIncome = monthlyIncome - monthlyExpenses;

  const handleOpenDialog = (type: 'income' | 'expense', transaction: Transaction | null = null) => {
    setDialogState({ isOpen: true, type, editingTransaction: transaction });
  };
  
  const handleSaveTransaction = (txData: Omit<Transaction, 'id'> & { id?: string }) => {
    if (txData.id) { // Editing
      setTransactions(transactions.map(t => t.id === txData.id ? { ...t, ...txData } as Transaction : t));
      toast({ title: "Transaction updated", description: "The transaction has been successfully updated." });
    } else { // Creating
      const newTx: Transaction = { ...txData, id: `trans-${Date.now()}` };
      setTransactions([newTx, ...transactions].sort((a,b) => b.date.getTime() - a.date.getTime()));
      toast({ title: "Transaction added", description: "A new transaction has been recorded." });
    }
    setDialogState({ isOpen: false, type: 'income', editingTransaction: null });
  };
  
  const handleDeleteTransaction = (txId: string) => {
    setTransactions(transactions.filter(t => t.id !== txId));
    toast({ title: "Transaction deleted", variant: "destructive", description: "The transaction has been removed." });
  };

  return (
    <>
      <PageHeader 
        title="Financials"
        actionButton={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast({title: "Coming soon!", description: "CSV export will be available in a future update."})}>
              <FileDown className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add New</Button></DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleOpenDialog('income')}>Add Income</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenDialog('expense')}>Add Expense</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Monthly Income</CardTitle><ArrowUpRight className="h-4 w-4 text-green-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle><ArrowDownLeft className="h-4 w-4 text-red-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(monthlyExpenses)}</div></CardContent>
        </Card>
        <Card className={netIncome >= 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Net Income</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(netIncome)}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="income">
        <TabsList><TabsTrigger value="income">Income</TabsTrigger><TabsTrigger value="expense">Expenses</TabsTrigger></TabsList>
        <TabsContent value="income"><TransactionsTable type="income" transactions={transactions.filter(t => t.type === 'income')} onEdit={handleOpenDialog} onDelete={handleDeleteTransaction} /></TabsContent>
        <TabsContent value="expense"><TransactionsTable type="expense" transactions={transactions.filter(t => t.type === 'expense')} onEdit={handleOpenDialog} onDelete={handleDeleteTransaction}/></TabsContent>
      </Tabs>

      <TransactionFormDialog 
        state={dialogState} 
        setState={setDialogState} 
        onSave={handleSaveTransaction} 
      />
    </>
  );
}

function TransactionsTable({ type, transactions, onEdit, onDelete }: { type: 'income' | 'expense', transactions: Transaction[], onEdit: (type: 'income' | 'expense', tx: Transaction) => void, onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="w-[80px]"></TableHead></TableRow></TableHeader>
          <TableBody>
            {transactions.map(tx => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">{tx.description}</TableCell>
                <TableCell className="text-muted-foreground">{tx.category}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(tx.date)}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(tx.amount)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onEdit(type, tx)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => onDelete(tx.id)}><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function TransactionFormDialog({ state, setState, onSave }: { state: TransactionDialogState, setState: (state: TransactionDialogState) => void, onSave: (data: any) => void }) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  React.useEffect(() => {
    if (state.editingTransaction) {
      setDescription(state.editingTransaction.description);
      setCategory(state.editingTransaction.category);
      setAmount(state.editingTransaction.amount);
      setDate(state.editingTransaction.date);
    } else {
      setDescription(""); setCategory(""); setAmount(""); setDate(new Date());
    }
  }, [state.editingTransaction, state.isOpen]);

  const handleSubmit = () => {
    onSave({ id: state.editingTransaction?.id, type: state.type, description, category, amount: Number(amount), date });
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    setState({ ...state, isOpen });
  };

  return (
    <Dialog open={state.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>{state.editingTransaction ? 'Edit' : 'Add'} {state.type === 'income' ? 'Income' : 'Expense'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="description" className="text-right">Description</Label><Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" /></div>
          <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="amount" className="text-right">Amount</Label><Input id="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="col-span-3" /></div>
          <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="category" className="text-right">Category</Label><Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3" /></div>
          <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="date" className="text-right">Date</Label><DatePicker date={date} setDate={setDate} className="col-span-3" /></div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSubmit}>Save Transaction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
