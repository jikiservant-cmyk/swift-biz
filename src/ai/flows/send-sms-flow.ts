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
      // Throw an error that the client can handle, instead of just logging.
      throw new Error('Twilio service is not configured. Please set credentials in your .env file.');
    }

    const client = twilio(accountSid, authToken);

    try {
      const message = await client.messages.create({
        body,
        from,
        to,
      });
      console.log(`Message sent with SID: ${message.sid}`);
    } catch (error: any) {
      console.error('Failed to send SMS via Twilio:', error);
      // Re-throw the error with a more client-friendly message.
      throw new Error(`Failed to send SMS to ${to}: ${error.message}`);
    }
  }
);
