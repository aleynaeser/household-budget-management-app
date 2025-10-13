import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const appFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: '4MB' } }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),
} satisfies FileRouter;

export type AppFileRouter = typeof appFileRouter;
