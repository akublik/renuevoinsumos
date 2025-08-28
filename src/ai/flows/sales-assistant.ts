'use server';
/**
 * @fileOverview A sales assistant AI agent for a medical supply store.
 *
 * - salesAssistant - A function that handles the sales assistant chatbot.
 * - SalesAssistantInput - The input type for the salesAssistant function.
 * - SalesAssistantOutput - The return type for the salesAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { products } from '@/lib/products';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const SalesAssistantInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
});
export type SalesAssistantInput = z.infer<typeof SalesAssistantInputSchema>;

const SalesAssistantOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response.'),
});
export type SalesAssistantOutput = z.infer<typeof SalesAssistantOutputSchema>;

export async function salesAssistant(input: SalesAssistantInput): Promise<SalesAssistantOutput> {
  return salesAssistantFlow(input);
}

const productList = products.map(p => `- ${p.name}: ${p.description} Precio: $${p.price}, Stock: ${p.stock}`).join('\n');

const prompt = ai.definePrompt({
  name: 'salesAssistantPrompt',
  input: { schema: SalesAssistantInputSchema },
  output: { schema: SalesAssistantOutputSchema },
  prompt: `Eres un asistente de ventas amigable y experto para "Insumos Online", una tienda de insumos médicos. Tu objetivo es ayudar a los clientes a encontrar los productos que necesitan y responder sus preguntas de manera clara y amable.

  Aquí está la lista de productos disponibles:
  ${productList}

  Basado en la conversación, responde a la última pregunta del usuario. Sé conversacional y servicial. Si no sabes la respuesta o el producto no está en la lista, dilo amablemente y ofrece ayuda para encontrar otra cosa. No inventes productos.

  {{#each history}}
  {{#if (eq role 'user')}}
  Usuario: {{{content}}}
  {{else}}
  Asistente: {{{content}}}
  {{/if}}
  {{/each}}
  `,
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
