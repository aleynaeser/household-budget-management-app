'use client';

import { useState } from 'react';

import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { UploadButton } from '@uploadthing/react';
import { AppFileRouter } from '@api/uploadthing/core';
import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { handleImageUploadComplete } from '@actions/image-upload.action';
import { ReceiptAnalysisDisplay } from '@components/ReceiptAnalysisDisplay';
import Camera, { FACING_MODES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';

export default function ReceiptAnalyzePage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const { saveReceiptData } = useLocalStorage();

  const {
    data: analysis,
    isPending,
    mutate,
    reset,
  } = useMutation({
    mutationFn: async (res: { url: string }[]) => {
      const imageUrl = res[0]?.url;
      if (!imageUrl) {
        throw new Error("Resim URL'i bulunamadı");
      }
      setImageUrl(imageUrl);
      return handleImageUploadComplete(res);
    },
    onSuccess: (data) => {
      const payload = {
        id: data?.receiptAnalyze?.id || `fis-${Date.now()}`,
        timestamp: Date.now(),
        imageUrl: imageUrl ?? '',
        analysis: data,
      } as ILocalReceiptData;

      saveReceiptData(payload);
    },
    onError: (error) => {
      console.error('Analysis error:', error);
      toast.error(`Analiz hatası: ${error.message}`);
    },
  });

  const resetState = () => {
    setImageUrl(null);
    reset();
  };

  console.log('analysis', imageUrl);

  return (
    <section className='p-6'>
      <div className='mb-8 text-center'>
        <h1 className='mb-2 text-3xl font-bold text-white'>Receipt Analyzer</h1>
        <p className='text-gray-400'>Take a photo of your receipt or upload a file</p>
      </div>

      {!imageUrl && !analysis && (
        <div className='mx-auto max-w-2xl space-y-6'>
          <div className='text-center'>
            <div className='rounded-lg border-2 border-dashed border-[var(--black-light)] p-8'>
              <div className='flex flex-col items-center justify-center gap-4 md:flex-row'>
                <UploadButton<AppFileRouter, 'imageUploader'>
                  endpoint={(route) => route.imageUploader}
                  onClientUploadComplete={mutate}
                  appearance={{
                    allowedContent: 'pt-6 flex h-8 flex-col items-center justify-center px-2 text-white',
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Yükleme hatası: ${error.message}`);
                  }}
                />

                <div className='mx-4 text-gray-400'>or</div>

                <button
                  onClick={() => setShowCamera(true)}
                  className='rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700'
                >
                  Kamerayı Aç
                </button>
              </div>
            </div>
          </div>

          {showCamera && (
            <div className='fixed inset-0 z-50 bg-black'>
              <button
                onClick={() => setShowCamera(false)}
                className='absolute top-4 right-4 z-10 rounded-md bg-white/20 px-3 py-1 text-white hover:bg-white/30'
              >
                Kapat
              </button>

              <Camera
                isFullscreen={true}
                isImageMirror={false}
                idealFacingMode={FACING_MODES.ENVIRONMENT}
                onTakePhoto={(dataUri) => {
                  mutate([{ url: dataUri }]);
                  setShowCamera(false);
                }}
              />
            </div>
          )}
        </div>
      )}

      {imageUrl && !analysis && (
        <div className='mx-auto max-w-2xl space-y-6'>
          <div className='text-center'>
            <img src={imageUrl} alt='Yüklenen fiş' className='mx-auto h-auto max-w-full rounded-lg border border-gray-600' />
          </div>

          {isPending && (
            <div className='py-8 text-center'>
              <Loader2 className='mx-auto mb-4 h-8 w-8 animate-spin text-blue-500' />
              <p className='text-gray-400'>Fiş analiz ediliyor...</p>
            </div>
          )}
        </div>
      )}

      {analysis && (
        <div className='mx-auto max-w-4xl'>
          <ReceiptAnalysisDisplay analysis={analysis} imageUrl={imageUrl} onReset={resetState} />
        </div>
      )}
    </section>
  );
}
