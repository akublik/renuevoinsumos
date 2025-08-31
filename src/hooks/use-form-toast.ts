
import { useToast } from "@/hooks/use-toast";

export const useFormToast = () => {
  const { toast: baseToast } = useToast();

  const toast = (options: { title: string; description?: string }) => {
    baseToast({
      title: options.title,
      description: options.description,
    });
  };

  const toastError = (message: string) => {
    baseToast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  return { toast, toastError };
};
