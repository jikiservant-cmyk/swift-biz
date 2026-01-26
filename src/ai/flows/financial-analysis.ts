'use server';
/**
 * @fileOverview An AI-powered analysis for financial data.
 *
 * - analyzeFinancialData - A function that analyzes financial data.
 * - FinancialAnalysisInput - The input type for the analyzeFinancialData function.
 * - FinancialAnalysisOutput - The return type for the analyzeFinancialData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialAnalysisInputSchema = z.object({
  monthlyIncome: z.number().describe('Total income for the current month.'),
  monthlyExpenses: z.number().describe('Total expenses for the current month.'),
  incomeTransactions: z
    .string()
    .describe('A JSON string representing the income transactions for the month.'),
  expenseTransactions: z
    .string()
    .describe('A JSON string representing the expense transactions for the month.'),
});
export type FinancialAnalysisInput = z.infer<typeof FinancialAnalysisInputSchema>;

const FinancialAnalysisOutputSchema = z.object({
  analysis: z
    .string()
    .describe('A detailed analysis of the provided financial data.'),
});
export type FinancialAnalysisOutput = z.infer<
  typeof FinancialAnalysisOutputSchema
>;

export async function analyzeFinancialData(
  input: FinancialAnalysisInput
): Promise<FinancialAnalysisOutput> {
  return financialAnalysisFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'financialAnalysisPrompt',
  input: {schema: FinancialAnalysisInputSchema},
  output: {schema: FinancialAnalysisOutputSchema},
  prompt: `You are a financial analyst AI. Analyze the following financial summary and transaction data for the month and provide a brief analysis.

  ## Monthly Summary
  - **Total Income:** {{monthlyIncome}}
  - **Total Expenses:** {{monthlyExpenses}}

  ## Income Transactions
  {{incomeTransactions}}

  ## Expense Transactions
  {{expenseTransactions}}

  Your analysis should include:
  - A summary of the key financial activities.
  - Identification of any potential issues, noteworthy trends, or anomalies (e.g., unusually large expenses, concentration of income from one source).
  - Actionable insights or recommendations for the business owner.

  Keep the analysis concise, professional, and easy to understand. Your response must be a JSON object with a single key "analysis" containing your full analysis as a string.
  `,
});

const financialAnalysisFlow = ai.defineFlow(
  {
    name: 'financialAnalysisFlow',
    inputSchema: FinancialAnalysisInputSchema,
    outputSchema: FinancialAnalysisOutputSchema,
  },
  async input => {
    const {output} = await analysisPrompt(input);
    return output!;
  }
);
