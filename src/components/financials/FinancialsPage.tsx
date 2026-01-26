
"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, ArrowDownLeft, FileDown, MoreHorizontal, Edit, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/helpers";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, doc, Timestamp } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart as BarChartIcon, LineChart as LineChartIcon, AreaChart as AreaChartIcon } from 'lucide-react';


type TransactionDialogState = {
  isOpen: boolean;
  type: 'income' | 'expense';
  editingTransaction: Transaction | null;
}

type ChartType = 'bar' | 'line' | 'area';

export function FinancialsPage() {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

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
  
  const isLoading = isLoadingIncome || isLoadingExpenses;

  const [dialogState, setDialogState] = useState<TransactionDialogState>({ isOpen: false, type: 'income', editingTransaction: null });
  const [activeTab, setActiveTab] = useState("income");
  const [chartType, setChartType] = useState<ChartType>('bar');

  const monthlyTxs = useMemo(() => {
    const now = new Date();
    return transactionsWithDates.filter(t => new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear());
  }, [transactionsWithDates]);
  
  const monthlyIncome = monthlyTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthlyTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netIncome = monthlyIncome - monthlyExpenses;

  const handleOpenDialog = (type: 'income' | 'expense', transaction: Transaction | null = null) => {
    setDialogState({ isOpen: true, type, editingTransaction: transaction });
  };
  
  const handleSaveTransaction = (txData: Omit<Transaction, 'id' | 'date' | 'userId'> & { id?: string, date?: Date }) => {
    if (!firestore || !user) return;
    
    const collectionName = txData.type === 'income' ? 'incomes' : 'expenses';
    
    const txPayload : any = {
      ...txData,
      date: txData.date ? Timestamp.fromDate(txData.date) : Timestamp.now(),
      userId: user.uid,
    };
    
    if (txData.id) { // Editing
      const txRef = doc(firestore, 'users', user.uid, collectionName, txData.id);
      updateDocumentNonBlocking(txRef, txPayload);
      toast({ title: "Transaction updated", description: "The transaction has been successfully updated." });
    } else { // Creating
      delete txPayload.id;
      const txCol = collection(firestore, 'users', user.uid, collectionName);
      addDocumentNonBlocking(txCol, txPayload);
      toast({ title: "Transaction added", description: "A new transaction has been recorded." });
    }
    setDialogState({ isOpen: false, type: 'income', editingTransaction: null });
  };
  
  const handleDeleteTransaction = (tx: Transaction) => {
    if(!firestore || !user) return;
    const collectionName = tx.type === 'income' ? 'incomes' : 'expenses';
    const txRef = doc(firestore, 'users', user.uid, collectionName, tx.id);
    deleteDocumentNonBlocking(txRef);
    toast({ title: "Transaction deleted", variant: "destructive", description: "The transaction has been removed." });
  };

  const chartData = [
    {
      name: 'Monthly Summary',
      Income: monthlyIncome,
      Expenses: monthlyExpenses,
    },
  ];

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 20, left: 30, bottom: 5 },
    };
    const commonComps = (
      <>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => formatCurrency(Number(value))} width={80} />
        <Tooltip 
          contentStyle={{ 
              background: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))"
          }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Legend />
      </>
    );

    switch(chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {commonComps}
            <Line type="monotone" dataKey="Income" stroke="#22c55e" />
            <Line type="monotone" dataKey="Expenses" stroke="#ef4444" />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {commonComps}
            <Area type="monotone" dataKey="Income" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
            <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
          </AreaChart>
        );
      case 'bar':
      default:
        return (
          <BarChart {...commonProps}>
            {commonComps}
            <Bar dataKey="Income" fill="#22c55e" />
            <Bar dataKey="Expenses" fill="#ef4444" />
          </BarChart>
        );
    }
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="income">Income</TabsTrigger><TabsTrigger value="expense">Expenses</TabsTrigger></TabsList>
        <TabsContent value="income"><TransactionsTable type="income" transactions={transactionsWithDates.filter(t => t.type === 'income')} onEdit={handleOpenDialog} onDelete={handleDeleteTransaction} isLoading={isLoading} /></TabsContent>
        <TabsContent value="expense"><TransactionsTable type="expense" transactions={transactionsWithDates.filter(t => t.type === 'expense')} onEdit={handleOpenDialog} onDelete={handleDeleteTransaction} isLoading={isLoading}/></TabsContent>
      </Tabs>
      
      <Card className="mt-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Monthly Summary</CardTitle>
              <CardDescription>A visual comparison of your income and expenses for the current month.</CardDescription>
            </div>
            <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar"><div className="flex items-center"><BarChartIcon className="mr-2 h-4 w-4" />Bar Chart</div></SelectItem>
                <SelectItem value="line"><div className="flex items-center"><LineChartIcon className="mr-2 h-4 w-4" />Line Chart</div></SelectItem>
                <SelectItem value="area"><div className="flex items-center"><AreaChartIcon className="mr-2 h-4 w-4" />Area Chart</div></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <TransactionFormDialog 
        state={dialogState} 
        setState={setDialogState} 
        onSave={handleSaveTransaction} 
      />
    </>
  );
}

function TransactionsTable({ type, transactions, onEdit, onDelete, isLoading }: { type: 'income' | 'expense', transactions: Transaction[], onEdit: (type: 'income' | 'expense', tx: Transaction) => void, onDelete: (tx: Transaction) => void, isLoading: boolean }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="w-[80px]"></TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>}
            {!isLoading && transactions.map(tx => (
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
                      <DropdownMenuItem className="text-destructive" onClick={() => onDelete(tx)}><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
  const [amount, setAmount] = useState<number | string>("");
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
    const payload = { id: state.editingTransaction?.id, type: state.type, description, category, amount: Number(amount), date };
    onSave(payload);
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
          <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="amount" className="text-right">Amount</Label><Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" /></div>
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
