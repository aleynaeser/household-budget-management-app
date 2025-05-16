'use client';

import { toast } from 'sonner';
import { UploadButton } from '@uploadthing/react';
import { useMutation } from '@tanstack/react-query';
import { AppFileRouter } from '@api/uploadthing/core';
import { handleUploadComplete } from '@actions/upload.action';

export default function Home() {
  const { data, isPending, mutate } = useMutation({
    mutationFn: async (res: { url: string }[]) => handleUploadComplete(res),
  });

  return (
    <section className=''>
      <div className='p-10'>
        <h1 className='text-center text-2xl font-thin'>
          Household Budget Management <strong>with AI </strong>
        </h1>

        <h2 className='pt-4 pb-10 text-center text-lg font-thin text-[var(--gray-light)]'>
          <strong>Upload </strong>your credit card statement
        </h2>

        <div className='rounded-lg border-2 border-dashed border-[var(--black-light)] p-8 text-center'>
          <UploadButton<AppFileRouter, 'pdfUploader'>
            endpoint={(route) => route.pdfUploader}
            onClientUploadComplete={mutate}
            appearance={{
              allowedContent: 'pt-6 flex h-8 flex-col items-center justify-center px-2 text-white',
            }}
            onUploadError={(error: Error) => {
              toast.error(`Yükleme hatası: ${error.message}`);
            }}
          />
        </div>
      </div>

      {isPending && (
        <div className='pb-10 text-center text-sm text-[var(--green)]'>
          <p>PDF analiz ediliyor...</p>
        </div>
      )}

      {/* {data && (
        <div className=''>
          <h3 className='border-b border-[var(--black-light)] px-10 pb-10 text-center text-lg font-thin text-[var(--off-white)]'>
            <strong>Analysis </strong>Result
          </h3>

          <p className='p-10 whitespace-pre-wrap'>{data}</p>
        </div>
      )} */}
    </section>
  );
}
