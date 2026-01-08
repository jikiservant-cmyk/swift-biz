'use server';

/**
 * @fileOverview An AI-powered alert system for Mubiru Farm.
 *
 * - generateAlerts - A function that checks for critical issues and generates alerts.
 * - AIPoweredAlertsInput - The input type for the generateAlerts function.
 * - AIPoweredAlertsOutput - The return type for the generateAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPoweredAlertsInputSchema = z.object({
  cashBalance: z.number().describe('The current cash balance.'),
  overdueTasksCount: z.number().describe('The number of overdue tasks.'),
  totalTasksCount: z.number().describe('The total number of tasks.'),
  unpaidInvoices: z.number().describe('The number of unpaid invoices.'),
  monthlyIncome: z.number().describe('The total income for the month.'),
  monthlyExpenses: z.number().describe('The total expenses for the month.'),
});
export type AIPoweredAlertsInput = z.infer<typeof AIPoweredAlertsInputSchema>;

const AIPoweredAlertsOutputSchema = z.object({
  alerts: z.array(z.string()).describe('A list of AI-powered alerts.'),
});
export type AIPoweredAlertsOutput = z.infer<typeof AIPoweredAlertsOutputSchema>;

export async function generateAlerts(input: AIPoweredAlertsInput): Promise<AIPoweredAlertsOutput> {
  return generateAlertsFlow(input);
}

const alertPrompt = ai.definePrompt({
  name: 'alertPrompt',
  input: {schema: AIPoweredAlertsInputSchema},
  output: {schema: AIPoweredAlertsOutputSchema},
  prompt: `You are an AI assistant designed to identify critical issues for Mubiru Farm users and generate concise alerts.

  Based on the following information, determine if there are any urgent financial or operational problems that require the user's attention. If so, create a list of alerts that summarize the issues. Keep the alerts concise and scannable.

  Cash Balance: {{cashBalance}}
  Overdue Tasks Count: {{overdueTasksCount}}
  Total Tasks Count: {{totalTasksCount}}
  Unpaid Invoices: {{unpaidInvoices}}
  Monthly Income: {{monthlyIncome}}
  Monthly Expenses: {{monthlyExpenses}}

  Consider the following scenarios when generating alerts:
  - Low Cash: If the cash balance is critically low (e.g., less than 10% of monthly expenses), generate a "Low Cash" alert.
  - Overdue Tasks: If there are a significant number of overdue tasks (e.g., 3 or more), generate an "Overdue Tasks" alert.
  - High Unpaid Invoices: If there are a high number of unpaid invoices, generate an "High Unpaid Invoices" alert.
  - Income Less Than Expenses: If monthly income is less than monthly expenses, generate an "Income Less Than Expenses" alert.

  Output only the alerts in a JSON array format.
  `,
});

const generateAlertsFlow = ai.defineFlow(
  {
    name: 'generateAlertsFlow',
    inputSchema: AIPoweredAlertsInputSchema,
    outputSchema: AIPoweredAlertsOutputSchema,
  },
  async input => {
    try {
      const {output} = await alertPrompt(input);
      return output!;
    } catch (e) {
      console.error('Error generating alerts:', e);
      // Return empty alerts if the AI model fails
      return { alerts: [] };
    }
  }
);
