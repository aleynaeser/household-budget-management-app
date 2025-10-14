import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { RECEIPT_ANALYSIS_PROMPT } from '@constants/receipt-prompt';
import { receiptAnalysisSchema } from '@constants/receipt-schema';

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function POST(req: NextRequest) {
  try {
    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY environment variable is not set');
      return NextResponse.json({ error: 'API anahtarı bulunamadı' }, { status: 500 });
    }
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
      if (!base64Data) {
        return NextResponse.json({ error: 'Geçersiz data URI formatı' }, { status: 400 });
      }
      base64Image = base64Data;
    } else {
      // Fetch the image from URL
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          return NextResponse.json({ error: `Resim yüklenemedi: ${response.status}` }, { status: 400 });
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        base64Image = buffer.toString('base64');
      } catch (fetchError) {
        console.error('Image fetch error:', fetchError);
        return NextResponse.json({ error: 'Resim yüklenirken hata oluştu' }, { status: 400 });
      }
    }

    try {
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

      if (!result.text) {
        return NextResponse.json({ error: "Gemini API'den yanıt alınamadı" }, { status: 500 });
      }

      const analysisResult = JSON.parse(result.text);
      return NextResponse.json(analysisResult);
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      return NextResponse.json({ error: 'AI analizi sırasında hata oluştu' }, { status: 500 });
    }
  } catch (error) {
    console.error('Fiş analiz hatası:', error);
    return NextResponse.json({ error: 'Fiş analizi sırasında bir hata oluştu' }, { status: 500 });
  }
}
