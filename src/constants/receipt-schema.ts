import { Schema, Type } from '@google/genai';

export const receiptAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    content: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        propertyOrdering: ['title', 'content'],
      },
    },
    receiptAnalyze: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        marketName: { type: Type.STRING },
        date: { type: Type.STRING },
        totalAmount: { type: Type.STRING },
        expenses: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              parentCategory: { type: Type.STRING },
              subCategory: { type: Type.STRING },
              amount: { type: Type.STRING },
              isMostCheap: { type: Type.BOOLEAN },
              isMostExpensive: { type: Type.BOOLEAN },
            },
            propertyOrdering: ['parentCategory', 'subCategory', 'amount', 'isMostCheap', 'isMostExpensive'],
          },
        },
      },
      propertyOrdering: ['id', 'marketName', 'date', 'totalAmount', 'expenses'],
    },
  },
  propertyOrdering: ['content', 'receiptAnalyze'],
};
