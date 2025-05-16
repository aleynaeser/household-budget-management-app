'use server';

type ResponseSchema = {
  title: string;
  content: string[];
};

export const handleUploadComplete = async (res: { url: string }[]): Promise<ResponseSchema[] | undefined> => {
  const fileUrl = res[0].url;

  if (!fileUrl) return;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileUrl }),
    });

    const data = await response.json();
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

   
    return parsedData as ResponseSchema[];
  } catch (error) {
    throw new Error(`Upload error: ${error}`);
  }
};
