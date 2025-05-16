import OpenAI from 'openai';
import pdf from 'pdf-parse';
import { AI_PROMPT } from '@constants/ai-prompt';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: AI_PROMPT,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      model: 'gpt-3.5-turbo',
    });

    return NextResponse.json({
      analysis: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error('PDF analiz hatası:', error);
    return NextResponse.json({ error: 'PDF analizi sırasında bir hata oluştu' }, { status: 500 });
  }
}
