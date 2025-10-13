export interface TExpense {
  category: string;
  amount: string;
  isMostCheap?: boolean;
  isMostExpensive?: boolean;
}

export interface IReceiptAnalyze {
  id: string;
  marketName: string;
  date: string;
  totalAmount: string;
  expenses: TExpense[];
}

export interface IAnalysisContent {
  title: string;
  content: string[];
}

export interface IReceiptAnalysisResponse {
  content: IAnalysisContent[];
  receiptAnalyze: IReceiptAnalyze;
}

export interface ILocalReceiptData {
  id: string;
  timestamp: number;
  imageUrl: string;
  analysis: IReceiptAnalysisResponse;
}

export interface ICameraUploadProps {
  onImageCapture: (imageFile: File) => void;
  onImageUpload: (imageFile: File) => void;
}

export interface IReceiptAnalysisState {
  isLoading: boolean;
  imageUrl: string | null;
  analysis: IReceiptAnalysisResponse | null;
  error: string | null;
}
