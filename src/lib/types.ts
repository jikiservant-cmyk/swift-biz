export type User = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
};

export type DbUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
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
  members: { [key: string]: 'owner' | 'viewer' };
};

export type UnpaidInvoice = {
  id: string;
  client: Client;
  amount: number;
  dueDate: Date;
};

export type CashBook = {
  id: string;
  headers: string[];
  gridData: { [key: string]: string }[];
  selectedRows?: number[];
  selectedCols?: number[];
  chartType?: 'bar' | 'line' | 'area' | 'pie';
  isChartVisible?: boolean;
  isAiAnalysisVisible?: boolean;
};

export type AdminUser = {
  userId: string;
  addedAt: Date;
};
    