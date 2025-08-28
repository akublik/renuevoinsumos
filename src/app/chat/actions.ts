'use server';

import { rephraseChatbotResponse } from '@/ai/flows/rephrase-chatbot-response';
import { products } from '@/lib/products';
import type { RephraseChatbotResponseOutput } from '@/ai/flows/rephrase-chatbot-response';


// A simple simulation of a tool that checks product details and availability.
async function checkProductAvailability(productName: string): Promise<string> {
    const lowerCaseProductName = productName.toLowerCase();
    const foundProduct = products.find(p => p.name.toLowerCase().includes(lowerCaseProductName));

    if (foundProduct) {
        let availability = foundProduct.stock > 0 
            ? `Sí, tenemos ${foundProduct.name} en existencia. Actualmente hay ${foundProduct.stock} unidades disponibles. Cuesta $${foundProduct.price}.`
            : `Actualmente no tenemos ${foundProduct.name} en existencia.`;
        return `${availability} ¿Puedo ayudarte con algo más?`;
    } else {
        const productKeywords = productName.split(' ');
        const partiallyFound = products.find(p => productKeywords.some(kw => p.name.toLowerCase().includes(kw)));
        if (partiallyFound) {
            return `No encontré un producto llamado exactamente "${productName}", pero tenemos ${partiallyFound.name}. ¿Te refieres a ese?`;
        }
    }
    
    return `Lo siento, no pude encontrar información sobre el producto "${productName}". ¿Puedes intentar con otro nombre o verificar la ortografía?`;
}


export async function askChatbot(message: string): Promise<string> {
  
  // In a real application, you might use a more sophisticated NLU to extract intent and entities.
  // For this example, we'll assume the user is asking about a product and use the message as the product name.
  const botResponse = await checkProductAvailability(message);

  try {
    const output: RephraseChatbotResponseOutput = await rephraseChatbotResponse({ chatbotResponse: botResponse });
    return output.rephrasedResponse;
  } catch (error) {
    console.error("Error rephrasing chatbot response:", error);
    // Fallback to the original response if the AI flow fails
    return botResponse;
  }
}
