import { useMutation } from '@tanstack/react-query';

export function useReceiptAnalysis() {
  const analyzeReceipt = async (imageUrl: string): Promise<IReceiptAnalysisResponse | null> => {
    try {
      const response = await fetch('/api/receipt-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Analiz başarısız');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Analiz hatası:', error);
      throw error;
    }
  };

  const mutation = useMutation({
    mutationFn: analyzeReceipt,
  });

  return {
    analyzeReceipt,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}
