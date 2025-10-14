export default {};

declare global {
  type TExpense = {
    parentCategory: string;
    subCategory: string;
    amount: string;
    isMostCheap?: boolean;
    isMostExpensive?: boolean;
  };

  interface IReceiptAnalyze {
    id: string;
    marketName: string;
    date: string;
    totalAmount: string;
    expenses: TExpense[];
  }

  interface IAnalysisContent {
    title: string;
    content: string[];
  }

  interface IReceiptAnalysisResponse {
    content: IAnalysisContent[];
    receiptAnalyze: IReceiptAnalyze;
  }

  interface ILocalReceiptData {
    id: string;
    timestamp: number;
    imageUrl: string;
    analysis: IReceiptAnalysisResponse;
  }

  interface ICameraUploadProps {
    onImageCapture: (imageFile: File) => void;
    onImageUpload: (imageFile: File) => void;
  }

  interface IReceiptAnalysisState {
    imageUrl: string | null;
    analysis: IReceiptAnalysisResponse | null;
  }

  type ResponseSchema = {
    title: string;
    content: string[];
  };
}
