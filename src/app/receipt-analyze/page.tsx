'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { UploadButton } from '@uploadthing/react';
import { Loader2 } from 'lucide-react';

import { AppFileRouter } from '@api/uploadthing/core';
import { useReceiptAnalysis } from '@hooks/useReceiptAnalysis';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { CameraUpload } from '@components/CameraUpload';
import { ReceiptAnalysisDisplay } from '@components/ReceiptAnalysisDisplay';

export default function ReceiptAnalyzePage() {
  const [state, setState] = useState<IReceiptAnalysisState>({
    isLoading: false,
    imageUrl: null,
    analysis: null,
    error: null,
  });

  const { analyzeReceipt } = useReceiptAnalysis();
  const { saveReceiptData } = useLocalStorage();

  const handleUploadComplete = async (res: { url: string }[]) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const imageUrl = res[0].url;
      setState((prev) => ({ ...prev, imageUrl }));

      // Analyze the receipt
      const analysis = await analyzeReceipt(imageUrl);

      if (analysis) {
        setState((prev) => ({ ...prev, analysis, isLoading: false }));

        // Save to local storage
        const receiptData: ILocalReceiptData = {
          id: analysis.receiptAnalyze.id,
          timestamp: Date.now(),
          imageUrl: imageUrl,
          analysis,
        };

        saveReceiptData(receiptData);
        toast.success('Fiş analizi tamamlandı ve kaydedildi!');
      }
    } catch (error) {
      console.error('Analiz hatası:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      }));
      toast.error('Fiş analizi sırasında bir hata oluştu');
    }
  };

  const handleImageCapture = async (imageFile: File) => {
    // For camera capture, we'll use UploadButton programmatically
    // This is a simplified approach - in production you might want to handle this differently
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch('/api/uploadthing', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.url) {
        await handleUploadComplete([{ url: result.url }]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Resim yüklenirken hata oluştu');
    }
  };

  const handleImageUpload = async (imageFile: File) => {
    await handleImageCapture(imageFile);
  };

  const resetState = () => {
    setState({
      isLoading: false,
      imageUrl: null,
      analysis: null,
      error: null,
    });
  };

  return (
    <section className='p-6'>
      <div className='mb-8 text-center'>
        <h1 className='mb-2 text-3xl font-bold text-white'>Fiş Analizi</h1>
        <p className='text-gray-400'>Kamera ile fiş fotoğrafı çekin veya dosya yükleyin</p>
      </div>

      {!state.imageUrl && !state.analysis && (
        <div className='mx-auto max-w-2xl space-y-6'>
          <CameraUpload onImageCapture={handleImageCapture} onImageUpload={handleImageUpload} isLoading={state.isLoading} />

          <div className='text-center'>
            <p className='mb-4 text-gray-400'>veya</p>
            <div className='rounded-lg border-2 border-dashed border-[var(--black-light)] p-8'>
              <UploadButton<AppFileRouter, 'imageUploader'>
                endpoint={(route) => route.imageUploader}
                onClientUploadComplete={handleUploadComplete}
                appearance={{
                  allowedContent: 'pt-6 flex h-8 flex-col items-center justify-center px-2 text-white',
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Yükleme hatası: ${error.message}`);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {state.imageUrl && !state.analysis && (
        <div className='mx-auto max-w-2xl space-y-6'>
          <div className='text-center'>
            <img
              src={state.imageUrl}
              alt='Yüklenen fiş'
              className='mx-auto h-auto max-w-full rounded-lg border border-gray-600'
            />
          </div>

          {state.isLoading && (
            <div className='py-8 text-center'>
              <Loader2 className='mx-auto mb-4 h-8 w-8 animate-spin text-blue-500' />
              <p className='text-gray-400'>Fiş analiz ediliyor...</p>
            </div>
          )}

          {state.error && (
            <div className='py-8 text-center'>
              <p className='mb-4 text-red-500'>{state.error}</p>
              <button onClick={resetState} className='rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600'>
                Tekrar Dene
              </button>
            </div>
          )}
        </div>
      )}

      {state.analysis && (
        <div className='mx-auto max-w-4xl'>
          <ReceiptAnalysisDisplay analysis={state.analysis} imageUrl={state.imageUrl} onReset={resetState} />
        </div>
      )}
    </section>
  );
}
