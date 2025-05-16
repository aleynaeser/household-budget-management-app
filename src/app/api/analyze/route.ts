import pdf from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';
import { AI_PROMPT } from '@constants/ai-prompt';
import { NextRequest, NextResponse } from 'next/server';
import { responseSchema } from '@constants/response-schema';

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileUrl } = body;

    // Fetch the PDF file
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF file
    const data = await pdf(buffer);
    const text = data.text;

    const result = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: text,
      config: {
        systemInstruction: AI_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    return NextResponse.json(result.text);
  } catch (error) {
    console.error('PDF analiz hatası:', error);
    return NextResponse.json({ error: 'PDF analizi sırasında bir hata oluştu' }, { status: 500 });
  }
}
