import { useState, useEffect } from 'react';

const STORAGE_KEY = 'receipt-analysis-data';

export function useLocalStorage() {
  const [receiptHistory, setReceiptHistory] = useState<ILocalReceiptData[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setReceiptHistory(parsed);
      }
    } catch (error) {
      console.error('Local storage okuma hatası:', error);
    }
  }, []);

  const saveReceiptData = (data: ILocalReceiptData) => {
    try {
      const updatedHistory = [...receiptHistory, data];
      setReceiptHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Local storage yazma hatası:', error);
    }
  };

  const getReceiptHistory = (): ILocalReceiptData[] => {
    return receiptHistory;
  };

  const getReceiptById = (id: string): ILocalReceiptData | undefined => {
    return receiptHistory.find((receipt) => receipt.id === id);
  };

  const deleteReceipt = (id: string) => {
    try {
      const updatedHistory = receiptHistory.filter((receipt) => receipt.id !== id);
      setReceiptHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Local storage silme hatası:', error);
    }
  };

  const clearAllReceipts = () => {
    try {
      setReceiptHistory([]);
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Local storage temizleme hatası:', error);
    }
  };

  const getTotalSpent = (): number => {
    return receiptHistory.reduce((total, receipt) => {
      const amount = parseFloat(receipt.analysis.receiptAnalyze.totalAmount.replace(/[^\d.,]/g, '').replace(',', '.'));
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  const getCategoryStats = () => {
    const categoryTotals: { [key: string]: number } = {};

    receiptHistory.forEach((receipt) => {
      receipt.analysis.receiptAnalyze.expenses.forEach((expense) => {
        const amount = parseFloat(expense.amount.replace(/[^\d.,]/g, '').replace(',', '.'));
        if (!isNaN(amount)) {
          const key = expense.parentCategory || 'Diğer';
          categoryTotals[key] = (categoryTotals[key] || 0) + amount;
        }
      });
    });

    return Object.entries(categoryTotals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  };

  return {
    receiptHistory,
    saveReceiptData,
    getReceiptHistory,
    getReceiptById,
    deleteReceipt,
    clearAllReceipts,
    getTotalSpent,
    getCategoryStats,
  };
}
