'use server';

/**
 * @fileOverview This file contains a Genkit flow that rephrases chatbot responses to be more clear and concise.
 *
 * - rephraseChatbotResponse - A function that rephrases the chatbot response.
 * - RephraseChatbotResponseInput - The input type for the rephraseChatbotResponse function.
 * - RephraseChatbotResponseOutput - The return type for the rephraseChatbotResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RephraseChatbotResponseInputSchema = z.object({
  chatbotResponse: z.string().describe('The original response from the chatbot.'),
});
export type RephraseChatbotResponseInput = z.infer<typeof RephraseChatbotResponseInputSchema>;

const RephraseChatbotResponseOutputSchema = z.object({
  rephrasedResponse: z.string().describe('The rephrased response that is clear and concise.'),
});
export type RephraseChatbotResponseOutput = z.infer<typeof RephraseChatbotResponseOutputSchema>;

export async function rephraseChatbotResponse(input: RephraseChatbotResponseInput): Promise<RephraseChatbotResponseOutput> {
  return rephraseChatbotResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rephraseChatbotResponsePrompt',
  input: {schema: RephraseChatbotResponseInputSchema},
  output: {schema: RephraseChatbotResponseOutputSchema},
  prompt: `You are an expert at making chatbot responses clear and concise.  Please rephrase the following chatbot response so that it is easy to understand quickly.\n\nChatbot Response: {{{chatbotResponse}}}`,
});

const rephraseChatbotResponseFlow = ai.defineFlow(
  {
    name: 'rephraseChatbotResponseFlow',
    inputSchema: RephraseChatbotResponseInputSchema,
    outputSchema: RephraseChatbotResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
