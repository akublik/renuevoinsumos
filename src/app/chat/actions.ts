'use server';

import { salesAssistant, SalesAssistantInput } from '@/ai/flows/sales-assistant';

export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export async function askChatbot(history: ChatMessage[]): Promise<string> {
  try {
    const input: SalesAssistantInput = {
      // Genkit's `model` role is equivalent to our app's `bot` sender type
      history: history.map(m => ({ role: m.role, content: m.content })),
    };
    const output = await salesAssistant(input);
    return output.response;
  } catch (error) {
    console.error("Error with sales assistant AI flow:", error);
    // Fallback to a generic error message
    return "Lo siento, estoy teniendo problemas para conectarme. Por favor, inténtalo de nuevo más tarde.";
  }
}
