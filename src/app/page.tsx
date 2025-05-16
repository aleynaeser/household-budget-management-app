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
    <section>
      <div className='p-10'>
        <h1 className='text-center text-2xl font-extralight'>
          Household Budget Management <span className='font-bold'>with AI</span>
        </h1>

        <h2 className='pt-4 pb-10 text-center text-lg font-extralight text-[var(--gray-light)]'>
          <span className='font-bold'>Upload </span>your credit card statement
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

      {isPending && <div className='pb-10 text-center text-sm text-[var(--green)]'>PDF analiz ediliyor...</div>}

      {data && (
        <div className=''>
          <h3 className='border-y border-[var(--black-light)] p-10 text-center text-2xl font-extralight text-[var(--off-white)]'>
            <span className='font-bold'>Analysis </span>Result
          </h3>

          <div className='px-10 pt-4 pb-10 whitespace-pre-wrap'>
            {data.map((item, index) => (
              <div key={index}>
                <h4 className='py-8 text-2xl font-bold text-[var(--blue)] underline'>{item.title}</h4>

                <ul className='space-y-2'>
                  {item.content.map((content, index) => (
                    <li
                      key={index}
                      className={`pb-3 leading-8 ${content.startsWith('**') ? 'text-lg font-bold text-[var(--magenta)]' : 'ml-4 list-disc'}`}
                    >
                      {content}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
