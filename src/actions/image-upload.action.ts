'use server';

export async function handleImageUploadComplete(res: { url: string }[]) {
  const imageUrl = res[0].url;

  console.log('imageUrl', imageUrl);

  if (!imageUrl) return;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receipt-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    const data = await response.json();
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

    return parsedData as IReceiptAnalysisResponse;
  } catch (error) {
    throw new Error(`Upload error: ${error}`);
  }
}
