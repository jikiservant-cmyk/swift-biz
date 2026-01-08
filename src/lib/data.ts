import type { User, Task, Transaction, Client, UnpaidInvoice } from './types';

export const users: User[] = [
  { id: 'user-1', name: 'Alex Johnson', avatar: 'https://picsum.photos/seed/user-1/40/40', initials: 'AJ' },
  { id: 'user-2', name: 'Maria Garcia', avatar: 'https://picsum.photos/seed/user-2/40/40', initials: 'MG' },
  { id: 'user-3', name: 'James Smith', avatar: 'https://picsum.photos/seed/user-3/40/40', initials: 'JS' },
];

export const clients: Client[] = [
  { id: 'client-1', name: 'Innovate Corp', email: 'contact@innovate.com', phone: '555-0101', notes: 'Long-term client, focus on Q3 goals. They prefer weekly updates via email and are very responsive.', userId: 'user-1' },
  { id: 'client-2', name: 'Data Systems', email: 'hello@datasys.io', phone: '555-0102', notes: 'New client, onboarded last month. They are on a trial package and need extra attention to convert to a long-term contract.', userId: 'user-1' },
  { id: 'client-3', name: 'Market Movers', email: 'support@marketmovers.co', phone: '555-0103', notes: 'Needs urgent attention on the branding project. The deadline is approaching fast.', userId: 'user-1' },
  { id: 'client-4', name: 'QuantumLeap', email: 'inquiries@qleap.tech', phone: '555-0104', notes: 'High value client, monthly retainer. Always pay on time. Main contact is Sarah.', userId: 'user-1' },
];

export const tasks: Task[] = [
  { id: 'task-1', title: 'Draft Q3 report for Innovate Corp', assigneeId: 'user-1', dueDate: new Date(new Date().setDate(new Date().getDate() + 2)), status: 'in-progress', clientId: 'client-1' },
  { id: 'task-2', title: 'Finalize branding mockups for Market Movers', assigneeId: 'user-2', dueDate: new Date(new Date().setDate(new Date().getDate() - 1)), status: 'in-progress', clientId: 'client-3' },
  { id: 'task-3', title: 'Onboarding call with Data Systems', assigneeId: 'user-1', dueDate: new Date(), status: 'todo' },
  { id: 'task-4', title: 'Develop API integration for QuantumLeap', assigneeId: 'user-2', dueDate: new Date(new Date().setDate(new Date().getDate() + 10)), status: 'todo', clientId: 'client-4' },
  { id: 'task-5', title: 'Review project proposal for Data Systems', assigneeId: 'user-1', dueDate: new Date(new Date().setDate(new Date().getDate() - 5)), status: 'completed', clientId: 'client-1' },
  { id: 'task-6', title: 'Send invoice #1234 to Innovate Corp', assigneeId: 'user-1', dueDate: new Date(new Date().setDate(new Date().getDate() - 3)), status: 'todo', clientId: 'client-1' },
];

const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

export const transactions: Transaction[] = [
  // Income
  { id: 'trans-1', type: 'income', description: 'Project payment from Innovate Corp', amount: 5000, category: 'Client Project', date: new Date(currentYear, currentMonth, 2), userId: 'user-1' },
  { id: 'trans-2', type: 'income', description: 'Retainer - QuantumLeap', amount: 2500, category: 'Retainer', date: new Date(currentYear, currentMonth, 5), userId: 'user-1' },
  { id: 'trans-3', type: 'income', description: 'Initial payment - Data Systems', amount: 1500, category: 'Client Project', date: new Date(currentYear, currentMonth, 15), userId: 'user-1' },
  { id: 'trans-in-prev-month', type: 'income', description: 'Old project', amount: 1000, category: 'Client Project', date: new Date(currentYear, currentMonth > 0 ? currentMonth - 1 : 11, 15), userId: 'user-1' },

  // Expenses
  { id: 'trans-4', type: 'expense', description: 'Software Subscription (Figma)', amount: 150, category: 'Software', date: new Date(currentYear, currentMonth, 1), userId: 'user-1' },
  { id: 'trans-5', type: 'expense', description: 'Office Supplies', amount: 75, category: 'Supplies', date: new Date(currentYear, currentMonth, 3), userId: 'user-1' },
  { id: 'trans-6', type: 'expense', description: 'Cloud Hosting (AWS)', amount: 200, category: 'Utilities', date: new Date(currentYear, currentMonth, 10), userId: 'user-1' },
  { id: 'trans-7', type: 'expense', description: 'Freelancer Payment (John Doe)', amount: 1200, category: 'Contractors', date: new Date(currentYear, currentMonth, 18), userId: 'user-1' },
  { id: 'trans-ex-prev-month', type: 'expense', description: 'Old expense', amount: 100, category: 'Software', date: new Date(currentYear, currentMonth > 0 ? currentMonth - 1 : 11, 18), userId: 'user-1' },
];

// This is now derived from realtime data, but we can keep this for demo if needed.
export const unpaidInvoices: UnpaidInvoice[] = [
    // { id: 'inv-1', client: clients[2], amount: 1800, dueDate: new Date(new Date().setDate(new Date().getDate() - 7)) },
    // { id: 'inv-2', client: clients[0], amount: 2200, dueDate: new Date(new Date().setDate(new Date().getDate() - 2)) },
];
