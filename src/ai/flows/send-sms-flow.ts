'use server';
/**
 * @fileOverview A Genkit flow for sending SMS messages via Twilio.
 *
 * - sendSms - A function that sends an SMS message to a specified number.
 * - SendSmsInput - The input type for the sendSms function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import twilio from 'twilio';

const SendSmsInputSchema = z.object({
  to: z.string().describe('The recipient\'s phone number.'),
  body: z.string().describe('The content of the message.'),
});
export type SendSmsInput = z.infer<typeof SendSmsInputSchema>;

export async function sendSms(input: SendSmsInput): Promise<void> {
  return sendSmsFlow(input);
}

const sendSmsFlow = ai.defineFlow(
  {
    name: 'sendSmsFlow',
    inputSchema: SendSmsInputSchema,
    outputSchema: z.void(),
  },
  async ({ to, body }) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !from) {
      console.error('Twilio credentials are not configured in .env file.');
      throw new Error('Twilio service is not configured.');
    }

    const client = twilio(accountSid, authToken);

    try {
      const message = await client.messages.create({
        body,
        from,
        to,
      });
      console.log(`Message sent with SID: ${message.sid}`);
    } catch (error) {
      console.error('Failed to send SMS:', error);
      // We don't re-throw the error to the client to avoid exposing service details,
      // but we could implement more robust error handling here (e.g., a retry queue).
    }
  }
);
