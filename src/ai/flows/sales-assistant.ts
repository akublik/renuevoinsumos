'use server';

/**
 * @fileOverview This file contains a Genkit flow that acts as a sales assistant for a medical supply store.
 *
 * - salesAssistant - A function that provides responses to user queries about products.
 * - SalesAssistantInput - The input type for the salesAssistant function.
 * - SalesAssistantOutput - The return type for the salesAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const SalesAssistantInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  products: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        brand: z.string(),
        description: z.string(),
        category: z.string(),
        price: z.number(),
        stock: z.number(),
      })
    )
    .describe('The list of available products.'),
});
export type SalesAssistantInput = z.infer<typeof SalesAssistantInputSchema>;

const SalesAssistantOutputSchema = z.object({
  response: z.string().describe("The assistant's response to the user."),
});
export type SalesAssistantOutput = z.infer<typeof SalesAssistantOutputSchema>;

export async function salesAssistant(input: SalesAssistantInput): Promise<SalesAssistantOutput> {
  return salesAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'salesAssistantPrompt',
  input: { schema: SalesAssistantInputSchema },
  output: { schema: SalesAssistantOutputSchema },
  prompt: `You are a friendly and helpful sales assistant for a medical supply store called "Insumos Online".
Your goal is to answer user questions about the products, check stock, prices, and provide descriptions.
Be concise, polite, and professional. If a product is out of stock (stock is 0), inform the user.

Here is the list of available products:
{{#each products}}
- Name: {{name}}
  - ID: {{id}}
  - Description: {{description}}
  - Price: \${{price}}
  - Stock: {{stock}} units available
{{/each}}

Here is the conversation history. The user's last message is at the end.
{{#each history}}
{{this.role}}: {{{this.content}}}
{{/each}}
Assistant:`,
});

const salesAssistantFlow = ai.defineFlow(
  {
    name: 'salesAssistantFlow',
    inputSchema: SalesAssistantInputSchema,
    outputSchema: SalesAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
