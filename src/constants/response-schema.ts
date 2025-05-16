import { Schema, Type } from '@google/genai';

export const responseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      content: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    propertyOrdering: ['title', 'content'],
  },
};
