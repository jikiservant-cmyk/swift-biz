'use server';
/**
 * @fileOverview An AI-powered analysis for the cash book data.
 *
 * - analyzeCashBookData - A function that analyzes cash book data.
 * - CashBookAnalysisInput - The input type for the analyzeCashBookData function.
 * - CashBookAnalysisOutput - The return type for the analyzeCashBookData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CashBookAnalysisInputSchema = z.object({
  jsonData: z.string().describe('The selected cash book data in JSON format.'),
});
export type CashBookAnalysisInput = z.infer<typeof CashBookAnalysisInputSchema>;

const CashBookAnalysisOutputSchema = z.object({
  analysis: z
    .string()
    .describe('A detailed analysis of the provided cash book data.'),
});
export type CashBookAnalysisOutput = z.infer<
  typeof CashBookAnalysisOutputSchema
>;

export async function analyzeCashBookData(
  input: CashBookAnalysisInput
): Promise<CashBookAnalysisOutput> {
  return cashBookAnalysisFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'cashBookAnalysisPrompt',
  input: {schema: CashBookAnalysisInputSchema},
  output: {schema: CashBookAnalysisOutputSchema},
  prompt: `You are a financial analyst AI. Analyze the following cash book data and provide a brief analysis. The data is in JSON format.

  Data:
  {{jsonData}}

  Your analysis should include:
  - A summary of the key trends.
  - Identification of any potential issues or anomalies.
  - Actionable insights or recommendations.

  Keep the analysis concise and easy to understand. Your response must be a JSON object with a single key "analysis" containing your full analysis as a string.
  `,
});

const cashBookAnalysisFlow = ai.defineFlow(
  {
    name: 'cashBookAnalysisFlow',
    inputSchema: CashBookAnalysisInputSchema,
    outputSchema: CashBookAnalysisOutputSchema,
  },
  async input => {
    const {output} = await analysisPrompt(input);
    return output!;
  }
);
