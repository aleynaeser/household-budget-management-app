'use server';

export const handleUploadComplete = async (res: { url: string }[]) => {
  const fileUrl = res[0].url;

  console.log(fileUrl, 'file');
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
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`Upload error: ${error}`);
  }
};
