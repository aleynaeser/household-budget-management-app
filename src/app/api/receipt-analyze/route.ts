import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { RECEIPT_ANALYSIS_PROMPT } from '@constants/receipt-prompt';
import { receiptAnalysisSchema } from '@constants/receipt-schema';

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "Resim URL'i gerekli" }, { status: 400 });
    }

    let base64Image: string;

    // Check if it's a data URI (from camera capture)
    if (imageUrl.startsWith('data:')) {
      // Extract base64 data from data URI
      const base64Data = imageUrl.split(',')[1];
      base64Image = base64Data;
    } else {
      // Fetch the image from URL
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Image = buffer.toString('base64');
    }

    const result = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: RECEIPT_ANALYSIS_PROMPT,
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: receiptAnalysisSchema,
      },
    });

    const analysisResult = JSON.parse(result.text || '{}');

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Fiş analiz hatası:', error);
    return NextResponse.json({ error: 'Fiş analizi sırasında bir hata oluştu' }, { status: 500 });
  }
}
