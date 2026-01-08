export type User = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
};

export type Task = {
  id: string;
  title: string;
  assigneeId?: string;
  dueDate: Date;
  status: 'todo' | 'in-progress' | 'completed';
  clientId?: string;
  userId: string;
};

export type Transaction = {
  id:string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: Date;
  userId: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  userId: string;
};

export type UnpaidInvoice = {
  id: string;
  client: Client;
  amount: number;
  dueDate: Date;
};
