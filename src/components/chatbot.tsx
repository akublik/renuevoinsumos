'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import { salesAssistant } from '@/ai/flows/sales-assistant';
import { getProducts } from '@/lib/product-service';
import type { Product } from '@/lib/products';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// A version of the Product type without fields that the AI doesn't need.
type ProductForAI = Omit<Product, 'images' | 'imageUrl' | 'technicalSheetUrl' | 'createdAt'>;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente virtual. Puedes preguntarme sobre nuestros productos, su stock, o su precio.',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [liveProducts, setLiveProducts] = useState<ProductForAI[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth(); // Get auth state

  useEffect(() => {
    // Fetch products when the chatbot is first opened.
    // The getProducts service now intelligently handles auth state.
    if (isOpen && liveProducts.length === 0) {
      const fetchProducts = async () => {
        try {
          const productsFromService = await getProducts();
          if (productsFromService && productsFromService.length > 0) {
            // Map to the AI-friendly format
            const productsForAI = productsFromService.map(
              ({ images, imageUrl, technicalSheetUrl, createdAt, ...rest }) => rest
            );
            setLiveProducts(productsForAI);
          } else {
             const errorMessage: Message = {
                role: 'assistant',
                content: 'No pude encontrar productos en el catálogo en este momento.',
             };
             setMessages((prev) => [...prev, errorMessage]);
          }
        } catch (error) {
          console.error("Failed to fetch products for chatbot:", error);
          const errorMessage: Message = {
            role: 'assistant',
            content: 'Lo siento, no pude cargar la lista de productos. Por favor, intenta de nuevo más tarde.',
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      };
      fetchProducts();
    }
  }, [isOpen]); // Rerun effect only when isOpen changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      if (liveProducts.length === 0) {
         const botMessage: Message = { role: 'assistant', content: "Lo siento, no tengo información sobre los productos en este momento para poder ayudarte." };
         setMessages((prev) => [...prev, botMessage]);
         setIsLoading(false);
         return;
      }
      const chatHistory = [...messages, userMessage];
      const { response } = await salesAssistant({
        history: chatHistory,
        products: liveProducts,
      });
      const botMessage: Message = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching bot response:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Lo siento, algo salió mal. Por favor, intenta de nuevo.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className="rounded-full w-14 h-14 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <Card className="w-80 md:w-96 shadow-xl rounded-2xl chatbot-height flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-4 bg-accent text-accent-foreground rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Bot className="h-6 w-6" />
                <CardTitle className="text-lg font-bold">Asistente de Ventas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-end gap-2',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] px-4 py-2 rounded-xl text-sm shadow-md',
                      msg.role === 'user'
                        ? 'bg-primary/80 text-primary-foreground rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
               {isLoading && (
                 <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 rounded-xl rounded-bl-none px-4 py-2 text-sm shadow-md">
                      Escribiendo...
                    </div>
                  </div>
                )}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 rounded-full focus:ring-2 focus:ring-accent"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
