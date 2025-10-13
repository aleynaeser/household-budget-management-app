'use server';

import { UploadThingError } from 'uploadthing/server';

export async function handleImageUploadComplete(res: { url: string }[]) {
  try {
    if (!res || res.length === 0) {
      throw new Error('Resim yüklenemedi');
    }

    const imageUrl = res[0].url;

    // Resim URL'ini döndür
    return { url: imageUrl };
  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    throw new UploadThingError('Resim yüklenirken bir hata oluştu');
  }
}
